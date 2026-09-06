import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Meeting } from '../types';
import { formatThaiDate, formatThaiDateTime } from './thaiDate';

export interface ReportExportOptions {
  title: string;
  meeting?: Meeting;
  headers: string[];
  data: (string | number)[][];
  summaryNotes?: string[];
  preparedBy?: string;
  certifiedBy?: string;
}

/**
 * Generate and download an official MCU meeting report PDF
 */
export const exportReportToPdf = (options: ReportExportOptions) => {
  const { title, meeting, headers, data, summaryNotes, preparedBy, certifiedBy } = options;

  // Initialize PDF in A4 portrait
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(75, 31, 94); // #4B1F5E MCU Primary Purple
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Title in Header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('MAHACHULALONGKORNRAJAVIDYALAYA UNIVERSITY', pageWidth / 2, 11, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 165, 75); // Gold Accent #C8A54B
  doc.text('MCU UNIVERSITY COUNCIL OFFICE - OFFICIAL REPORT', pageWidth / 2, 19, { align: 'center' });

  // Subheader Details
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 34);

  let currentY = 40;

  if (meeting) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(`Meeting: ${meeting.title} (${meeting.meetingType})`, 14, currentY);
    currentY += 4.5;
    doc.text(`Date: ${formatThaiDate(meeting.meetingDate)} | Time: ${meeting.startTime} - ${meeting.endTime} hrs.`, 14, currentY);
    currentY += 4.5;
    doc.text(`Venue: ${meeting.venue}`, 14, currentY, { maxWidth: pageWidth - 28 });
    currentY += 7;
  }

  // Render Table
  autoTable(doc, {
    startY: currentY,
    head: [headers],
    body: data,
    theme: 'striped',
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      lineColor: [229, 231, 235],
      lineWidth: 0.2,
      textColor: [31, 41, 55]
    },
    headStyles: {
      fillColor: [75, 31, 94], // #4B1F5E
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || currentY + 40;

  // Optional Notes or Summary Section
  let noteY = finalY + 8;
  if (summaryNotes && summaryNotes.length > 0) {
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    summaryNotes.forEach((note) => {
      if (noteY > 260) {
        doc.addPage();
        noteY = 20;
      }
      doc.text(`* ${note}`, 14, noteY);
      noteY += 4.5;
    });
  }

  // Signature Blocks
  let signY = noteY + 12;
  if (signY > 245) {
    doc.addPage();
    signY = 30;
  }

  doc.setFontSize(8.5);
  doc.setTextColor(55, 65, 81);

  // Left signature: Prepared By
  const leftX = 40;
  doc.text('....................................................................', leftX, signY, { align: 'center' });
  doc.text(`(${preparedBy || 'Staff / Meeting Officer'})`, leftX, signY + 5.5, { align: 'center' });
  doc.text('Council Officer / MCU Meeting Division', leftX, signY + 10, { align: 'center' });

  // Right signature: Certified By (Secretary)
  const rightX = pageWidth - 45;
  doc.text('....................................................................', rightX, signY, { align: 'center' });
  doc.text(`(${certifiedBy || 'Council Secretary'})`, rightX, signY + 5.5, { align: 'center' });
  doc.text('Secretary to MCU University Council', rightX, signY + 10, { align: 'center' });

  // Footer page numbering
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `MCU Council RSVP System | Generated: ${formatThaiDateTime(new Date().toISOString())} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  // Save the PDF
  const safeFilename = `MCU_Report_${title.replace(/[\s\(\)\/]/g, '_')}_${Date.now()}.pdf`;
  doc.save(safeFilename);
};
