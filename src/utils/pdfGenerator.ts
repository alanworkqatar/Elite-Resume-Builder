import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';

export interface PdfExportOptions {
  filename?: string;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (err: any) => void;
}

/**
 * Downloads the resume canvas directly as an exact A4 PDF document.
 * 
 * Key improvements against stretching, distortion & cross-origin security errors:
 * 1. Freezes any active CSS transitions/transforms on wrapper before capturing.
 * 2. Uses `toCanvas` directly with `skipFonts: true` to prevent `SecurityError`
 *    when accessing cross-origin `CSSStyleSheet.cssRules`.
 * 3. Uses high-DPI rasterization (pixelRatio 2.0) with strict white background.
 * 4. Calculates the exact mathematical A4 height (297/210 ratio) for the captured width.
 * 5. Eliminates intermediate image-dataurl re-encoding to avoid image loading errors.
 */
export async function downloadResumeAsPdf(
  elementId = 'resume-print-canvas',
  options: PdfExportOptions = {}
): Promise<void> {
  const {
    filename = 'Executive_Resume.pdf',
    onStart,
    onSuccess,
    onError,
  } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    const err = new Error(`Resume preview element with id "${elementId}" not found.`);
    if (onError) onError(err);
    throw err;
  }

  const wrapper = document.getElementById('resume-print-wrapper');
  const prevTransform = wrapper ? wrapper.style.transform : '';
  const prevTransition = wrapper ? wrapper.style.transition : '';

  try {
    if (onStart) onStart();

    // 1. Instantly freeze transition and set scale to 1:1 so capture is pristine
    if (wrapper) {
      wrapper.style.transition = 'none';
      wrapper.style.transform = 'scale(1)';
    }

    // Force browser reflow
    void element.offsetHeight;

    // Small delay for DOM layout to settle at scale(1)
    await new Promise((resolve) => setTimeout(resolve, 80));

    const pageSheets = Array.from(element.querySelectorAll<HTMLElement>('.resume-page-sheet'));

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const a4WidthMm = 210;
    const a4HeightMm = 297;

    if (pageSheets.length > 0) {
      // Multi-sheet discrete rendering: capture each page sheet individually
      for (let i = 0; i < pageSheets.length; i++) {
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }
        const sheetCanvas = await toCanvas(pageSheets[i], {
          pixelRatio: 2.0,
          width: 794,
          height: 1123,
          backgroundColor: '#ffffff',
          skipFonts: true,
          cacheBust: false,
        });

        const sheetImgData = sheetCanvas.toDataURL('image/jpeg', 0.96);
        pdf.addImage(sheetImgData, 'JPEG', 0, 0, a4WidthMm, a4HeightMm, undefined, 'FAST');
      }
    } else {
      // Continuous canvas fallback: slice captured canvas across A4 pages
      const capturedCanvas = await toCanvas(element, {
        pixelRatio: 2.0,
        backgroundColor: '#ffffff',
        cacheBust: false,
        skipFonts: true,
      });

      const imgWidth = capturedCanvas.width;
      const imgHeight = capturedCanvas.height;
      const a4Ratio = a4HeightMm / a4WidthMm;
      const pageHeightPx = Math.round(imgWidth * a4Ratio);
      const totalPages = Math.max(1, Math.ceil(imgHeight / pageHeightPx));

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage('a4', 'portrait');
        }
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = pageHeightPx;
        const ctx = pageCanvas.getContext('2d');
        if (!ctx) continue;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        const srcY = page * pageHeightPx;
        const remainingHeight = imgHeight - srcY;
        const sliceHeight = Math.min(pageHeightPx, remainingHeight);

        ctx.drawImage(
          capturedCanvas,
          0, srcY, imgWidth, sliceHeight,
          0, 0, imgWidth, sliceHeight
        );

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.96);
        pdf.addImage(pageImgData, 'JPEG', 0, 0, a4WidthMm, a4HeightMm, undefined, 'FAST');
      }
    }

    const sanitizedFilename = filename.endsWith('.pdf')
      ? filename
      : `${filename.replace(/[^a-zA-Z0-9_\-.]/g, '_')}.pdf`;

    pdf.save(sanitizedFilename);

    if (onSuccess) onSuccess();
  } catch (error) {
    console.warn('PDF export capture notice:', error);
    if (onError) onError(error);
    throw error;
  } finally {
    // Restore previous wrapper zoom and transition
    if (wrapper) {
      wrapper.style.transition = prevTransition;
      wrapper.style.transform = prevTransform;
    }
  }
}
