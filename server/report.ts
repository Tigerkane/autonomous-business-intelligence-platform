import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { getAnomalies, getForecast, getOverview, getSalesAnalysis } from './analytics';
import { getDatasetMeta, getSalesRows } from './db';
import { askLLM, buildContext } from './llm';
import { getStockRecommendations } from './insights';

const ANOMALY_THRESHOLD = 3.5;

export async function generatePDFReport(uid: string, type: 'executive' | 'sales' | 'forecast' | 'ai', provider?: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const margin = 40;
  let cursorY = height - 50;
  const ensureSpace = (needed: number) => {
    if (cursorY - needed < 60) {
      page = pdfDoc.addPage([595.28, 841.89]);
      cursorY = height - 50;
    }
  };

  const primaryColor = rgb(0.258, 0.165, 0.984); // #422AFB brand
  const darkTextColor = rgb(0.106, 0.145, 0.294); // #1B254B
  const grayColor = rgb(0.4, 0.45, 0.55);
  const lightBgColor = rgb(0.957, 0.969, 0.996);

  const rows = getSalesRows(uid);
  const meta = getDatasetMeta(uid);
  const ov = getOverview(uid, rows);
  const sa = getSalesAnalysis(uid, rows);

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

    cursorY -= 6;

    // Customer Gender Demographics Split
    drawSection('Customer Gender Distribution');
    const genderStats = sa.gender_analysis?.stats || [];
    if (genderStats.length > 0) {
      page.drawText('Gender', { x: margin + 10, y: cursorY, size: 9, font: fontBold, color: darkTextColor });
      page.drawText('Orders', { x: margin + 120, y: cursorY, size: 9, font: fontBold, color: darkTextColor });
      page.drawText('Units', { x: margin + 200, y: cursorY, size: 9, font: fontBold, color: darkTextColor });
      page.drawText('Revenue', { x: margin + 270, y: cursorY, size: 9, font: fontBold, color: darkTextColor });
      page.drawText('Avg Basket', { x: margin + 370, y: cursorY, size: 9, font: fontBold, color: darkTextColor });
      page.drawText('Share', { x: margin + 450, y: cursorY, size: 9, font: fontBold, color: darkTextColor });
      cursorY -= 14;

      genderStats.forEach((gStat: any, idx: number) => {
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
        page.drawText(gStat.gender, { x: margin + 10, y: cursorY, size: 9, font, color: darkTextColor });
        page.drawText(gStat.orders.toLocaleString(), { x: margin + 120, y: cursorY, size: 9, font, color: darkTextColor });
        page.drawText(gStat.units.toLocaleString(), { x: margin + 200, y: cursorY, size: 9, font, color: darkTextColor });
        page.drawText(`Rs ${Math.round(gStat.revenue).toLocaleString('en-IN')}`, { x: margin + 270, y: cursorY, size: 9, font, color: darkTextColor });
        page.drawText(`Rs ${Math.round(gStat.avg_basket).toLocaleString('en-IN')}`, { x: margin + 370, y: cursorY, size: 9, font, color: darkTextColor });
        page.drawText(`${gStat.share}%`, { x: margin + 450, y: cursorY, size: 9, font, color: darkTextColor });
        cursorY -= 18;
      });
      cursorY -= 6;
    }
  }

  if (type === 'forecast' || type === 'executive') {
    drawSection('Predictive Forecasting & Anomaly Status');

    try {
      const fc = getForecast(uid, rows);
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

    const an = getAnomalies(uid, rows, 3, ANOMALY_THRESHOLD);
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

  // Period forecast & stock recommendation (only in the reports where it is relevant)
  if (type === 'forecast' || type === 'executive') {
    try {
      const st = getStockRecommendations(uid, 'quarter', rows);
      ensureSpace(150);
      drawSection('Stock Recommendation (Next Quarter)');

      // Wrap the headline into lines of ~95 characters
      const words = sanitizeForPDF(st.headline).split(' ');
      const lines: string[] = [];
      let cur = '';
      for (const w of words) {
        if ((cur + ' ' + w).trim().length > 95) { lines.push(cur.trim()); cur = w; } else { cur += ' ' + w; }
      }
      if (cur.trim()) lines.push(cur.trim());
      lines.forEach((ln) => {
        page.drawText(ln, { x: margin, y: cursorY, size: 9.5, font: fontBold, color: darkTextColor });
        cursorY -= 13;
      });
      cursorY -= 6;

      page.drawText('Category', { x: margin + 10, y: cursorY, size: 9, font: fontBold, color: darkTextColor });
      page.drawText('Forecast Revenue', { x: margin + 130, y: cursorY, size: 9, font: fontBold, color: darkTextColor });
      page.drawText(`vs ${st.compared_with}`, { x: margin + 260, y: cursorY, size: 9, font: fontBold, color: darkTextColor });
      page.drawText('Action', { x: margin + 410, y: cursorY, size: 9, font: fontBold, color: darkTextColor });
      cursorY -= 14;

      st.recommendations.forEach((r, idx) => {
        if (idx % 2 === 1) {
          page.drawRectangle({ x: margin, y: cursorY - 4, width: width - margin * 2, height: 18, color: rgb(0.97, 0.98, 1.0) });
        }
        const trend = `${r.trend_pct >= 0 ? '+' : ''}${r.trend_pct}%`;
        page.drawText(r.category, { x: margin + 10, y: cursorY, size: 9, font, color: darkTextColor });
        page.drawText(`Rs ${r.forecast_revenue.toLocaleString('en-IN')}`, { x: margin + 130, y: cursorY, size: 9, font, color: darkTextColor });
        page.drawText(trend, { x: margin + 260, y: cursorY, size: 9, font, color: darkTextColor });
        page.drawText(r.action, { x: margin + 410, y: cursorY, size: 9, font: r.action === 'Increase stock' ? fontBold : font, color: darkTextColor });
        cursorY -= 20;
      });
      page.drawText('Based on complete quarters of past sales. Profit uses assumed category margins.', {
        x: margin, y: cursorY, size: 7.5, font, color: grayColor,
      });
      cursorY -= 20;
    } catch {
      // Not enough complete history: skip this section rather than fail the report.
    }
  }

  // Key Findings & AI Section
  drawSection(type === 'ai' ? 'Autonomous AI Analysis' : 'Automated Business Insights');

  let findings: string[] = sa.insights;
  if (type === 'ai') {
    const context = buildContext(uid);
    const prompt = 'Summarize key findings, risks, and recommendations for this retail dataset.';
    const aiResult = await askLLM(uid, prompt, context, provider);

    // The built-in solver answers only specific questions, so when no AI model is
    // active it replies with a help message. Never print that in a report.
    const isSolverHelp =
      /couldn't match that question/i.test(aiResult.answer) ||
      /No estimation or generated text/i.test(aiResult.answer);

    if (!isSolverHelp) {
      const cleanLines = aiResult.answer
        .split('\n')
        .map((l) => l.replace(/[*#_]/g, '').trim())
        .filter((l) => l.length > 5)
        .slice(0, 10);
      if (cleanLines.length > 0) findings = cleanLines;
    } else {
      // Data-driven strategic summary (no AI model needed)
      const summary: string[] = [...sa.insights.slice(0, 3)];
      try {
        const an = getAnomalies(uid, rows, 3, ANOMALY_THRESHOLD);
        summary.push(`Risk: ${an.total} unusual sales days were flagged, so check those dates for stock-outs, promotions or data errors.`);
      } catch {
        // skip when there is not enough history
      }
      try {
        const st = getStockRecommendations(uid, 'quarter', rows);
        summary.push(`Recommendation: ${st.headline}`);
        const reduce = st.recommendations.find((r) => r.action === 'Review / reduce stock');
        if (reduce) summary.push(`Review ${reduce.category}: its forecast is falling versus last year.`);
      } catch {
        // skip when there is not enough history
      }
      findings = summary;
    }
  }

  // Wrap long lines instead of cutting them off
  const wrap = (text: string, maxChars: number) => {
    const out: string[] = [];
    let cur = '';
    for (const w of text.split(' ')) {
      if ((cur + ' ' + w).trim().length > maxChars) { out.push(cur.trim()); cur = w; } else { cur += ' ' + w; }
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  };

  findings.forEach((line) => {
    const prefix = line.startsWith('•') || line.startsWith('-') ? '' : '- ';
    const wrapped = wrap(sanitizeForPDF(prefix + line), 105);
    ensureSpace(wrapped.length * 13 + 5);
    wrapped.forEach((ln, i) => {
      page.drawText(i === 0 ? ln : '  ' + ln, { x: margin, y: cursorY, size: 9, font, color: darkTextColor });
      cursorY -= 13;
    });
    cursorY -= 4;
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
