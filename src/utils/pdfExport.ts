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
 * Open high-fidelity Thai-rendered official report ready for printing or saving as PDF
 */
export const printReportHtml = (options: ReportExportOptions) => {
  const { title, meeting, headers, data, summaryNotes, preparedBy, certifiedBy } = options;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 15mm 15mm; }
    body {
      font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1f2937;
      margin: 0;
      padding: 20px;
      font-size: 13px;
      line-height: 1.5;
    }
    .header-bar {
      border-bottom: 2px solid #4B1F5E;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-title {
      font-size: 16px;
      font-weight: 700;
      color: #4B1F5E;
    }
    .brand-sub {
      font-size: 11px;
      color: #6b7280;
    }
    .report-title {
      font-size: 15px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 8px;
    }
    .meeting-meta {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 18px;
      font-size: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 12px;
    }
    th {
      background-color: #4B1F5E;
      color: #ffffff;
      font-weight: 600;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #4B1F5E;
    }
    td {
      padding: 7px 10px;
      border: 1px solid #e5e7eb;
    }
    tr:nth-child(even) {
      background-color: #fcfbfe;
    }
    .notes-box {
      margin-top: 15px;
      padding: 10px;
      background-color: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 6px;
      font-size: 11.5px;
      color: #92400e;
    }
    .signatures {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .signature-block {
      width: 45%;
      text-align: center;
    }
    .signature-line {
      margin-top: 45px;
      border-bottom: 1px dotted #9ca3af;
      margin-bottom: 8px;
    }
    .footer {
      margin-top: 30px;
      border-top: 1px solid #e5e7eb;
      padding-top: 8px;
      font-size: 10px;
      color: #9ca3af;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div>
      <div class="brand-title">มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (มจร.)</div>
      <div class="brand-sub">สำนักงานสภามหาวิทยาลัย • MCU Council RSVP System</div>
    </div>
    <div style="text-align: right; font-size: 11px; color: #4B1F5E; font-weight: 600;">
      เอกสารทางการ
    </div>
  </div>

  <div class="report-title">${title}</div>

  ${meeting ? `
  <div class="meeting-meta">
    <div><strong>การประชุม:</strong> ${meeting.title} (${meeting.meetingType})</div>
    <div><strong>วันที่:</strong> ${formatThaiDate(meeting.meetingDate)} <strong>เวลา:</strong> ${meeting.startTime} - ${meeting.endTime} น.</div>
    <div><strong>สถานที่:</strong> ${meeting.venue || 'การประชุมออนไลน์'}</div>
  </div>
  ` : ''}

  <table>
    <thead>
      <tr>
        ${headers.map(h => `<th>${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>
          ${row.map(cell => `<td>${cell}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>

  ${summaryNotes && summaryNotes.length > 0 ? `
  <div class="notes-box">
    <strong>หมายเหตุประกอบรายงาน:</strong>
    <ul style="margin: 4px 0 0 16px; padding: 0;">
      ${summaryNotes.map(n => `<li>${n}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  <div class="signatures">
    <div class="signature-block">
      <div class="signature-line"></div>
      <div>(${preparedBy || 'เจ้าหน้าที่ผู้จัดทำรายงาน'})</div>
      <div style="font-size: 11px; color: #6b7280;">เจ้าหน้าที่สำนักงานสภามหาวิทยาลัย</div>
    </div>
    <div class="signature-block">
      <div class="signature-line"></div>
      <div>(${certifiedBy || 'เลขานุการสภามหาวิทยาลัย'})</div>
      <div style="font-size: 11px; color: #6b7280;">เลขานุการสภามหาวิทยาลัย มจร.</div>
    </div>
  </div>

  <div class="footer">
    <span>ระบบบริหารการตอบรับการประชุมสภามหาวิทยาลัย มจร.</span>
    <span>ออกรายงาน ณ วันที่ ${formatThaiDateTime(new Date().toISOString())}</span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

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

  const finalY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || currentY + 40;

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
  const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
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
  const safeFilename = `MCU_Report_${title.replace(/[\s()/]/g, '_')}_${Date.now()}.pdf`;
  doc.save(safeFilename);
};
