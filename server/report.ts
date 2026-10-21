import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { getAnomalies, getForecast, getOverview, getSalesAnalysis } from './analytics';
import { getDatasetMeta, getSalesRows } from './db';
import { askLLM, buildContext } from './llm';

const ANOMALY_THRESHOLD = 3.5;

export async function generatePDFReport(type: 'executive' | 'sales' | 'forecast' | 'ai', provider?: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const margin = 40;
  let cursorY = height - 50;

  const primaryColor = rgb(0.258, 0.165, 0.984); // #422AFB brand
  const darkTextColor = rgb(0.106, 0.145, 0.294); // #1B254B
  const grayColor = rgb(0.4, 0.45, 0.55);
  const lightBgColor = rgb(0.957, 0.969, 0.996);

  const rows = getSalesRows();
  const meta = getDatasetMeta();
  const ov = getOverview(rows);
  const sa = getSalesAnalysis(rows);

  const reportTitles: Record<string, string> = {
    executive: 'Executive Summary Report',
    sales: 'Sales Performance Report',
    forecast: 'Forecast & Anomaly Detection Report',
    ai: 'AI Insights & Strategic Analysis Report',
  };

  const title = reportTitles[type] || 'Business Intelligence Report';

  const sanitizeForPDF = (str: string) => {
    return str
      .replace(/₹/g, 'Rs ')
      .replace(/•/g, '-')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[^\x20-\x7E]/g, ' ')
      .trim();
  };

  // Draw Header Banner
  page.drawRectangle({
    x: margin,
    y: cursorY - 45,
    width: width - margin * 2,
    height: 55,
    color: lightBgColor,
  });

  page.drawText(title, {
    x: margin + 15,
    y: cursorY - 20,
    size: 18,
    font: fontBold,
    color: primaryColor,
  });

  page.drawText(
    `Autonomous Business Intelligence Platform · Dataset: ${meta.filename || 'retail_sales.csv'} · Generated: ${new Date().toLocaleDateString()}`,
    {
      x: margin + 15,
      y: cursorY - 38,
      size: 9,
      font,
      color: grayColor,
    }
  );

  cursorY -= 75;

  // Function to draw section header
  const drawSection = (text: string) => {
    page.drawText(text.toUpperCase(), {
      x: margin,
      y: cursorY,
      size: 11,
      font: fontBold,
      color: primaryColor,
    });
    cursorY -= 6;
    page.drawLine({
      start: { x: margin, y: cursorY },
      end: { x: width - margin, y: cursorY },
      thickness: 1,
      color: rgb(0.85, 0.88, 0.95),
    });
    cursorY -= 16;
  };

  // KPIs Summary Card Grid
  drawSection('Core Business Metrics');

  const cardW = (width - margin * 2 - 30) / 4;
  const cardH = 50;

  const kpis = [
    { label: 'TOTAL REVENUE', val: `Rs ${Math.round(ov.kpis.total_sales).toLocaleString('en-IN')}` },
    { label: 'TRANSACTIONS', val: ov.kpis.total_transactions.toLocaleString('en-IN') },
    { label: 'UNITS SOLD', val: ov.kpis.total_quantity.toLocaleString('en-IN') },
    { label: 'AVG ORDER VALUE', val: `Rs ${Math.round(ov.kpis.average_transaction).toLocaleString('en-IN')}` },
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = margin + idx * (cardW + 10);
    page.drawRectangle({
      x: cardX,
      y: cursorY - cardH,
      width: cardW,
      height: cardH,
      color: lightBgColor,
      borderColor: rgb(0.88, 0.9, 0.96),
      borderWidth: 1,
    });
    page.drawText(kpi.label, {
      x: cardX + 10,
      y: cursorY - 18,
      size: 8,
      font: fontBold,
      color: grayColor,
    });
    page.drawText(kpi.val, {
      x: cardX + 10,
      y: cursorY - 38,
      size: 13,
      font: fontBold,
      color: darkTextColor,
    });
  });

  cursorY -= cardH + 24;

  if (type === 'sales' || type === 'executive') {
    drawSection('Product Category Breakdown');

    // Table Header
    page.drawText('Category', { x: margin + 10, y: cursorY, size: 9, font: fontBold, color: darkTextColor });
    page.drawText('Revenue', { x: margin + 160, y: cursorY, size: 9, font: fontBold, color: darkTextColor });
    page.drawText('Share', { x: margin + 270, y: cursorY, size: 9, font: fontBold, color: darkTextColor });
    page.drawText('Units Sold', { x: margin + 350, y: cursorY, size: 9, font: fontBold, color: darkTextColor });
    page.drawText('Avg Order', { x: margin + 430, y: cursorY, size: 9, font: fontBold, color: darkTextColor });
    cursorY -= 14;

    sa.categories.slice(0, 6).forEach((cat, idx) => {
      const isAlt = idx % 2 === 1;
      if (isAlt) {
        page.drawRectangle({
          x: margin,
          y: cursorY - 4,
          width: width - margin * 2,
          height: 18,
          color: rgb(0.97, 0.98, 1.0),
        });
      }
      page.drawText(cat.category, { x: margin + 10, y: cursorY, size: 9, font, color: darkTextColor });
      page.drawText(`Rs ${Math.round(cat.revenue).toLocaleString('en-IN')}`, { x: margin + 160, y: cursorY, size: 9, font, color: darkTextColor });
      page.drawText(`${cat.share}%`, { x: margin + 270, y: cursorY, size: 9, font, color: darkTextColor });
      page.drawText(`${cat.units.toLocaleString()}`, { x: margin + 350, y: cursorY, size: 9, font, color: darkTextColor });
      page.drawText(`Rs ${cat.avg_order}`, { x: margin + 430, y: cursorY, size: 9, font, color: darkTextColor });
      cursorY -= 20;
    });

    cursorY -= 10;
  }

  if (type === 'forecast' || type === 'executive') {
    drawSection('Predictive Forecasting & Anomaly Status');

    try {
      const fc = getForecast(rows);
      page.drawText(`Selected Forecast Model: ${fc.model} (MAPE: ${fc.mape}%, Backtest Accuracy: ${fc.accuracy}%)`, {
        x: margin,
        y: cursorY,
        size: 9.5,
        font: fontBold,
        color: darkTextColor,
      });
      cursorY -= 15;
      page.drawText(
        `Next month predicted revenue is Rs ${Math.round(fc.next_month_predicted).toLocaleString('en-IN')} with an 80% confidence interval.`,
        { x: margin, y: cursorY, size: 9, font, color: grayColor }
      );
      cursorY -= 20;
    } catch (e: any) {
      page.drawText(`Forecast note: ${e.message}`, { x: margin, y: cursorY, size: 9, font, color: grayColor });
      cursorY -= 20;
    }

    const an = getAnomalies(rows, 3, ANOMALY_THRESHOLD);
    page.drawText(
      `Anomaly Detection: ${an.total} unusual days flagged (rolling 31-day median baseline, threshold z >= ${ANOMALY_THRESHOLD}).`,
      {
        x: margin,
        y: cursorY,
        size: 9,
        font: fontBold,
        color: darkTextColor,
      }
    );
    cursorY -= 14;

    an.data.slice(0, 3).forEach((item) => {
      const anomalyText = sanitizeForPDF(`- Date ${item.date}: Rs ${Math.round(item.value).toLocaleString('en-IN')} (Deviation ${item.deviation}, ${item.severity} severity)`);
      page.drawText(anomalyText, {
        x: margin + 10,
        y: cursorY,
        size: 8.5,
        font,
        color: grayColor,
      });
      cursorY -= 14;
    });

    cursorY -= 10;
  }

  // Key Findings & AI Section
  drawSection(type === 'ai' ? 'Autonomous AI Analysis' : 'Automated Business Insights');

  let findings: string[] = sa.insights;
  if (type === 'ai') {
    const context = buildContext();
    const prompt = 'Summarize key findings, risks, and recommendations for this retail dataset.';
    const aiResult = await askLLM(prompt, context, provider);
    const cleanLines = aiResult.answer
      .split('\n')
      .map((l) => l.replace(/[*#]/g, '').trim())
      .filter((l) => l.length > 5)
      .slice(0, 7);
    if (cleanLines.length > 0) {
      findings = cleanLines;
    }
  }

  findings.forEach((line) => {
    if (cursorY < 70) return;
    const prefix = line.startsWith('•') || line.startsWith('-') ? '' : '- ';
    const textToDraw = sanitizeForPDF((prefix + line).slice(0, 110));
    page.drawText(textToDraw, {
      x: margin,
      y: cursorY,
      size: 9,
      font,
      color: darkTextColor,
    });
    cursorY -= 16;
  });

  // Footer
  page.drawLine({
    start: { x: margin, y: 40 },
    end: { x: width - margin, y: 40 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });

  page.drawText(
    'Autonomous Business Intelligence Platform · IFHE Semester Special Project · Shlok Shinde, Shreyas Mogalapalli, Saniya H D, Navya A · Mentor: Mr. Arram Sriram',
    {
      x: margin,
      y: 28,
      size: 7.5,
      font,
      color: grayColor,
    }
  );

  return await pdfDoc.save();
}
