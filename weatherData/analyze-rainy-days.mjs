import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

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

// Använd 1991-2020 för att matcha normalperioden
console.log("Månadsvis medelvärde för regndagar (dagar med > 0 mm), period 1991-2020");
console.log("=========================================================================");
console.log("Månad | Regndagar/mån | rainyDaysShare | År i beräkning");
console.log("------|---------------|----------------|-----------------------------");

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
