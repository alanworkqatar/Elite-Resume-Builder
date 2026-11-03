import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import { CoverLetterData } from '../types/copilot';
import { PersonalDetails } from '../types/resume';

/**
 * Generates and triggers download of an Executive Cover Letter as a Word .docx document
 * Supports 3-Pillar Executive format and standard narrative mode
 */
export async function downloadCoverLetterAsDocx(
  personal: PersonalDetails,
  coverLetter: CoverLetterData,
  filename: string,
  formatMode: 'pillars' | 'narrative' = 'pillars'
): Promise<void> {
  const primaryNavy = '0F172A';
  const slateText = '334155';
  const slateMuted = '64748B';
  const accentCyan = '0284C7';

  // Build body paragraphs based on formatMode
  const bodyParagraphs: Paragraph[] = [];

  // Opening Paragraph
  if (coverLetter.openingParagraph) {
    bodyParagraphs.push(
      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: coverLetter.openingParagraph,
          }),
        ],
      })
    );
  }

  if (formatMode === 'pillars') {
    // Pillar 1: Relevant Experience & Proven Achievements
    if (coverLetter.relevanceParagraph) {
      bodyParagraphs.push(
        new Paragraph({
          spacing: { before: 160, after: 80 },
          children: [
            new TextRun({
              text: '01 · MY RELEVANT EXPERIENCE, EXPERTISE & PROVEN ACHIEVEMENTS',
              bold: true,
              size: 21,
              color: accentCyan,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: coverLetter.relevanceParagraph,
            }),
          ],
        })
      );
    }

    // Pillar 2: Why I am the right fit
    if (coverLetter.evidenceParagraph) {
      bodyParagraphs.push(
        new Paragraph({
          spacing: { before: 160, after: 80 },
          children: [
            new TextRun({
              text: '02 · WHY I AM THE RIGHT FIT (ROLE ALIGNMENT)',
              bold: true,
              size: 21,
              color: accentCyan,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: coverLetter.evidenceParagraph,
            }),
          ],
        })
      );
    }

    // Pillar 3: VALUE: What I can deliver
    if (coverLetter.employerFitParagraph) {
      bodyParagraphs.push(
        new Paragraph({
          spacing: { before: 160, after: 80 },
          children: [
            new TextRun({
              text: '03 · VALUE: WHAT I CAN DELIVER (BUSINESS IMPACT)',
              bold: true,
              size: 21,
              color: accentCyan,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: coverLetter.employerFitParagraph,
            }),
          ],
        })
      );
    }
  } else {
    // Narrative mode
    if (coverLetter.relevanceParagraph) {
      bodyParagraphs.push(
        new Paragraph({
          spacing: { after: 180 },
          children: [new TextRun({ text: coverLetter.relevanceParagraph })],
        })
      );
    }
    if (coverLetter.evidenceParagraph) {
      bodyParagraphs.push(
        new Paragraph({
          spacing: { after: 180 },
          children: [new TextRun({ text: coverLetter.evidenceParagraph })],
        })
      );
    }
    if (coverLetter.employerFitParagraph) {
      bodyParagraphs.push(
        new Paragraph({
          spacing: { after: 180 },
          children: [new TextRun({ text: coverLetter.employerFitParagraph })],
        })
      );
    }
  }

  // Closing Paragraph
  if (coverLetter.closingParagraph) {
    bodyParagraphs.push(
      new Paragraph({
        spacing: { before: 120, after: 240 },
        children: [
          new TextRun({
            text: coverLetter.closingParagraph,
          }),
        ],
      })
    );
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22, // 11pt
            color: slateText,
          },
          paragraph: {
            spacing: {
              line: 280, // 1.15 line spacing
              after: 160,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1200,
              right: 1200,
            },
          },
        },
        children: [
          // Header: Candidate Name
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: (personal.fullName || 'Candidate Name').toUpperCase(),
                bold: true,
                size: 36, // 18pt
                color: primaryNavy,
                font: 'Calibri',
              }),
            ],
          }),

          // Headline
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: (personal.headline || coverLetter.jobTitle || 'Executive Professional').toUpperCase(),
                bold: true,
                size: 22,
                color: accentCyan,
                font: 'Calibri',
              }),
            ],
          }),

          // Contact Details line
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 280 },
            children: [
              new TextRun({
                text: [personal.email, personal.phone, personal.location]
                  .filter(Boolean)
                  .join('   |   '),
                size: 19,
                color: slateMuted,
                font: 'Calibri',
              }),
            ],
          }),

          // Divider rule table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.SINGLE, size: 8, color: 'CBD5E1' },
                    },
                  }),
                ],
              }),
            ],
          }),

          // Date
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 240, after: 180 },
            children: [
              new TextRun({
                text: coverLetter.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                bold: true,
                size: 21,
                color: slateMuted,
              }),
            ],
          }),

          // Recipient block
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: coverLetter.recipientName || 'Hiring Manager / Recruitment Team',
                bold: true,
                color: primaryNavy,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: coverLetter.companyName || 'Target Organization',
                size: 21,
                color: slateText,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `Re: Application for ${coverLetter.jobTitle || 'the Position'}`,
                bold: true,
                color: accentCyan,
                size: 22,
              }),
            ],
          }),

          // Salutation
          new Paragraph({
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: `Dear ${coverLetter.recipientName || 'Hiring Manager'},`,
                bold: true,
                color: primaryNavy,
              }),
            ],
          }),

          // Inject all body paragraphs (3-pillar executive or narrative)
          ...bodyParagraphs,

          // Sign-off
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: 'Sincerely,',
                color: slateText,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: personal.fullName || 'Candidate Name',
                bold: true,
                size: 24,
                color: primaryNavy,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: personal.headline || coverLetter.jobTitle || '',
                size: 20,
                color: slateMuted,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
