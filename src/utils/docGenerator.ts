import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ImageRun,
  ShadingType,
  Footer,
  PageNumber,
} from 'docx';
import { ResumeData, TemplateStyle } from '../types/resume';

/**
 * Prepares candidate avatar on offscreen canvas.
 * Loads image via blob data-URL to bypass any CORS/tainting issues.
 * Clips to photoShape ('circle', 'rounded', 'square') and paints a crisp white border ring.
 */
async function prepareCandidateAvatar(
  photoUrl?: string,
  shape: 'circle' | 'rounded' | 'square' = 'square',
  fullName: string = ''
): Promise<{ dataUrl: string; base64Raw: string; width: number; height: number }> {
  const size = 200; // 200x200 high-DPI canvas
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const roundRect = (
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  };

  const drawInitials = () => {
    if (!ctx) return { dataUrl: '', base64Raw: '', width: 88, height: 88 };
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#0f172a';

    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (shape === 'rounded') {
      roundRect(ctx, 4, 4, size - 8, size - 8, 24);
      ctx.fill();
    } else {
      roundRect(ctx, 4, 4, size - 8, size - 8, 8);
      ctx.fill();
    }

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 5;
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
      ctx.stroke();
    } else if (shape === 'rounded') {
      roundRect(ctx, 4, 4, size - 8, size - 8, 24);
      ctx.stroke();
    } else {
      roundRect(ctx, 4, 4, size - 8, size - 8, 8);
      ctx.stroke();
    }

    const initials = (fullName || 'CV')
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 64px Calibri, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, size / 2, size / 2);

    const dataUrl = canvas.toDataURL('image/png');
    const commaIndex = dataUrl.indexOf(',');
    return {
      dataUrl,
      base64Raw: commaIndex !== -1 ? dataUrl.substring(commaIndex + 1) : '',
      width: 88,
      height: 88,
    };
  };

  if (!photoUrl || !photoUrl.trim() || !ctx) {
    return drawInitials();
  }

  try {
    const trimmed = photoUrl.trim();
    let imageSrc = trimmed;

    // Convert local/remote URLs to blob data URL first to eliminate cross-origin restrictions
    if (!trimmed.startsWith('data:image/')) {
      try {
        const res = await fetch(trimmed);
        if (res.ok) {
          const blob = await res.blob();
          imageSrc = await new Promise<string>((resBlob, rejBlob) => {
            const reader = new FileReader();
            reader.onloadend = () => resBlob(reader.result as string);
            reader.onerror = rejBlob;
            reader.readAsDataURL(blob);
          });
        }
      } catch (fetchErr) {
        console.warn('Direct blob fetch failed, falling back to direct image loading:', fetchErr);
      }
    }

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      if (!imageSrc.startsWith('data:image/')) {
        el.crossOrigin = 'anonymous';
      }
      el.onload = () => resolve(el);
      el.onerror = (e) => reject(e);
      el.src = imageSrc;
    });

    ctx.clearRect(0, 0, size, size);
    ctx.save();

    // Clip path according to selected shape
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 5, 0, Math.PI * 2);
      ctx.clip();
    } else if (shape === 'rounded') {
      roundRect(ctx, 5, 5, size - 10, size - 10, 24);
      ctx.clip();
    } else {
      roundRect(ctx, 5, 5, size - 10, size - 10, 8);
      ctx.clip();
    }

    // Cover crop the image centered or top aligned
    const nw = img.naturalWidth || size;
    const nh = img.naturalHeight || size;
    const imgAspect = nw / nh;
    let sx = 0,
      sy = 0,
      sw = nw,
      sh = nh;

    if (imgAspect > 1) {
      sw = nh;
      sx = (nw - sw) / 2;
    } else {
      sh = nw;
      sy = 0; // Top-aligned
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
    ctx.restore();

    // Paint crisp white border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 6;
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (shape === 'rounded') {
      roundRect(ctx, 5, 5, size - 10, size - 10, 24);
      ctx.stroke();
    } else {
      roundRect(ctx, 5, 5, size - 10, size - 10, 8);
      ctx.stroke();
    }

    const dataUrl = canvas.toDataURL('image/png');
    const commaIndex = dataUrl.indexOf(',');
    return {
      dataUrl,
      base64Raw: commaIndex !== -1 ? dataUrl.substring(commaIndex + 1) : '',
      width: 88,
      height: 88,
    };
  } catch (err) {
    console.warn('Failed to render photo on canvas for Word export, using initials fallback:', err);
    return drawInitials();
  }
}

/**
 * Downloads resume in standard Microsoft Word (.doc) format.
 * Embeds photo preset in all formats and uses Awards / Certificates terminology.
 */
export async function downloadResumeAsDoc(
  data: ResumeData,
  customFilename?: string,
  templateStyle: TemplateStyle = 'executive-two-column'
): Promise<void> {
  const p = data.personal || {};
  const candidateName = (p.fullName || 'Executive_Resume').trim();
  const filename = customFilename || `${candidateName.replace(/\s+/g, '_')}_Resume.doc`;

  const avatar = await prepareCandidateAvatar(p.photoUrl, p.photoShape, p.fullName);

  let bodyContent = '';

  if (templateStyle === 'executive-two-column') {
    // ─────────────────────────────────────────────────────────────────────────
    // EXECUTIVE TWO-COLUMN TEMPLATE (Navy sidebar + White main column)
    // ─────────────────────────────────────────────────────────────────────────
    bodyContent = `
<table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 540pt; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
  <tr>
    <!-- LEFT SIDEBAR (~33% width, Deep Navy #1E3A5F) -->
    <td width="175" valign="top" bgcolor="#1E3A5F" style="width: 175pt; max-width: 175pt; background-color: #1E3A5F; color: #FFFFFF; vertical-align: top; padding: 14pt 10pt 14pt 10pt;">
      ${
        avatar.dataUrl
          ? `
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 8pt;">
        <tr>
          <td align="center" style="text-align: center;">
            <img src="${avatar.dataUrl}" width="80" height="80" alt="${candidateName}" style="width: 80px; height: 80px; display: block; margin: 0 auto; border: 0;" />
          </td>
        </tr>
      </table>
      `
          : ''
      }

      <div style="font-size: 11pt; font-weight: bold; letter-spacing: 1.5pt; color: #7DD3FC; text-transform: uppercase; border-bottom: 1pt solid #38648c; padding-bottom: 2pt; margin-top: 4pt; margin-bottom: 4pt;">
        C O N T A C T &nbsp; M E &nbsp; A T
      </div>
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 10.5pt; color: #FFFFFF; line-height: 1.25; margin-bottom: 8pt;">
        ${p.location ? `<tr><td style="padding: 2pt 0;"><span style="color: #7DD3FC;">📍</span> ${p.location}</td></tr>` : ''}
        ${p.email ? `<tr><td style="padding: 2pt 0;"><span style="color: #7DD3FC;">✉</span> ${p.email}</td></tr>` : ''}
        ${p.phone ? `<tr><td style="padding: 2pt 0;"><span style="color: #7DD3FC;">📞</span> <b>${p.phone}</b></td></tr>` : ''}
        ${p.passportNo ? `<tr><td style="padding: 2pt 0; font-size: 10pt; color: #cbd5e1;">Passport: ${p.passportNo}</td></tr>` : ''}
      </table>

      ${
        data.skills && data.skills.length > 0
          ? `
      <div style="font-size: 11pt; font-weight: bold; letter-spacing: 1.5pt; color: #7DD3FC; text-transform: uppercase; border-bottom: 1pt solid #38648c; padding-bottom: 2pt; margin-top: 8pt; margin-bottom: 4pt;">
        S K I L L S &nbsp; S U M M A R Y
      </div>
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 10.5pt; color: #FFFFFF; line-height: 1.25;">
        ${data.skills.map((s) => `<tr><td style="padding: 1.5pt 0;">${s.name} <span style="color: #38bdf8;">(${s.rating}/5)</span></td></tr>`).join('')}
      </table>
      `
          : ''
      }

      ${
        data.awards && data.awards.length > 0
          ? `
      <div style="font-size: 11pt; font-weight: bold; letter-spacing: 1.5pt; color: #7DD3FC; text-transform: uppercase; border-bottom: 1pt solid #38648c; padding-bottom: 2pt; margin-top: 8pt; margin-bottom: 4pt;">
        A W A R D S &nbsp;/&nbsp; C E R T I F I C A T E S
      </div>
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 10.5pt; color: #FFFFFF; line-height: 1.25;">
        ${data.awards.map((a) => `<tr><td style="padding: 1.5pt 0;">🔖 ${a.title} <span style="color: #94a3b8; font-size: 10pt;">${a.years || ''}</span></td></tr>`).join('')}
      </table>
      `
          : ''
      }

      ${
        p.availability
          ? `
      <div style="margin-top: 12pt; text-align: center; border: 1pt solid #38bdf8; background-color: #164e63; padding: 4pt 6pt; font-size: 10pt; font-weight: bold; color: #e0f2fe;">
        ${p.availability}
      </div>
      `
          : ''
      }
    </td>

    <!-- RIGHT MAIN BODY (~67% width, Pure White) -->
    <td width="365" valign="top" bgcolor="#FFFFFF" style="width: 365pt; background-color: #FFFFFF; color: #1E293B; vertical-align: top; padding: 14pt 16pt 14pt 16pt;">
      <div style="border-bottom: 2pt solid #0284C7; padding-bottom: 4pt; margin-bottom: 8pt;">
        <div style="font-size: 22pt; font-weight: bold; color: #1E3A5F; text-transform: uppercase;">
          ${p.fullName || 'EXECUTIVE CANDIDATE'}
        </div>
        ${p.headline ? `<div style="font-size: 12pt; font-weight: bold; color: #64748B; text-transform: uppercase;">${p.headline}</div>` : ''}
      </div>

      ${
        data.summary
          ? `
      <div style="font-size: 11pt; font-weight: bold; letter-spacing: 1.5pt; color: #0284C7; text-transform: uppercase; margin-bottom: 4pt; border-bottom: 1.5pt solid #0284C7; padding-bottom: 2pt;">
        P R O F I L E &nbsp; S U M M A R Y
      </div>
      <p style="font-size: 10.5pt; line-height: 1.35; color: #334155; text-align: left; margin: 0 0 10pt 0;">
        ${data.summary}
      </p>
      `
          : ''
      }

      ${
        data.experience && data.experience.length > 0
          ? `
      <div style="font-size: 11pt; font-weight: bold; letter-spacing: 1.5pt; color: #0284C7; text-transform: uppercase; margin-top: 8pt; margin-bottom: 4pt; border-bottom: 1.5pt solid #0284C7; padding-bottom: 2pt;">
        W O R K &nbsp; E X P E R I E N C E
      </div>
      ${data.experience
        .map((exp) => {
          const highlights = (exp.highlights || []).filter(Boolean);
          const achievements = (exp.achievements || []).filter(Boolean);
          return `
        <div style="margin-bottom: 10pt;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 2pt;">
            <tr>
              <td align="left" style="font-size: 11.5pt; font-weight: bold; color: #1E3A5F; text-align: left;">${exp.jobTitle}</td>
              <td align="right" style="font-size: 10pt; font-weight: bold; color: #64748B; text-align: right; white-space: nowrap;">${exp.duration}</td>
            </tr>
            <tr>
              <td align="left" style="font-size: 10.5pt; font-style: italic; color: #475569; text-align: left;">${exp.company}</td>
              <td align="right" style="font-size: 10pt; color: #64748B; text-align: right; white-space: nowrap;">${exp.location || ''}</td>
            </tr>
          </table>
          ${highlights.length > 0 ? `<ul style="margin: 2pt 0 4pt 0; padding-left: 14pt; list-style-type: disc;">${highlights.map((h) => `<li style="font-size: 10.5pt; line-height: 1.3; color: #334155; margin-bottom: 2pt; text-align: left;">${h}</li>`).join('')}</ul>` : ''}
          ${achievements.length > 0 ? `<div style="margin: 3pt 0 4pt 0; padding-left: 6pt; border-left: 2pt solid #0284C7;"><b style="font-size: 10pt; color: #1E3A5F; display: block; margin-bottom: 2pt;">Key Achievements:</b><ul style="margin: 0; padding-left: 14pt; list-style-type: circle;">${achievements.map((a) => `<li style="font-size: 10.5pt; line-height: 1.3; color: #334155; margin-bottom: 2pt; text-align: left;">${a}</li>`).join('')}</ul></div>` : ''}
        </div>
      `;
        })
        .join('')}
      `
          : ''
      }

      ${
        data.education && data.education.length > 0
          ? `
      <div style="font-size: 11pt; font-weight: bold; letter-spacing: 1.5pt; color: #0284C7; text-transform: uppercase; margin-top: 8pt; margin-bottom: 4pt; border-bottom: 1.5pt solid #0284C7; padding-bottom: 2pt;">
        E D U C A T I O N &nbsp; Q U A L I F I C A T I O N
      </div>
      <div>
        ${data.education
          .map(
            (edu) => `
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 4pt;">
            <tr>
              <td align="left" style="font-size: 10.5pt; font-weight: bold; color: #1E3A5F; text-align: left;">${edu.school}</td>
              <td align="right" style="font-size: 10pt; color: #64748B; text-align: right; white-space: nowrap;">${edu.duration || ''}</td>
            </tr>
            <tr>
              <td colspan="2" align="left" style="font-size: 10.5pt; font-style: italic; color: #475569; text-align: left;">${edu.degree}</td>
            </tr>
          </table>
        `
          )
          .join('')}
      </div>
      `
          : ''
      }
    </td>
  </tr>
</table>
    `;
  } else {
    // ─────────────────────────────────────────────────────────────────────────
    // ATS SINGLE-COLUMN FORMATS WITH PHOTO PRESET & AWARDS / CERTIFICATES
    // ─────────────────────────────────────────────────────────────────────────
    const isCorporate = templateStyle === 'ats-corporate-clean';
    const isModern = templateStyle === 'ats-modern-accent';
    const isHybrid = templateStyle === 'ats-executive-hybrid';

    const sectionTitleColor = isModern ? '#0284C7' : isHybrid ? '#0369A1' : '#0F172A';

    const photoAlignment = p.photoAlignment || 'left';
    let headerTableHtml = '';
    if (photoAlignment === 'center') {
      headerTableHtml = `
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 8pt; border-bottom: 2pt solid #0F172A; padding-bottom: 6pt;">
    ${avatar.dataUrl ? `
    <tr>
      <td align="center" style="text-align: center; padding-bottom: 6pt;">
        <img src="${avatar.dataUrl}" width="75" height="75" alt="${candidateName}" style="width: 75px; height: 75px; display: block; margin: 0 auto; border: 1pt solid #cbd5e1;" />
      </td>
    </tr>` : ''}
    <tr>
      <td align="center" style="text-align: center;">
        <div style="font-size: 22pt; font-weight: bold; color: #0F172A; text-transform: uppercase;">
          ${p.fullName || 'CANDIDATE NAME'}
        </div>
        ${p.headline ? `<div style="font-size: 12pt; font-weight: bold; color: ${sectionTitleColor}; text-transform: uppercase; margin-top: 2pt;">${p.headline}</div>` : ''}
        <div style="font-size: 10.5pt; color: #475569; margin-top: 4pt; font-weight: 500;">
          ${p.email ? `✉ ${p.email} &nbsp;•&nbsp; ` : ''}
          ${p.phone ? `📞 ${p.phone} &nbsp;•&nbsp; ` : ''}
          ${p.location ? `📍 ${p.location}` : ''}
          ${p.availability ? ` &nbsp;•&nbsp; <b style="color: #0F172A;">${p.availability}</b>` : ''}
        </div>
      </td>
    </tr>
  </table>`;
    } else if (photoAlignment === 'left') {
      headerTableHtml = `
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 8pt; border-bottom: 2pt solid #0F172A; padding-bottom: 6pt;">
    <tr>
      ${avatar.dataUrl ? `
      <td align="left" valign="middle" width="80" style="width: 80pt; text-align: left; padding-right: 12pt;">
        <img src="${avatar.dataUrl}" width="75" height="75" alt="${candidateName}" style="width: 75px; height: 75px; display: block; border: 1pt solid #cbd5e1;" />
      </td>` : ''}
      <td align="left" valign="middle">
        <div style="font-size: 22pt; font-weight: bold; color: #0F172A; text-transform: uppercase;">
          ${p.fullName || 'CANDIDATE NAME'}
        </div>
        ${p.headline ? `<div style="font-size: 12pt; font-weight: bold; color: ${sectionTitleColor}; text-transform: uppercase; margin-top: 2pt;">${p.headline}</div>` : ''}
        <div style="font-size: 10.5pt; color: #475569; margin-top: 4pt; font-weight: 500;">
          ${p.email ? `✉ ${p.email} &nbsp;•&nbsp; ` : ''}
          ${p.phone ? `📞 ${p.phone} &nbsp;•&nbsp; ` : ''}
          ${p.location ? `📍 ${p.location}` : ''}
          ${p.availability ? ` &nbsp;•&nbsp; <b style="color: #0F172A;">${p.availability}</b>` : ''}
        </div>
      </td>
    </tr>
  </table>`;
    } else {
      headerTableHtml = `
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 8pt; border-bottom: 2pt solid #0F172A; padding-bottom: 6pt;">
    <tr>
      <td align="left" valign="middle">
        <div style="font-size: 22pt; font-weight: bold; color: #0F172A; text-transform: uppercase;">
          ${p.fullName || 'CANDIDATE NAME'}
        </div>
        ${p.headline ? `<div style="font-size: 12pt; font-weight: bold; color: ${sectionTitleColor}; text-transform: uppercase; margin-top: 2pt;">${p.headline}</div>` : ''}
        <div style="font-size: 10.5pt; color: #475569; margin-top: 4pt; font-weight: 500;">
          ${p.email ? `✉ ${p.email} &nbsp;•&nbsp; ` : ''}
          ${p.phone ? `📞 ${p.phone} &nbsp;•&nbsp; ` : ''}
          ${p.location ? `📍 ${p.location}` : ''}
          ${p.availability ? ` &nbsp;•&nbsp; <b style="color: #0F172A;">${p.availability}</b>` : ''}
        </div>
      </td>
      ${avatar.dataUrl ? `
      <td align="right" valign="middle" width="80" style="width: 80pt; text-align: right;">
        <img src="${avatar.dataUrl}" width="75" height="75" alt="${candidateName}" style="width: 75px; height: 75px; display: block; margin-left: auto; border: 1pt solid #cbd5e1;" />
      </td>` : ''}
    </tr>
  </table>`;
    }

    bodyContent = `
<div style="padding: 12pt 20pt; max-width: 540pt; margin: 0 auto; font-family: 'Calibri', Arial, sans-serif;">
  <!-- Header with Candidate Photo Preset -->
  ${headerTableHtml}

  <!-- Summary -->
  ${
    data.summary
      ? `
  <div style="margin-top: 8pt; margin-bottom: 8pt;">
    <div style="font-size: 11pt; font-weight: bold; color: ${sectionTitleColor}; text-transform: uppercase; border-bottom: 1.5pt solid #0F172A; padding-bottom: 2pt; margin-bottom: 3pt;">
      Professional Summary
    </div>
    <p style="font-size: 10.5pt; color: #334155; text-align: left; line-height: 1.35; margin: 0;">
      ${data.summary}
    </p>
  </div>
  `
      : ''
  }

  <!-- Skills -->
  ${
    data.skills && data.skills.length > 0
      ? `
  <div style="margin-top: 8pt; margin-bottom: 8pt;">
    <div style="font-size: 11pt; font-weight: bold; color: ${sectionTitleColor}; text-transform: uppercase; border-bottom: 1.5pt solid #0F172A; padding-bottom: 2pt; margin-bottom: 4pt;">
      Core Competencies & Technical Skills
    </div>
    <table width="100%" border="0" cellpadding="2" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 10.5pt; color: #334155;">
      <tr>
        <td style="font-size: 10.5pt; line-height: 1.4;">
          ${data.skills.map((s) => `• <b>${s.name}</b>`).join(' &nbsp;&nbsp; ')}
        </td>
      </tr>
    </table>
  </div>
  `
      : ''
  }

  <!-- Experience -->
  ${
    data.experience && data.experience.length > 0
      ? `
  <div style="margin-top: 8pt; margin-bottom: 8pt;">
    <div style="font-size: 11pt; font-weight: bold; color: ${sectionTitleColor}; text-transform: uppercase; border-bottom: 1.5pt solid #0F172A; padding-bottom: 2pt; margin-bottom: 6pt;">
      Professional Experience
    </div>
    ${data.experience
      .map((exp) => {
        const highlights = (exp.highlights || []).filter(Boolean);
        const achievements = (exp.achievements || []).filter(Boolean);
        return `
      <div style="margin-bottom: 10pt; page-break-inside: avoid;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 2pt;">
          <tr>
            <td align="left" style="font-size: 11.5pt; font-weight: bold; color: #0F172A; text-align: left;">${exp.jobTitle}</td>
            <td align="right" style="font-size: 10.5pt; font-weight: bold; color: #475569; text-align: right; white-space: nowrap;">${exp.duration}</td>
          </tr>
          <tr>
            <td align="left" style="font-size: 10.5pt; font-style: italic; color: #334155; text-align: left;">${exp.company}</td>
            <td align="right" style="font-size: 10.5pt; color: #64748B; text-align: right; white-space: nowrap;">${exp.location || ''}</td>
          </tr>
        </table>
        ${highlights.length > 0 ? `<ul style="margin: 2pt 0 4pt 0; padding-left: 14pt; list-style-type: disc;">${highlights.map((h) => `<li style="font-size: 10.5pt; line-height: 1.3; color: #334155; margin-bottom: 2pt; text-align: left;">${h}</li>`).join('')}</ul>` : ''}
        ${achievements.length > 0 ? `<div style="margin: 3pt 0 4pt 0; padding-left: 6pt; border-left: 2pt solid #0F172A;"><b style="font-size: 10pt; color: #0F172A; display: block; margin-bottom: 2pt;">Key Metric Achievements:</b><ul style="margin: 0; padding-left: 14pt; list-style-type: circle;">${achievements.map((a) => `<li style="font-size: 10.5pt; line-height: 1.3; color: #334155; margin-bottom: 2pt; text-align: left;">${a}</li>`).join('')}</ul></div>` : ''}
      </div>
    `;
      })
      .join('')}
  </div>
  `
      : ''
  }

  <!-- Education -->
  ${
    data.education && data.education.length > 0
      ? `
  <div style="margin-top: 8pt; margin-bottom: 8pt;">
    <div style="font-size: 11pt; font-weight: bold; color: ${sectionTitleColor}; text-transform: uppercase; border-bottom: 1.5pt solid #0F172A; padding-bottom: 2pt; margin-bottom: 4pt;">
      Education & Academic Qualifications
    </div>
    ${data.education
      .map(
        (edu) => `
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 3pt;">
        <tr>
          <td align="left" style="font-size: 10.5pt; font-weight: bold; color: #0F172A; text-align: left;">${edu.school} &nbsp;<span style="font-style: italic; font-weight: normal; color: #475569;">— ${edu.degree}</span></td>
          <td align="right" style="font-size: 10.5pt; color: #64748B; text-align: right; white-space: nowrap;">${edu.duration}</td>
        </tr>
      </table>
    `
      )
      .join('')}
  </div>
  `
      : ''
  }

  <!-- Awards / Certificates -->
  ${
    data.awards && data.awards.length > 0
      ? `
  <div style="margin-top: 8pt; margin-bottom: 8pt;">
    <div style="font-size: 11pt; font-weight: bold; color: ${sectionTitleColor}; text-transform: uppercase; border-bottom: 1.5pt solid #0F172A; padding-bottom: 2pt; margin-bottom: 4pt;">
      Awards / Certificates
    </div>
    ${data.awards
      .map(
        (a) => `
      <div style="font-size: 10.5pt; color: #334155; margin-bottom: 2pt;">
        • <b>${a.title}</b> &nbsp;<span style="color: #64748B; font-size: 10pt;">${a.years ? `(${a.years})` : ''}</span>
      </div>
    `
      )
      .join('')}
  </div>
  `
      : ''
  }
</div>
    `;
  }

  const docHtml = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${candidateName} - Resume</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: A4 portrait;
      margin: 0.3in 0.3in 0.3in 0.3in;
      mso-page-orientation: portrait;
      mso-header-margin: 0in;
      mso-footer-margin: 0in;
    }
    body {
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      font-size: 10.5pt;
      color: #1e293b;
      line-height: 1.25;
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
  </style>
</head>
<body>
${bodyContent}
</body>
</html>
  `.trim();

  const blob = new Blob(['\ufeff', docHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

/**
 * Downloads resume in native Microsoft Word (.docx) format using the 'docx' npm library.
 * Embeds photo preset in all formats and uses Awards / Certificates terminology.
 */
export async function downloadResumeAsDocx(
  data: ResumeData,
  customFilename?: string,
  templateStyle: TemplateStyle = 'executive-two-column'
): Promise<void> {
  const p = data.personal || {};
  const candidateName = (p.fullName || 'Executive_Resume').trim();
  const filename = customFilename || `${candidateName.replace(/\s+/g, '_')}_Resume.docx`;

  const avatar = await prepareCandidateAvatar(p.photoUrl, p.photoShape, p.fullName);

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: 'Page ',
            size: 18,
            color: '64748B',
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 18,
            color: '64748B',
          }),
          new TextRun({
            text: ' of ',
            size: 18,
            color: '64748B',
          }),
          new TextRun({
            children: [PageNumber.TOTAL_PAGES],
            size: 18,
            color: '64748B',
          }),
        ],
      }),
    ],
  });

  if (templateStyle === 'executive-two-column') {
    // Two-Column Executive Word Document
    const leftCells: Paragraph[] = [];
    const rightCells: Paragraph[] = [];

    if (avatar.base64Raw) {
      try {
        const binaryString = atob(avatar.base64Raw);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        leftCells.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: bytes,
                transformation: { width: 82, height: 82 },
                type: 'png',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
          })
        );
      } catch (e) {
        console.warn('Could not insert ImageRun in docx:', e);
      }
    }

    leftCells.push(
      new Paragraph({
        children: [new TextRun({ text: 'CONTACT ME AT', bold: true, size: 21, color: '7DD3FC' })],
        spacing: { before: 60, after: 40 },
      })
    );
    if (p.location) {
      leftCells.push(
        new Paragraph({
          children: [new TextRun({ text: `📍 ${p.location}`, size: 21, color: 'FFFFFF' })],
          spacing: { after: 15 },
        })
      );
    }
    if (p.email) {
      leftCells.push(
        new Paragraph({
          children: [new TextRun({ text: `✉ ${p.email}`, size: 21, color: 'FFFFFF' })],
          spacing: { after: 15 },
        })
      );
    }
    if (p.phone) {
      leftCells.push(
        new Paragraph({
          children: [new TextRun({ text: `📞 ${p.phone}`, bold: true, size: 21, color: 'FFFFFF' })],
          spacing: { after: 15 },
        })
      );
    }

    if (data.skills && data.skills.length > 0) {
      leftCells.push(
        new Paragraph({
          children: [new TextRun({ text: 'SKILLS SUMMARY', bold: true, size: 21, color: '7DD3FC' })],
          spacing: { before: 50, after: 25 },
        })
      );
      for (const skill of data.skills) {
        leftCells.push(
          new Paragraph({
            children: [
              new TextRun({ text: skill.name, size: 21, color: 'FFFFFF' }),
              new TextRun({ text: ` (${skill.rating}/5)`, size: 19, color: '38BDF8' }),
            ],
            spacing: { after: 15 },
          })
        );
      }
    }

    if (data.awards && data.awards.length > 0) {
      leftCells.push(
        new Paragraph({
          children: [new TextRun({ text: 'AWARDS / CERTIFICATES', bold: true, size: 21, color: '7DD3FC' })],
          spacing: { before: 50, after: 25 },
        })
      );
      for (const aw of data.awards) {
        leftCells.push(
          new Paragraph({
            children: [
              new TextRun({ text: `🔖 ${aw.title}`, size: 21, color: 'FFFFFF' }),
              new TextRun({ text: aw.years ? ` (${aw.years})` : '', size: 19, color: '94A3B8' }),
            ],
            spacing: { after: 15 },
          })
        );
      }
    }

    // Right Column
    rightCells.push(
      new Paragraph({
        children: [
          new TextRun({
            text: (p.fullName || 'Candidate Name').toUpperCase(),
            bold: true,
            size: 38,
            color: '1E3A5F',
          }),
        ],
        spacing: { after: 15 },
      })
    );

    if (p.headline) {
      rightCells.push(
        new Paragraph({
          children: [
            new TextRun({ text: p.headline.toUpperCase(), bold: true, size: 23, color: '64748B' }),
          ],
          spacing: { after: 40 },
        })
      );
    }

    if (data.summary) {
      rightCells.push(
        new Paragraph({
          children: [new TextRun({ text: 'PROFESSIONAL SUMMARY', bold: true, size: 22, color: '0284C7' })],
          spacing: { before: 30, after: 15 },
        }),
        new Paragraph({
          children: [new TextRun({ text: data.summary, size: 21, color: '334155' })],
          spacing: { after: 40 },
        })
      );
    }

    if (data.experience && data.experience.length > 0) {
      rightCells.push(
        new Paragraph({
          children: [new TextRun({ text: 'WORK EXPERIENCE', bold: true, size: 22, color: '0284C7' })],
          spacing: { before: 40, after: 20 },
        })
      );

      for (const exp of data.experience) {
        rightCells.push(
          new Paragraph({
            children: [
              new TextRun({ text: exp.jobTitle, bold: true, size: 23, color: '1E3A5F' }),
            ],
            spacing: { before: 24, after: 4 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${exp.company}${exp.location ? ` • ${exp.location}` : ''}`,
                italics: true,
                size: 21,
                color: '475569',
              }),
              new TextRun({
                text: exp.duration ? `  |  ${exp.duration}` : '',
                bold: true,
                size: 20,
                color: '0284C7',
              }),
            ],
            spacing: { after: 12 },
          })
        );

        for (const h of exp.highlights || []) {
          rightCells.push(
            new Paragraph({
              children: [new TextRun({ text: h, size: 21, color: '334155' })],
              bullet: { level: 0 },
              spacing: { after: 12 },
            })
          );
        }

        const achievements = (exp.achievements || []).filter(Boolean);
        if (achievements.length > 0) {
          rightCells.push(
            new Paragraph({
              children: [new TextRun({ text: 'Key Achievements:', bold: true, size: 21, color: '1E3A5F' })],
              spacing: { before: 20, after: 10 },
            })
          );
          for (const a of achievements) {
            rightCells.push(
              new Paragraph({
                children: [new TextRun({ text: a, size: 21, color: '334155' })],
                bullet: { level: 1 },
                spacing: { after: 10 },
              })
            );
          }
        }
      }
    }

    if (data.education && data.education.length > 0) {
      rightCells.push(
        new Paragraph({
          children: [new TextRun({ text: 'EDUCATION QUALIFICATION', bold: true, size: 22, color: '0284C7' })],
          spacing: { before: 40, after: 20 },
        })
      );
      for (const edu of data.education) {
        rightCells.push(
          new Paragraph({
            children: [
              new TextRun({ text: edu.school, bold: true, size: 21, color: '1E3A5F' }),
            ],
            spacing: { before: 16, after: 2 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: edu.degree, italics: true, size: 21, color: '475569' }),
              new TextRun({ text: edu.duration ? `  |  ${edu.duration}` : '', size: 20, color: '64748B' }),
            ],
            spacing: { after: 12 },
          })
        );
      }
    }

    const twoColTable = new Table({
      rows: [
        new TableRow({
          cantSplit: false,
          children: [
            new TableCell({
              width: { size: 33, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: '1E3A5F' },
              margins: { top: 160, bottom: 160, left: 160, right: 160 },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: leftCells,
            }),
            new TableCell({
              width: { size: 67, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: 'FFFFFF' },
              margins: { top: 160, bottom: 160, left: 180, right: 180 },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: rightCells,
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: { margin: { top: 400, bottom: 400, left: 360, right: 360 } },
          },
          footers: { default: footer },
          children: [twoColTable],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    return;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ATS SINGLE-COLUMN NATIVE DOCX WITH PHOTO PRESET & AWARDS / CERTIFICATES
  // ───────────────────────────────────────────────────────────────────────────
  const children: Paragraph[] = [];
  const docxAlignment =
    p.photoAlignment === 'center'
      ? AlignmentType.CENTER
      : p.photoAlignment === 'right'
      ? AlignmentType.RIGHT
      : AlignmentType.LEFT;

  // Photo preset in single-column docx
  if (avatar.base64Raw) {
    try {
      const binaryString = atob(avatar.base64Raw);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: bytes,
              transformation: { width: 75, height: 75 },
              type: 'png',
            }),
          ],
          alignment: docxAlignment,
          spacing: { after: 60 },
        })
      );
    } catch (e) {
      console.warn('Could not insert ImageRun in docx:', e);
    }
  }

  // Candidate Name
  children.push(
    new Paragraph({
      alignment: docxAlignment,
      children: [
        new TextRun({
          text: (p.fullName || 'Candidate Name').toUpperCase(),
          bold: true,
          size: 38, // 19pt
          color: '0F172A',
        }),
      ],
      spacing: { after: 20 },
    })
  );

  // Headline
  if (p.headline) {
    children.push(
      new Paragraph({
        alignment: docxAlignment,
        children: [
          new TextRun({
            text: p.headline.toUpperCase(),
            bold: true,
            size: 23,
            color: '0284C7',
          }),
        ],
        spacing: { after: 30 },
      })
    );
  }

  // Contact line
  const contactParts: string[] = [];
  if (p.email) contactParts.push(`✉ ${p.email}`);
  if (p.phone) contactParts.push(`📞 ${p.phone}`);
  if (p.location) contactParts.push(`📍 ${p.location}`);
  if (p.availability) contactParts.push(p.availability);

  children.push(
    new Paragraph({
      alignment: docxAlignment,
      children: [
        new TextRun({
          text: contactParts.join('  •  '),
          size: 21,
          color: '475569',
        }),
      ],
      spacing: { after: 120 },
    })
  );

  // Professional Summary
  if (data.summary) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROFESSIONAL SUMMARY',
            bold: true,
            size: 22,
            color: '0F172A',
          }),
        ],
        spacing: { before: 80, after: 20 },
      }),
      new Paragraph({
        children: [new TextRun({ text: data.summary, size: 21, color: '334155' })],
        spacing: { after: 80 },
      })
    );
  }

  // Core Competencies & Skills
  if (data.skills && data.skills.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'CORE COMPETENCIES & TECHNICAL SKILLS',
            bold: true,
            size: 22,
            color: '0F172A',
          }),
        ],
        spacing: { before: 80, after: 20 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: data.skills.map((s) => s.name).join('  •  '),
            size: 21,
            color: '334155',
          }),
        ],
        spacing: { after: 80 },
      })
    );
  }

  // Professional Experience
  if (data.experience && data.experience.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROFESSIONAL EXPERIENCE',
            bold: true,
            size: 22,
            color: '0F172A',
          }),
        ],
        spacing: { before: 80, after: 40 },
      })
    );

    for (const exp of data.experience) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.jobTitle, bold: true, size: 23, color: '0F172A' }),
          ],
          spacing: { before: 24, after: 4 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.company}${exp.location ? ` • ${exp.location}` : ''}`,
              italics: true,
              size: 21,
              color: '475569',
            }),
            new TextRun({
              text: exp.duration ? `  |  ${exp.duration}` : '',
              bold: true,
              size: 20,
              color: '0284C7',
            }),
          ],
          spacing: { after: 12 },
        })
      );

      for (const h of exp.highlights || []) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: h, size: 21, color: '334155' })],
            bullet: { level: 0 },
            spacing: { after: 10 },
          })
        );
      }

      for (const a of exp.achievements || []) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: '• Key Achievement: ', bold: true, size: 21, color: '0F172A' }),
              new TextRun({ text: a, size: 21, color: '334155' }),
            ],
            spacing: { after: 10 },
          })
        );
      }
    }
  }

  // Education
  if (data.education && data.education.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EDUCATION & ACADEMIC CREDENTIALS',
            bold: true,
            size: 22,
            color: '0F172A',
          }),
        ],
        spacing: { before: 80, after: 20 },
      })
    );
    for (const edu of data.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.school, bold: true, size: 21, color: '0F172A' }),
          ],
          spacing: { before: 16, after: 2 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, italics: true, size: 21, color: '475569' }),
            new TextRun({ text: edu.duration ? `  |  ${edu.duration}` : '', size: 20, color: '64748B' }),
          ],
          spacing: { after: 12 },
        })
      );
    }
  }

  // Awards / Certificates
  if (data.awards && data.awards.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'AWARDS / CERTIFICATES',
            bold: true,
            size: 22,
            color: '0F172A',
          }),
        ],
        spacing: { before: 80, after: 20 },
      })
    );
    for (const aw of data.awards) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `• ${aw.title}`, size: 21, color: '334155' }),
            new TextRun({ text: aw.years ? ` (${aw.years})` : '', size: 21, color: '64748B' }),
          ],
          spacing: { after: 12 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 500, bottom: 500, left: 500, right: 500 } },
        },
        footers: { default: footer },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
