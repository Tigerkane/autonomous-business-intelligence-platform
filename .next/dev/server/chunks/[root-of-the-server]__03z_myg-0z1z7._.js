module.exports = [
(()=>{"use strict";return[
"[project]/app/api/data/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/db.ts [app-route] (ecmascript)");
;
;
async function DELETE() {
    try {
        const existed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteDataset"])();
        if (!existed) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                detail: 'No dataset found.'
            }, {
                status: 404
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Dataset deleted successfully.'
        });
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            detail: 'Failed to delete dataset.'
        }, {
            status: 500
        });
    }
}
}),
"[project]/server/cleaner.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "REQUIRED_COLUMNS",
    ()=>REQUIRED_COLUMNS,
    "cleanSalesData",
    ()=>cleanSalesData,
    "generateDemoDatasetCSV",
    ()=>generateDemoDatasetCSV,
    "getCSVTemplate",
    ()=>getCSVTemplate,
    "parseCSV",
    ()=>parseCSV
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$quality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/quality.ts [app-route] (ecmascript)");
;
const REQUIRED_COLUMNS = [
    'Transaction ID',
    'Date',
    'Customer ID',
    'Gender',
    'Age',
    'Product Category',
    'Quantity',
    'Price per Unit',
    'Total Amount'
];
function parseCSV(csvText) {
    const lines = [];
    const lineNos = [];
    let currentRow = [];
    let currentField = '';
    let insideQuote = false;
    let physicalLine = 1;
    let rowStartLine = 1;
    const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    for(let i = 0; i < text.length; i++){
        const char = text[i];
        const nextChar = text[i + 1];
        if (char === '"') {
            if (insideQuote && nextChar === '"') {
                currentField += '"';
                i++; // skip escaped quote
            } else {
                insideQuote = !insideQuote;
            }
        } else if (char === ',' && !insideQuote) {
            currentRow.push(currentField.trim());
            currentField = '';
        } else if (char === '\n' && !insideQuote) {
            currentRow.push(currentField.trim());
            if (currentRow.some((val)=>val !== '')) {
                lines.push(currentRow);
                lineNos.push(rowStartLine);
            }
            currentRow = [];
            currentField = '';
            physicalLine++;
            rowStartLine = physicalLine;
        } else {
            if (char === '\n') physicalLine++;
            currentField += char;
        }
    }
    if (currentField.length > 0 || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some((val)=>val !== '')) {
            lines.push(currentRow);
            lineNos.push(rowStartLine);
        }
    }
    if (lines.length === 0) {
        return {
            headers: [],
            rows: [],
            lineNumbers: []
        };
    }
    const rawHeaders = lines[0].map((h)=>h.replace(/^["']|["']$/g, '').trim());
    return {
        headers: rawHeaders,
        rows: lines.slice(1),
        lineNumbers: lineNos.slice(1)
    };
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const normalizeName = (s)=>s.toLowerCase().replace(/[^a-z0-9]/g, '');
function levenshtein(a, b) {
    const dp = Array.from({
        length: b.length + 1
    }, (_, j)=>j);
    for(let i = 1; i <= a.length; i++){
        let prev = dp[0];
        dp[0] = i;
        for(let j = 1; j <= b.length; j++){
            const tmp = dp[j];
            dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
            prev = tmp;
        }
    }
    return dp[b.length];
}
function buildDate(y, m, d, ambiguous) {
    if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
    const dt = new Date(Date.UTC(y, m - 1, d));
    // Reject impossible dates such as 2025-02-30 (JS would roll them over)
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
    return {
        iso: dt.toISOString().slice(0, 10),
        ambiguous
    };
}
/** Returns an ISO date, or null when the text is not a real calendar date. */ function parseDate(raw) {
    const s = (raw || '').trim();
    if (!s) return null;
    // YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD (optionally followed by a time)
    let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s].*)?$/);
    if (m) return buildDate(+m[1], +m[2], +m[3], false);
    // DD-MM-YYYY or MM-DD-YYYY (also with / or .)
    m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:[T\s].*)?$/);
    if (m) {
        const a = +m[1];
        const b = +m[2];
        const y = +m[3];
        if (a > 12 && b <= 12) return buildDate(y, b, a, false); // clearly DD/MM
        if (b > 12 && a <= 12) return buildDate(y, a, b, false); // clearly MM/DD
        if (a <= 12 && b <= 12) return buildDate(y, b, a, a !== b); // ambiguous: assume DD/MM
        return null;
    }
    // Text months such as "15 Jan 2025" or "Jan 15, 2025"
    if (/[a-z]{3,}/i.test(s)) {
        const t = Date.parse(s);
        if (!isNaN(t)) {
            const d = new Date(t);
            return buildDate(d.getFullYear(), d.getMonth() + 1, d.getDate(), false);
        }
    }
    return null;
}
/** Parses numbers such as 1200, "1,200.50", "₹1,200", "$5", "(500)". Returns null if blank or not numeric. */ function parseNumber(raw) {
    if (raw === undefined) return null;
    let s = raw.trim();
    if (s === '') return null;
    let negative = false;
    if (/^\(.*\)$/.test(s)) {
        negative = true;
        s = s.slice(1, -1);
    }
    s = s.replace(/[₹$€£\s,]/g, '');
    if (s === '' || !/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
    const n = Number(s);
    if (isNaN(n)) return null;
    return negative ? -Math.abs(n) : n;
}
class IssueTracker {
    map = new Map();
    add(code, label, severity, row, detail) {
        let issue = this.map.get(code);
        if (!issue) {
            issue = {
                code,
                label,
                severity,
                count: 0,
                examples: []
            };
            this.map.set(code, issue);
        }
        issue.count++;
        if (issue.examples.length < 5) issue.examples.push({
            row,
            detail
        });
    }
    list() {
        return [
            ...this.map.values()
        ].sort((a, b)=>a.severity === b.severity ? b.count - a.count : a.severity === 'error' ? -1 : 1);
    }
}
function cleanSalesData(csvContent) {
    // Excel often saves CSVs with a UTF-8 byte-order mark, which would corrupt the first header name
    const text = csvContent.replace(/^\uFEFF/, '');
    const { headers, rows, lineNumbers } = parseCSV(text);
    if (headers.length === 0) {
        throw new Error('The file is empty.');
    }
    if (headers.length === 1 && /[;\t|]/.test(headers[0])) {
        throw new Error('This file does not look comma-separated (it appears to use semicolons, tabs or pipes). Re-save it as a comma-separated CSV and upload it again.');
    }
    // Match required columns ignoring case, spaces, underscores and hyphens
    const headerMap = new Map();
    headers.forEach((h, idx)=>{
        const key = normalizeName(h);
        if (!headerMap.has(key)) headerMap.set(key, idx);
    });
    const missingColumns = [];
    const colIndexes = {};
    for (const col of REQUIRED_COLUMNS){
        const idx = headerMap.get(normalizeName(col));
        if (idx === undefined) {
            missingColumns.push(col);
        } else {
            colIndexes[col] = idx;
        }
    }
    if (missingColumns.length > 0) {
        const usedIdx = new Set(Object.values(colIndexes));
        const hints = [];
        for (const col of missingColumns){
            let best = null;
            headers.forEach((h, idx)=>{
                if (usedIdx.has(idx)) return;
                const d = levenshtein(normalizeName(h), normalizeName(col));
                if (d <= 3 && (!best || d < best.d)) best = {
                    h,
                    d
                };
            });
            if (best) hints.push(`Rename "${best.h}" to "${col}".`);
        }
        throw new Error([
            `Missing required column${missingColumns.length > 1 ? 's' : ''}: ${missingColumns.join(', ')}.`,
            `Columns found in your file: ${headers.join(', ')}.`,
            ...hints
        ].join('\n'));
    }
    if (rows.length === 0) {
        throw new Error('The file has a header row but no data rows.');
    }
    const rowsBefore = rows.length;
    let duplicatesRemoved = 0;
    let duplicateIdConflicts = 0;
    let invalidDatesRemoved = 0;
    let numericMissingRowsRemoved = 0;
    let negativeRemoved = 0;
    let zeroRemoved = 0;
    let ambiguousDates = 0;
    let totalMismatchRows = 0;
    const tracker = new IssueTracker();
    // Blank cells per required column, counted on the raw file before any cleaning
    const missingValues = {};
    for (const col of REQUIRED_COLUMNS){
        let blanks = 0;
        for (const row of rows){
            const v = row[colIndexes[col]];
            if (v === undefined || v.trim() === '') blanks++;
        }
        missingValues[col] = blanks;
    }
    const seenById = new Map();
    const seenSignatures = new Set();
    const cleanedRows = [];
    for(let r = 0; r < rows.length; r++){
        const row = rows[r];
        const line = lineNumbers[r];
        const transactionId = (row[colIndexes['Transaction ID']] || '').trim();
        const rawDate = row[colIndexes['Date']] || '';
        const customerId = (row[colIndexes['Customer ID']] || 'Unknown').trim();
        const gender = (row[colIndexes['Gender']] || 'Unknown').trim();
        const rawAge = row[colIndexes['Age']];
        const category = (row[colIndexes['Product Category']] || 'Unknown').trim();
        const rawQuantity = row[colIndexes['Quantity']];
        const rawPrice = row[colIndexes['Price per Unit']];
        const rawTotal = row[colIndexes['Total Amount']];
        // 1. Date
        const parsedDate = parseDate(rawDate);
        if (!parsedDate) {
            invalidDatesRemoved++;
            tracker.add('invalid_date', 'with invalid or unreadable dates', 'error', line, rawDate.trim() === '' ? 'blank date' : `"${rawDate.trim()}"`);
            continue;
        }
        // 2. Numeric columns (a blank Age is kept as 0; a non-numeric Age drops the row)
        const ageBlank = rawAge === undefined ? false : rawAge.trim() === '';
        const ageParsed = parseNumber(rawAge);
        const quantity = parseNumber(rawQuantity);
        const price = parseNumber(rawPrice);
        const total = parseNumber(rawTotal);
        const badNumeric = [];
        if (!ageBlank && ageParsed === null) badNumeric.push(`Age "${rawAge ?? ''}"`);
        if (quantity === null) badNumeric.push(`Quantity "${rawQuantity ?? ''}"`);
        if (price === null) badNumeric.push(`Price per Unit "${rawPrice ?? ''}"`);
        if (total === null) badNumeric.push(`Total Amount "${rawTotal ?? ''}"`);
        if (badNumeric.length > 0) {
            numericMissingRowsRemoved++;
            tracker.add('missing_numeric', 'with missing or non-numeric Age, Quantity, Price or Total', 'error', line, badNumeric.join(', '));
            continue;
        }
        const age = ageParsed ?? 0;
        const q = quantity;
        const p = price;
        const t = total;
        // 3. Business constraints
        if (q < 0 || p < 0 || t < 0) {
            negativeRemoved++;
            const parts = [];
            if (q < 0) parts.push(`Quantity ${q}`);
            if (p < 0) parts.push(`Price ${p}`);
            if (t < 0) parts.push(`Total ${t}`);
            tracker.add('negative_amount', 'with negative Quantity, Price or Total', 'error', line, parts.join(', '));
            continue;
        }
        if (q === 0 || p === 0 || t === 0) {
            zeroRemoved++;
            const parts = [];
            if (q === 0) parts.push('Quantity 0');
            if (p === 0) parts.push('Price 0');
            if (t === 0) parts.push('Total 0');
            tracker.add('zero_amount', 'with zero Quantity, Price or Total', 'error', line, parts.join(', '));
            continue;
        }
        // 4. Duplicates (only valid rows count, so a bad first copy never blocks a good second copy)
        const signature = row.join('|||');
        if (transactionId !== '') {
            const first = seenById.get(transactionId);
            if (first) {
                duplicatesRemoved++;
                const conflict = first.signature !== signature;
                if (conflict) duplicateIdConflicts++;
                tracker.add('duplicate_id', 'with duplicate Transaction IDs (first occurrence kept)', 'error', line, `${transactionId} (first seen on row ${first.line}${conflict ? ', different values' : ''})`);
                continue;
            }
            seenById.set(transactionId, {
                line,
                signature
            });
        } else {
            if (seenSignatures.has(signature)) {
                duplicatesRemoved++;
                tracker.add('duplicate_id', 'with duplicate Transaction IDs (first occurrence kept)', 'error', line, 'identical row with a blank Transaction ID');
                continue;
            }
            seenSignatures.add(signature);
            tracker.add('blank_id', 'with a blank Transaction ID (kept)', 'warning', line, 'blank Transaction ID');
        }
        // Warnings on rows that are kept
        if (parsedDate.ambiguous) {
            ambiguousDates++;
            tracker.add('ambiguous_date', 'with ambiguous dates read as DD/MM/YYYY (kept)', 'warning', line, `"${rawDate.trim()}"`);
        }
        if (Math.abs(t - q * p) > Math.max(1, 0.01 * t)) {
            totalMismatchRows++;
            tracker.add('total_mismatch', 'where Total Amount differs from Quantity × Price by more than 1% (kept)', 'warning', line, `${q} × ${p} = ${Math.round(q * p * 100) / 100}, file says ${t}`);
        }
        cleanedRows.push({
            transaction_id: transactionId,
            date: parsedDate.iso,
            customer_id: customerId,
            gender: gender,
            age: Math.round(age),
            product_category: category,
            quantity: Math.round(q),
            price_per_unit: p,
            total_amount: t
        });
    }
    const report = {
        rows_before: rowsBefore,
        rows_after: cleanedRows.length,
        duplicates_removed: duplicatesRemoved,
        invalid_dates_removed: invalidDatesRemoved,
        numeric_missing_rows_removed: numericMissingRowsRemoved,
        invalid_business_rows_removed: negativeRemoved + zeroRemoved,
        columns: [
            'transaction_id',
            'date',
            'customer_id',
            'gender',
            'age',
            'product_category',
            'quantity',
            'price_per_unit',
            'total_amount'
        ],
        duplicate_id_conflicts: duplicateIdConflicts,
        negative_values_removed: negativeRemoved,
        zero_values_removed: zeroRemoved,
        ambiguous_dates: ambiguousDates,
        total_mismatch_rows: totalMismatchRows
    };
    const coverage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$quality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["summarizeCoverage"])(cleanedRows);
    const quality = {
        source: 'upload',
        rows_in_file: rowsBefore,
        rows_kept: cleanedRows.length,
        rows_dropped: rowsBefore - cleanedRows.length,
        ...coverage,
        missing_values: missingValues,
        warnings: (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$quality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildWarnings"])(coverage, cleanedRows.length, rowsBefore),
        issues: tracker.list()
    };
    return {
        rows: cleanedRows,
        report,
        quality
    };
}
function getCSVTemplate() {
    return [
        'Transaction ID,Date,Customer ID,Gender,Age,Product Category,Quantity,Price per Unit,Total Amount',
        'TXN001,2023-01-15,CUST101,Female,28,Beauty,2,500,1000',
        'TXN002,2023-01-16,CUST102,Male,34,Electronics,1,1200,1200',
        'TXN003,2023-01-17,CUST103,Female,45,Clothing,3,350,1050',
        'TXN004,2023-02-05,CUST104,Male,22,Electronics,2,600,1200',
        'TXN005,2023-02-14,CUST105,Female,31,Beauty,4,250,1000'
    ].join('\n');
}
function generateDemoDatasetCSV() {
    const categories = [
        'Electronics',
        'Clothing',
        'Beauty'
    ];
    const prices = {
        Electronics: [
            300,
            500,
            800,
            1200,
            1500
        ],
        Clothing: [
            150,
            250,
            350,
            500,
            750
        ],
        Beauty: [
            80,
            150,
            250,
            400,
            500
        ]
    };
    const genders = [
        'Male',
        'Female'
    ];
    const rows = [
        'Transaction ID,Date,Customer ID,Gender,Age,Product Category,Quantity,Price per Unit,Total Amount'
    ];
    // Generate 1000 deterministic realistic rows across 2023
    let txn = 1;
    const startDate = new Date(Date.UTC(2023, 0, 1));
    for(let i = 0; i < 1000; i++){
        const dayOffset = Math.floor(i / 1000 * 364);
        const date = new Date(startDate);
        date.setUTCDate(date.getUTCDate() + dayOffset);
        const dateStr = date.toISOString().slice(0, 10);
        const category = categories[i % categories.length];
        const catPrices = prices[category];
        const price = catPrices[(i * 7 + 3) % catPrices.length];
        const quantity = 1 + i % 4;
        const total = price * quantity;
        const gender = genders[i * 3 % 2];
        const age = 18 + (i * 13 + 7) % 52;
        const customerId = `CUST${String(100 + i % 180).padStart(4, '0')}`;
        rows.push(`${txn},${dateStr},${customerId},${gender},${age},${category},${quantity},${price},${total}`);
        txn++;
    }
    return rows.join('\n');
}
}),
"[project]/server/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "databaseExists",
    ()=>databaseExists,
    "deleteDataset",
    ()=>deleteDataset,
    "ensureDatabase",
    ()=>ensureDatabase,
    "getDatasetMeta",
    ()=>getDatasetMeta,
    "getKPIs",
    ()=>getKPIs,
    "getSalesPreview",
    ()=>getSalesPreview,
    "getSalesRows",
    ()=>getSalesRows,
    "getSalesSummary",
    ()=>getSalesSummary,
    "initDatabase",
    ()=>initDatabase,
    "saveSalesData",
    ()=>saveSalesData
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$cleaner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/cleaner.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$quality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/quality.ts [app-route] (ecmascript)");
;
;
;
;
const DATA_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(process.cwd(), 'data');
const DB_FILE = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, 'retail_bi.json');
const META_FILE = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, 'dataset_meta.json');
const SAMPLE_CSV = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, 'retail_sales.csv');
// In-memory cache for fast analytical aggregation
let salesCache = null;
let metaCache = null;
function ensureDataDir() {
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(DATA_DIR)) {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(DATA_DIR, {
            recursive: true
        });
    }
}
function initDatabase() {
    ensureDataDir();
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(DB_FILE) && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(META_FILE)) {
        try {
            salesCache = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(DB_FILE, 'utf-8'));
            metaCache = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(META_FILE, 'utf-8'));
            if (salesCache && salesCache.length > 0) {
                console.log(`[DB] Loaded ${salesCache.length} rows from disk cache.`);
                return;
            }
        } catch (e) {
            console.warn('[DB] Failed to read disk cache, initializing fallback...');
        }
    }
    // Auto-seed with demo dataset so new sessions have active models and forecasts
    try {
        const csvContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$cleaner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateDemoDatasetCSV"])();
        const { rows, quality } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$cleaner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanSalesData"])(csvContent);
        saveSalesData(rows, 'demo_retail_sales.csv', quality);
        console.log(`[DB] Auto-seeded demo dataset with ${rows.length} rows.`);
    } catch (err) {
        salesCache = null;
        metaCache = null;
        console.warn('[DB] Started clean without auto-seed:', err);
    }
}
let isDbInit = false;
function ensureDatabase() {
    if (!isDbInit) {
        isDbInit = true;
        initDatabase();
    }
}
function databaseExists() {
    ensureDatabase();
    if (salesCache && salesCache.length > 0) return true;
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(DB_FILE)) {
        try {
            salesCache = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(DB_FILE, 'utf-8'));
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(META_FILE)) {
                metaCache = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(META_FILE, 'utf-8'));
            }
            return salesCache && salesCache.length > 0 || false;
        } catch  {
            return false;
        }
    }
    return false;
}
function getSalesRows() {
    ensureDatabase();
    if (salesCache) return salesCache;
    if (databaseExists() && salesCache) return salesCache;
    return [];
}
function saveSalesData(rows, filename, quality) {
    ensureDataDir();
    salesCache = rows;
    metaCache = {
        filename,
        uploaded_at: new Date().toISOString(),
        ...quality ? {
            quality
        } : {}
    };
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(DB_FILE, JSON.stringify(rows), 'utf-8');
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(META_FILE, JSON.stringify(metaCache), 'utf-8');
}
function deleteDataset() {
    const existed = databaseExists();
    salesCache = null;
    metaCache = null;
    try {
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(DB_FILE)) __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(DB_FILE);
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(META_FILE)) __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(META_FILE);
    } catch (e) {
        console.error('Error deleting dataset files:', e);
    }
    return existed;
}
function readMeta() {
    if (metaCache) return metaCache;
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(META_FILE)) {
        try {
            metaCache = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(META_FILE, 'utf-8'));
            return metaCache;
        } catch  {
        // return default
        }
    }
    return {
        filename: 'Dataset',
        uploaded_at: new Date().toISOString()
    };
}
function getDatasetMeta() {
    const meta = readMeta();
    if (!meta.quality) {
        // Datasets saved before validation summaries existed: recompute what we can from the stored rows
        const rows = getSalesRows();
        if (rows.length > 0) return {
            ...meta,
            quality: (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$quality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["qualityFromRows"])(rows)
        };
    }
    return meta;
}
function getSalesSummary() {
    const rows = getSalesRows();
    if (rows.length === 0) {
        return {
            total_rows: 0,
            total_quantity: 0,
            total_sales: 0,
            average_transaction: 0
        };
    }
    let totalQuantity = 0;
    let totalSales = 0;
    for (const row of rows){
        totalQuantity += row.quantity;
        totalSales += row.total_amount;
    }
    return {
        total_rows: rows.length,
        total_quantity: totalQuantity,
        total_sales: Math.round(totalSales * 100) / 100,
        average_transaction: Math.round(totalSales / rows.length * 100) / 100
    };
}
function getKPIs() {
    const summary = getSalesSummary();
    return {
        total_sales: summary.total_sales,
        total_quantity: summary.total_quantity,
        total_transactions: summary.total_rows,
        average_transaction: summary.average_transaction
    };
}
function getSalesPreview(limit = 10) {
    const rows = getSalesRows();
    return rows.slice(0, Math.min(limit, 100));
}
}),
"[project]/server/quality.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildWarnings",
    ()=>buildWarnings,
    "describeIssues",
    ()=>describeIssues,
    "qualityFromRows",
    ()=>qualityFromRows,
    "summarizeCoverage",
    ()=>summarizeCoverage
]);
function describeIssues(q) {
    const errs = q.issues.filter((i)=>i.severity === 'error' && i.count > 0);
    if (errs.length === 0) return '';
    return errs.map((i)=>{
        const where = i.examples.length ? ` (e.g. ${i.examples.map((e)=>`row ${e.row}`).join(', ')})` : '';
        return `${i.count} ${i.count === 1 ? 'row' : 'rows'} ${i.label}${where}`;
    }).join('; ') + '.';
}
function summarizeCoverage(rows) {
    if (rows.length === 0) {
        return {
            date_start: '',
            date_end: '',
            span_days: 0,
            months_with_data: 0,
            days_with_sales: 0,
            avg_transactions_per_day: 0
        };
    }
    const days = new Set();
    const months = new Set();
    let min = rows[0].date;
    let max = rows[0].date;
    for (const r of rows){
        days.add(r.date);
        months.add(r.date.slice(0, 7));
        if (r.date < min) min = r.date;
        if (r.date > max) max = r.date;
    }
    const span = Math.round((Date.parse(`${max}T00:00:00Z`) - Date.parse(`${min}T00:00:00Z`)) / 86400000) + 1;
    return {
        date_start: min,
        date_end: max,
        span_days: span,
        months_with_data: months.size,
        days_with_sales: days.size,
        avg_transactions_per_day: Math.round(rows.length / span * 100) / 100
    };
}
function buildWarnings(c, rowsKept, rowsInFile) {
    const w = [];
    if (rowsKept === 0) return w;
    if (c.months_with_data < 6) {
        w.push(`Very short history: only ${c.months_with_data} month(s) of data (${c.date_start} to ${c.date_end}). The forecast will be unreliable.`);
    } else if (c.months_with_data < 24) {
        w.push(`Short history: ${c.months_with_data} months of data (${c.date_start} to ${c.date_end}). Forecasts are indicative only; 24+ months are needed to model seasonality.`);
    }
    if (c.avg_transactions_per_day < 5) {
        w.push(`Low volume: about ${c.avg_transactions_per_day} transactions per day on average, so daily revenue and anomaly scores will be noisy.`);
    }
    const gapDays = c.span_days - c.days_with_sales;
    if (c.span_days > 0 && gapDays / c.span_days > 0.1) {
        w.push(`${gapDays} of ${c.span_days} days in the date range have no sales (${Math.round(gapDays / c.span_days * 100)}%).`);
    }
    if (rowsKept < 100) {
        w.push(`Small dataset: only ${rowsKept} valid rows. Statistics may not be representative.`);
    }
    const dropped = rowsInFile - rowsKept;
    if (rowsInFile > 0 && dropped / rowsInFile > 0.1) {
        w.push(`${dropped} of ${rowsInFile} rows (${Math.round(dropped / rowsInFile * 100)}%) were dropped during validation. Check the source file.`);
    }
    return w;
}
function qualityFromRows(rows) {
    const c = summarizeCoverage(rows);
    return {
        source: 'stored',
        rows_in_file: rows.length,
        rows_kept: rows.length,
        rows_dropped: 0,
        ...c,
        missing_values: {},
        warnings: buildWarnings(c, rows.length, rows.length),
        issues: []
    };
}
}),
]})(),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__03z_myg-0z1z7._.js.map