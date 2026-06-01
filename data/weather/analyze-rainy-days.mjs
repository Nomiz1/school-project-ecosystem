import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import ExcelJS from "exceljs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const files = [
  "smhi-opendata_5_97160_199101_200012.csv",
  "smhi-opendata_5_97160_200101_201012.csv",
  "smhi-opendata_5_97160_201101_202012.csv",
];

// monthIndex (0-11) -> year -> rainyDayCount
const rainyDaysByMonthYear = {};
for (let m = 0; m < 12; m++) rainyDaysByMonthYear[m] = {};

for (const file of files) {
  const raw = readFileSync(join(__dirname, file), "utf-8");
  const lines = raw.split("\n");

  let dataStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("Fr")) {
      dataStart = i + 1;
      break;
    }
  }
  if (dataStart === -1) {
    console.error("No header found in", file);
    continue;
  }

  for (let i = dataStart; i < lines.length; i++) {
    const parts = lines[i].split(";");
    if (parts.length < 4) continue;

    const dateStr = parts[2].trim(); // "1996-10-01"
    const mmStr = parts[3].trim();
    if (!dateStr || !mmStr) continue;

    const mm = parseFloat(mmStr.replace(",", "."));
    if (!isFinite(mm)) continue;

    const dateParts = dateStr.split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    if (!year || !month) continue;

    const monthIndex = month - 1;
    if (!rainyDaysByMonthYear[monthIndex][year]) {
      rainyDaysByMonthYear[monthIndex][year] = 0;
    }
    if (mm > 0) {
      rainyDaysByMonthYear[monthIndex][year]++;
    }
  }
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// monthIndex -> year -> total mm for that month
const totalMmByMonthYear = {};
for (let m = 0; m < 12; m++) totalMmByMonthYear[m] = {};

// Beräkna total månadsnederbörd från rådata
for (const file of files) {
  const raw = readFileSync(join(__dirname, file), "utf-8");
  const lines = raw.split("\n");

  let dataStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("Fr")) { dataStart = i + 1; break; }
  }
  if (dataStart === -1) continue;

  for (let i = dataStart; i < lines.length; i++) {
    const parts = lines[i].split(";");
    if (parts.length < 4) continue;
    const dateStr = parts[2].trim();
    const mmStr = parts[3].trim();
    if (!dateStr || !mmStr) continue;
    const mm = parseFloat(mmStr.replace(",", "."));
    if (!isFinite(mm)) continue;
    const dateParts = dateStr.split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    if (!year || !month || year < 1991 || year > 2020) continue;
    
    const monthIndex = month - 1;
    if (!totalMmByMonthYear[monthIndex][year]) {
      totalMmByMonthYear[monthIndex][year] = 0;
    }
    totalMmByMonthYear[monthIndex][year] += mm;
  }
}

// Använd 1991-2020 för att matcha normalperioden
console.log("Månatlig genomsnittlig nederbörd från rådata (1991-2020)");
console.log("========================================================");
console.log("Månad | Genomsn. månad (mm) | År i beräkning");
console.log("------|----------------------|-----------------------------");

for (let m = 0; m < 12; m++) {
  const allYears = Object.keys(totalMmByMonthYear[m]).map(Number).sort();
  const filtered = allYears.filter((y) => y >= 1991 && y <= 2020);
  const values = filtered.map((y) => totalMmByMonthYear[m][y]);

  if (values.length === 0) {
    console.log(`${monthNames[m].padEnd(5)} | ingen data`);
    continue;
  }

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const yearRange = `${filtered[0]}-${filtered[filtered.length - 1]} (${filtered.length} år)`;

  console.log(
    `${monthNames[m].padEnd(5)} | ${avg.toFixed(1).padStart(18)} | ${yearRange}`
  );
}


for (let m = 0; m < 12; m++) {
  const allYears = Object.keys(rainyDaysByMonthYear[m]).map(Number).sort();
  const filtered = allYears.filter((y) => y >= 1991 && y <= 2020);
  const values = filtered.map((y) => rainyDaysByMonthYear[m][y]);

  if (values.length === 0) {
    console.log(`${monthNames[m].padEnd(5)} | ingen data`);
    continue;
  }

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const share = avg / MONTH_DAYS[m];
  const yearRange = `${filtered[0]}-${filtered[filtered.length - 1]} (${filtered.length} år)`;

  console.log(
    `${monthNames[m].padEnd(5)} | ${avg.toFixed(1).padStart(13)} | ${share.toFixed(3).padStart(14)} | ${yearRange}`
  );
}

// --- Intensity and wet spell analysis ---

// monthIndex -> array of all rainy day mm values (1991-2020)
const rainyDayMmByMonth = {};
for (let m = 0; m < 12; m++) rainyDayMmByMonth[m] = [];

// monthIndex -> array of wet spell lengths
const wetSpellLengthsByMonth = {};
for (let m = 0; m < 12; m++) wetSpellLengthsByMonth[m] = [];

for (const file of files) {
  const raw = readFileSync(join(__dirname, file), "utf-8");
  const lines = raw.split("\n");

  let dataStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("Fr")) { dataStart = i + 1; break; }
  }
  if (dataStart === -1) continue;

  // Collect all daily rows for this file: { monthIndex, mm, date }
  const rows = [];
  for (let i = dataStart; i < lines.length; i++) {
    const parts = lines[i].split(";");
    if (parts.length < 4) continue;
    const dateStr = parts[2].trim();
    const mmStr = parts[3].trim();
    if (!dateStr || !mmStr) continue;
    const mm = parseFloat(mmStr.replace(",", "."));
    if (!isFinite(mm)) continue;
    const dateParts = dateStr.split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    if (!year || !month || year < 1991 || year > 2020) continue;
    rows.push({ monthIndex: month - 1, mm, dateStr });
  }

  // Collect rainy day mm values per month
  for (const row of rows) {
    if (row.mm > 0) {
      rainyDayMmByMonth[row.monthIndex].push(row.mm);
    }
  }

  // Compute wet spell lengths: group consecutive rainy days, tag by starting month
  let spellLength = 0;
  let spellMonth = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].mm > 0) {
      if (spellLength === 0) spellMonth = rows[i].monthIndex;
      spellLength++;
    } else {
      if (spellLength > 0) {
        wetSpellLengthsByMonth[spellMonth].push(spellLength);
      }
      spellLength = 0;
      spellMonth = -1;
    }
  }
  if (spellLength > 0) wetSpellLengthsByMonth[spellMonth].push(spellLength);
}

function percentile(sorted, p) {
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

console.log("\nIntensitet och våtperioder per månad (1991-2020)");
console.log("=================================================");
console.log("Månad | p10 (min) | p90 (max) | medel regndag | wetSpellDays");
console.log("------|-----------|-----------|---------------|-------------");

for (let m = 0; m < 12; m++) {
  const vals = rainyDayMmByMonth[m].slice().sort((a, b) => a - b);
  const p10 = percentile(vals, 10);
  const p90 = percentile(vals, 90);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;

  const spells = wetSpellLengthsByMonth[m];
  const avgSpell = spells.length > 0
    ? spells.reduce((a, b) => a + b, 0) / spells.length
    : 0;

  console.log(
    `${monthNames[m].padEnd(5)} | ${p10.toFixed(1).padStart(9)} | ${p90.toFixed(1).padStart(9)} | ${mean.toFixed(1).padStart(13)} | ${avgSpell.toFixed(2).padStart(12)}`
  );
}

console.log("\nFöreslagna profilvärden (redo att kopiera in i weather.js):");
console.log("=============================================================");
for (let m = 0; m < 12; m++) {
  const vals = rainyDayMmByMonth[m].slice().sort((a, b) => a - b);
  const p10 = percentile(vals, 10);
  const p90 = percentile(vals, 90);
  const spells = wetSpellLengthsByMonth[m];
  const avgSpell = spells.length > 0
    ? spells.reduce((a, b) => a + b, 0) / spells.length
    : 0;
  console.log(
    `{ name: "${monthNames[m]}", intensityMinMm: ${p10.toFixed(1)}, intensityMaxMm: ${p90.toFixed(1)}, wetSpellDays: ${avgSpell.toFixed(1)} }`
  );
}

// ===== EXCEL EXPORT =====
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet("Beräkningar");

// Header style
const headerStyle = {
  font: { bold: true, color: { argb: "FFFFFFFF" }, size: 12 },
  fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF366092" } },
  alignment: { horizontal: "center", vertical: "center" },
  border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
};

const dataStyle = {
  alignment: { horizontal: "center", vertical: "center" },
  border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
};

// Title
worksheet.mergeCells("A1:G1");
const titleCell = worksheet.getCell("A1");
titleCell.value = "Väderanalys 1991-2020 (SMHI-data)";
titleCell.font = { bold: true, size: 14 };
titleCell.alignment = { horizontal: "center" };

// Column headers
worksheet.getRow(3).values = ["Månad", "Regndagar/mån", "Andel regnda", "p10 (mm)", "p90 (mm)", "Medel mm", "Våtperiod-dagar"];
worksheet.getRow(3).style = headerStyle;
worksheet.getRow(3).height = 20;

// Data rows
for (let m = 0; m < 12; m++) {
  const row = m + 4;
  const allYears = Object.keys(rainyDaysByMonthYear[m]).map(Number).sort();
  const filtered = allYears.filter((y) => y >= 1991 && y <= 2020);
  const values = filtered.map((y) => rainyDaysByMonthYear[m][y]);

  if (values.length === 0) continue;

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const share = avg / MONTH_DAYS[m];

  const valsRainy = rainyDayMmByMonth[m].slice().sort((a, b) => a - b);
  const p10 = percentile(valsRainy, 10);
  const p90 = percentile(valsRainy, 90);
  const meanRainy = valsRainy.length > 0 ? valsRainy.reduce((a, b) => a + b, 0) / valsRainy.length : 0;

  const spells = wetSpellLengthsByMonth[m];
  const avgSpell = spells.length > 0 ? spells.reduce((a, b) => a + b, 0) / spells.length : 0;

  worksheet.getRow(row).values = [monthNames[m], avg.toFixed(1), share.toFixed(3), p10.toFixed(1), p90.toFixed(1), meanRainy.toFixed(1), avgSpell.toFixed(2)];
  worksheet.getRow(row).style = dataStyle;
}

// ===== MONTHLY TOTAL PRECIPITATION SHEET =====
const monthlyPrecipWorksheet = workbook.addWorksheet("Månatlig total nederbörd");

// Title
monthlyPrecipWorksheet.mergeCells("A1:C1");
const precipTitleCell = monthlyPrecipWorksheet.getCell("A1");
precipTitleCell.value = "Månatlig genomsnittlig total nederbörd (1991-2020)";
precipTitleCell.font = { bold: true, size: 14 };
precipTitleCell.alignment = { horizontal: "center" };

// Column headers
monthlyPrecipWorksheet.getRow(3).values = ["Månad", "Genomsn. mm/månad", "Källa"];
monthlyPrecipWorksheet.getRow(3).style = headerStyle;
monthlyPrecipWorksheet.getRow(3).height = 20;

// Data rows
for (let m = 0; m < 12; m++) {
  const row = m + 4;
  const allYears = Object.keys(totalMmByMonthYear[m]).map(Number).sort();
  const filtered = allYears.filter((y) => y >= 1991 && y <= 2020);
  const values = filtered.map((y) => totalMmByMonthYear[m][y]);

  if (values.length === 0) continue;

  const monthlyAvg = values.reduce((a, b) => a + b, 0) / values.length;
  
  monthlyPrecipWorksheet.getRow(row).values = [monthNames[m], monthlyAvg.toFixed(1), "SMHI rådata"];
  monthlyPrecipWorksheet.getRow(row).style = dataStyle;
}

// Forklaringar under tabellen så att inga månadsrader täcks
monthlyPrecipWorksheet.getCell("A17").value = "Förklaring:";
monthlyPrecipWorksheet.getCell("A17").font = { bold: true, size: 11 };
monthlyPrecipWorksheet.getCell("A18").value = "Värden är summan av all nederbörd för varje månad i perioden 1991-2020, dividerat med 30 år.";
monthlyPrecipWorksheet.getCell("A18").font = { italic: true, size: 10 };
monthlyPrecipWorksheet.mergeCells("A18:C18");

monthlyPrecipWorksheet.columns = [
  { width: 15 },
  { width: 20 },
  { width: 20 }
];


// Set column widths
worksheet.columns = [
  { width: 12 },
  { width: 16 },
  { width: 14 },
  { width: 12 },
  { width: 12 },
  { width: 14 },
  { width: 16 }
];

// Lägg till forklaringar
const explanationRow = 17;
worksheet.getCell(`A${explanationRow}`).value = "Förklaringar:";
worksheet.getCell(`A${explanationRow}`).font = { bold: true, size: 11 };

const explanations = [
  "Regndagar/mån = Antal dagar med > 0 mm nederbörd",
  "Andel regnda = Regndagar / Dagar i månaden",
  "p10 (mm) = 10:e percentil av regndagars nederbörd (liten mängd)",
  "p90 (mm) = 90:e percentil av regndagars nederbörd (stor mängd)",
  "Medel mm = Genomsnittlig nederbörd på en regndag",
  "Våtperiod-dagar = Genomsnittlig längd på konsekutiva regndagar"
];

for (let i = 0; i < explanations.length; i++) {
  worksheet.getCell(`A${explanationRow + i + 1}`).value = explanations[i];
  worksheet.getCell(`A${explanationRow + i + 1}`).font = { italic: true, size: 10 };
  worksheet.mergeCells(`A${explanationRow + i + 1}:G${explanationRow + i + 1}`);
}

// ===== RAW DATA SHEET =====
const rawDataWorksheet = workbook.addWorksheet("Rådata (1991-2020)");

// Header for raw data
rawDataWorksheet.getRow(1).values = ["Datum", "Nederbörd (mm)"];
rawDataWorksheet.getRow(1).style = headerStyle;
rawDataWorksheet.getRow(1).height = 20;

// Collect all raw data rows
const allRawRows = [];
for (const file of files) {
  const raw = readFileSync(join(__dirname, file), "utf-8");
  const lines = raw.split("\n");

  let dataStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("Fr")) { dataStart = i + 1; break; }
  }
  if (dataStart === -1) continue;

  for (let i = dataStart; i < lines.length; i++) {
    const parts = lines[i].split(";");
    if (parts.length < 4) continue;
    const dateStr = parts[2].trim();
    const mmStr = parts[3].trim();
    if (!dateStr || !mmStr) continue;
    const mm = parseFloat(mmStr.replace(",", "."));
    if (!isFinite(mm)) continue;
    const dateParts = dateStr.split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    if (!year || !month || year < 1991 || year > 2020) continue;
    allRawRows.push({ dateStr, mm });
  }
}

// Sort by date
allRawRows.sort((a, b) => a.dateStr.localeCompare(b.dateStr));

// Add data rows to raw data sheet
for (let i = 0; i < allRawRows.length; i++) {
  const row = i + 2;
  rawDataWorksheet.getRow(row).values = [allRawRows[i].dateStr, allRawRows[i].mm];
  rawDataWorksheet.getRow(row).style = dataStyle;
}

// Set column widths for raw data
rawDataWorksheet.columns = [
  { width: 15 },
  { width: 20 }
];

// Save Excel file
const outputPath = join(__dirname, "väderanalys-beräkningar.xlsx");
await workbook.xlsx.writeFile(outputPath);
console.log(`\n✓ Excel-fil sparad: ${outputPath}`);
console.log(`✓ Totalt antal datapunkter: ${allRawRows.length}`);
