const PDFDocument = require('pdfkit');

/**
 * Generate a styled PDF report stream for expenses
 */
const generatePdfReport = (expenses, summaryData, filters) => {
  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
    bufferPages: true,
  });

  // Theme Colors
  const primaryColor = '#0F766E'; // Deep Teal
  const darkTextColor = '#0F172A'; // Slate 900
  const mutedTextColor = '#64748B'; // Slate 500
  const borderColor = '#E2E8F0'; // Slate 200
  const lightBg = '#F8FAFC'; // Slate 50

  // 1. Header Banner
  doc.rect(40, 40, 515, 65).fill(primaryColor);
  doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('HomeLedger', 55, 52);
  doc.fontSize(11).font('Helvetica').text('Comprehensive Household & Personal Expense Report', 55, 78);

  const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  doc.fontSize(9).text(`Generated on: ${reportDate}`, 400, 56, { align: 'right', width: 145 });

  // 2. Period & Filter Information Strip
  let y = 120;
  doc.rect(40, y, 515, 30).fill(lightBg).stroke(borderColor);
  doc.fillColor(darkTextColor).fontSize(9).font('Helvetica-Bold');
  const startDateStr = filters.startDate ? new Date(filters.startDate).toLocaleDateString() : 'All Time';
  const endDateStr = filters.endDate ? new Date(filters.endDate).toLocaleDateString() : 'Present';
  doc.text(`Period: ${startDateStr} - ${endDateStr}`, 52, y + 10);
  doc.font('Helvetica').fillColor(mutedTextColor).text(`Transactions: ${expenses.length}`, 300, y + 10);
  doc.text(`Total Spend: Rs. ${(summaryData?.metrics?.totalSpend || expenses.reduce((acc, curr) => acc + curr.amount, 0)).toFixed(2)}`, 400, y + 10, { align: 'right', width: 140 });

  // 3. Executive KPI Cards
  y = 165;
  const cardWidth = 120;
  const cardHeight = 50;

  const totalAmount = summaryData?.metrics?.totalSpend || expenses.reduce((a, b) => a + b.amount, 0);
  const dailyAvg = summaryData?.metrics?.dailyAverage || (totalAmount / Math.max(1, summaryData?.period?.days || 1));
  const topCat = summaryData?.metrics?.topCategory?.name || 'N/A';

  const kpis = [
    { label: 'TOTAL EXPENSE', val: `Rs. ${totalAmount.toFixed(2)}` },
    { label: 'DAILY AVERAGE', val: `Rs. ${dailyAvg.toFixed(2)}` },
    { label: 'TOP CATEGORY', val: `${topCat}` },
    { label: 'TRANSACTIONS', val: `${expenses.length}` },
  ];

  kpis.forEach((kpi, index) => {
    const x = 40 + index * (cardWidth + 11.5);
    doc.rect(x, y, cardWidth, cardHeight).fill('#FFFFFF').stroke(borderColor);
    doc.fillColor(mutedTextColor).fontSize(7).font('Helvetica-Bold').text(kpi.label, x + 8, y + 8);
    doc.fillColor(primaryColor).fontSize(13).font('Helvetica-Bold').text(kpi.val, x + 8, y + 24, { width: cardWidth - 16, ellipsis: true });
  });

  // 4. Category Breakdown Table
  y = 230;
  doc.fillColor(darkTextColor).fontSize(12).font('Helvetica-Bold').text('Category Breakdown', 40, y);
  y += 18;

  // Header row
  doc.rect(40, y, 515, 20).fill(lightBg).stroke(borderColor);
  doc.fillColor(darkTextColor).fontSize(8).font('Helvetica-Bold');
  doc.text('Category', 50, y + 6);
  doc.text('Transactions', 220, y + 6);
  doc.text('Share', 330, y + 6);
  doc.text('Total Amount', 440, y + 6, { align: 'right', width: 100 });
  y += 20;

  const categories = summaryData?.categoryBreakdown || [];
  categories.filter(c => c.totalSpend > 0).slice(0, 8).forEach((cat) => {
    doc.rect(40, y, 515, 18).stroke(borderColor);
    doc.fillColor(darkTextColor).fontSize(8).font('Helvetica').text(cat.name, 50, y + 5);
    doc.fillColor(mutedTextColor).text(`${cat.count}`, 220, y + 5);
    doc.text(`${cat.percentage}%`, 330, y + 5);
    doc.fillColor(darkTextColor).font('Helvetica-Bold').text(`Rs. ${cat.totalSpend.toFixed(2)}`, 440, y + 5, { align: 'right', width: 100 });
    y += 18;
  });

  // 5. Itemized Expense Ledger Table
  y += 20;
  if (y > 680) {
    doc.addPage();
    y = 40;
  }

  doc.fillColor(darkTextColor).fontSize(12).font('Helvetica-Bold').text('Expense Ledger', 40, y);
  y += 18;

  // Table header
  const printLedgerHeader = (currY) => {
    doc.rect(40, currY, 515, 20).fill(primaryColor);
    doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
    doc.text('Date', 50, currY + 6);
    doc.text('Category', 110, currY + 6);
    doc.text('Subcategory', 190, currY + 6);
    doc.text('Paid By', 280, currY + 6);
    doc.text('Note', 350, currY + 6);
    doc.text('Amount', 460, currY + 6, { align: 'right', width: 80 });
  };

  printLedgerHeader(y);
  y += 20;

  expenses.forEach((item, idx) => {
    if (y > 750) {
      doc.addPage();
      y = 40;
      printLedgerHeader(y);
      y += 20;
    }

    const rowBg = idx % 2 === 0 ? '#FFFFFF' : lightBg;
    doc.rect(40, y, 515, 20).fill(rowBg).stroke(borderColor);

    const dateStr = item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' }) : '';
    const catName = item.categoryId?.name || item.category || 'N/A';
    const subcatName = item.subcategoryId?.name || item.subcategory || '-';
    const personName = item.personId?.name || item.person || 'Common';
    const noteStr = item.note || '-';
    const amountStr = `Rs. ${Number(item.amount).toFixed(2)}`;

    doc.fillColor(darkTextColor).fontSize(8).font('Helvetica');
    doc.text(dateStr, 50, y + 6, { width: 55 });
    doc.text(catName, 110, y + 6, { width: 75, ellipsis: true });
    doc.text(subcatName, 190, y + 6, { width: 85, ellipsis: true });
    doc.text(personName, 280, y + 6, { width: 65, ellipsis: true });
    doc.fillColor(mutedTextColor).text(noteStr, 350, y + 6, { width: 105, ellipsis: true });
    doc.fillColor(darkTextColor).font('Helvetica-Bold').text(amountStr, 460, y + 6, { align: 'right', width: 80 });

    y += 20;
  });

  // Footer page numbers
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fillColor(mutedTextColor).fontSize(8).font('Helvetica').text(
      `HomeLedger • Page ${i + 1} of ${pages.count}`,
      40,
      800,
      { align: 'center', width: 515 }
    );
  }

  return doc;
};

module.exports = {
  generatePdfReport,
};
