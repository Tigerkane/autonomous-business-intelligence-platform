module.exports = [
(()=>{"use strict";return[
"[project]/app/api/data/status/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/db.ts [app-route] (ecmascript)");
;
;
const runtime = 'nodejs';
const dynamic = 'force-dynamic';
async function GET() {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hydrate"])();
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["databaseExists"])()) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            database_exists: false,
            rows: 0
        });
    }
    const summary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSalesSummary"])();
    const meta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDatasetMeta"])();
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        database_exists: true,
        ...summary,
        ...meta
    });
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
    "hydrate",
    ()=>hydrate,
    "saveSalesData",
    ()=>saveSalesData
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@vercel/blob/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$cleaner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/cleaner.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$quality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/quality.ts [app-route] (ecmascript)");
;
;
;
;
;
/* ------------------------------------------------------------------ */ /* Storage adapter: local files in dev, Vercel Blob in deployment      */ /* ------------------------------------------------------------------ */ // Blob on Vercel (VERCEL env var is set automatically), local files otherwise.
// Override with STORAGE_BACKEND=local|blob if you ever need to.
const BACKEND = process.env.STORAGE_BACKEND ?? (process.env.VERCEL ? 'blob' : 'local');
// Blob only: public-access blobs. See the access note in the reply.
const BLOB_ACCESS = 'public';
const POINTER_PATH = 'abip/current.json';
const DATASETS_PREFIX = 'abip/datasets/';
/* ---------- local filesystem backend ---------- */ const DATA_DIR = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(process.cwd(), 'data');
const LOCAL_POINTER = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, 'current.json');
const LOCAL_DATASETS = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(DATA_DIR, 'datasets');
const localStorage = {
    async readPointer () {
        try {
            return JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(LOCAL_POINTER, 'utf-8'));
        } catch  {
            return null;
        }
    },
    async readRows (id) {
        return JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(LOCAL_DATASETS, id, 'rows.json'), 'utf-8'));
    },
    async writeRows (id, rows) {
        const dir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(LOCAL_DATASETS, id);
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(dir, {
            recursive: true
        });
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(dir, 'rows.json'), JSON.stringify(rows), 'utf-8');
    },
    async writePointer (ptr) {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(DATA_DIR, {
            recursive: true
        });
        const tmp = `${LOCAL_POINTER}.tmp`;
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(tmp, JSON.stringify(ptr), 'utf-8');
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].renameSync(tmp, LOCAL_POINTER); // rename is atomic
    },
    async removeOtherDatasets (keepId) {
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(LOCAL_DATASETS)) return;
        for (const name of __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(LOCAL_DATASETS)){
            if (name !== keepId) __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].rmSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(LOCAL_DATASETS, name), {
                recursive: true,
                force: true
            });
        }
    },
    async removePointer () {
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(LOCAL_POINTER)) __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(LOCAL_POINTER);
    }
};
/* ---------- Vercel Blob backend ---------- */ async function fetchJson(url) {
    const res = await fetch(url, {
        cache: 'no-store'
    });
    if (!res.ok) throw new Error(`Blob fetch failed (${res.status})`);
    return await res.json();
}
const blobStorage = {
    async readPointer () {
        try {
            const info = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["head"])(POINTER_PATH);
            return await fetchJson(`${info.url}?t=${Date.now()}`); // cache-bust
        } catch  {
            return null;
        }
    },
    async readRows (id) {
        const info = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["head"])(`${DATASETS_PREFIX}${id}/rows.json`);
        return fetchJson(info.url);
    },
    async writeRows (id, rows) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["put"])(`${DATASETS_PREFIX}${id}/rows.json`, JSON.stringify(rows), {
            access: BLOB_ACCESS,
            contentType: 'application/json',
            addRandomSuffix: false
        });
    },
    async writePointer (ptr) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["put"])(POINTER_PATH, JSON.stringify(ptr), {
            access: BLOB_ACCESS,
            contentType: 'application/json',
            addRandomSuffix: false,
            allowOverwrite: true,
            cacheControlMaxAge: 0
        });
    },
    async removeOtherDatasets (keepId) {
        const { blobs } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["list"])({
            prefix: DATASETS_PREFIX
        });
        const stale = blobs.filter((b)=>!keepId || !b.pathname.startsWith(`${DATASETS_PREFIX}${keepId}/`));
        if (stale.length) await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["del"])(stale.map((b)=>b.url));
    },
    async removePointer () {
        try {
            const info = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["head"])(POINTER_PATH);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$vercel$2f$blob$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["del"])(info.url);
        } catch  {
        /* no pointer */ }
    }
};
const storage = BACKEND === 'blob' ? blobStorage : localStorage;
/* ------------------------------------------------------------------ */ /* Cache + public API (same exports as before)                         */ /* ------------------------------------------------------------------ */ let salesCache = null;
let metaCache = null;
let cachedId = null;
let seedPromise = null;
async function hydrate() {
    const ptr = await storage.readPointer();
    if (ptr) {
        if (ptr.id !== cachedId) {
            try {
                salesCache = await storage.readRows(ptr.id);
                metaCache = ptr.meta;
                cachedId = ptr.id;
                console.log(`[DB:${BACKEND}] Loaded ${salesCache.length} rows.`);
            } catch (e) {
                console.error('[DB] Failed to load dataset:', e);
                salesCache = null;
                metaCache = null;
                cachedId = null;
            }
        }
        return;
    }
    salesCache = null;
    metaCache = null;
    cachedId = null;
    // Nothing stored: auto-seed the demo dataset once
    if (!seedPromise) {
        seedPromise = (async ()=>{
            try {
                const { rows, quality } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$cleaner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanSalesData"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$cleaner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateDemoDatasetCSV"])());
                await saveSalesData(rows, 'demo_retail_sales.csv', quality);
                console.log(`[DB:${BACKEND}] Auto-seeded demo dataset with ${rows.length} rows.`);
            } catch (err) {
                console.warn('[DB] Started clean without auto-seed:', err);
            } finally{
                seedPromise = null;
            }
        })();
    }
    await seedPromise;
}
function databaseExists() {
    return !!salesCache && salesCache.length > 0;
}
function getSalesRows() {
    return salesCache ?? [];
}
async function saveSalesData(rows, filename, quality) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const meta = {
        filename,
        uploaded_at: new Date().toISOString(),
        ...quality ? {
            quality
        } : {}
    };
    await storage.writeRows(id, rows); // 1) new data under a fresh path
    await storage.writePointer({
        id,
        meta
    }); // 2) commit
    salesCache = rows;
    metaCache = meta;
    cachedId = id;
    try {
        await storage.removeOtherDatasets(id); // 3) best-effort cleanup
    } catch (e) {
        console.warn('[DB] Old dataset cleanup failed (non-fatal):', e);
    }
}
async function deleteDataset() {
    const existed = databaseExists();
    salesCache = null;
    metaCache = null;
    cachedId = null;
    try {
        await storage.removePointer(); // readers immediately see "no dataset"
        await storage.removeOtherDatasets(null);
    } catch (e) {
        console.error('Error deleting dataset:', e);
    }
    return existed;
}
function getDatasetMeta() {
    const meta = metaCache ?? {
        filename: 'Dataset',
        uploaded_at: new Date().toISOString()
    };
    if (!meta.quality) {
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
    const s = getSalesSummary();
    return {
        total_sales: s.total_sales,
        total_quantity: s.total_quantity,
        total_transactions: s.total_rows,
        average_transaction: s.average_transaction
    };
}
function getSalesPreview(limit = 10) {
    return getSalesRows().slice(0, Math.min(limit, 100));
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
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("events", () => require("events"));

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
"[externals]/node:assert [external] (node:assert, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:assert", () => require("node:assert"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:console [external] (node:console, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:console", () => require("node:console"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:diagnostics_channel [external] (node:diagnostics_channel, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:diagnostics_channel", () => require("node:diagnostics_channel"));

module.exports = mod;
}),
"[externals]/node:dns [external] (node:dns, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:dns", () => require("node:dns"));

module.exports = mod;
}),
"[externals]/node:events [external] (node:events, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:events", () => require("node:events"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:http [external] (node:http, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:http", () => require("node:http"));

module.exports = mod;
}),
"[externals]/node:http2 [external] (node:http2, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:http2", () => require("node:http2"));

module.exports = mod;
}),
"[externals]/node:https [external] (node:https, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:https", () => require("node:https"));

module.exports = mod;
}),
"[externals]/node:net [external] (node:net, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:net", () => require("node:net"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:perf_hooks [external] (node:perf_hooks, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:perf_hooks", () => require("node:perf_hooks"));

module.exports = mod;
}),
"[externals]/node:querystring [external] (node:querystring, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:querystring", () => require("node:querystring"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:tls [external] (node:tls, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:tls", () => require("node:tls"));

module.exports = mod;
}),
"[externals]/node:url [external] (node:url, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:url", () => require("node:url"));

module.exports = mod;
}),
"[externals]/node:util [external] (node:util, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}),
"[externals]/node:util/types [external] (node:util/types, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:util/types", () => require("node:util/types"));

module.exports = mod;
}),
"[externals]/node:worker_threads [external] (node:worker_threads, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:worker_threads", () => require("node:worker_threads"));

module.exports = mod;
}),
"[externals]/node:zlib [external] (node:zlib, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:zlib", () => require("node:zlib"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/string_decoder [external] (string_decoder, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1ecp8z1qs3t-r._.js.map