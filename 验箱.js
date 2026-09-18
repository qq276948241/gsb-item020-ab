const fs = require("fs");
const path = require("path");

function fail() {
  process.stderr.write("箱子不对");
  process.exit(1);
}

const boxPath = path.join(process.cwd(), "箱子");

let raw;
try {
  raw = fs.readFileSync(boxPath, "utf8");
} catch (err) {
  if (err.code === "ENOENT") {
    process.stderr.write("找不到箱子");
    process.exit(1);
  }
  throw err;
}

const lines = raw.split("\n");
if (!(lines.length === 2 || (lines.length === 3 && lines[2] === ""))) fail();

const numberLine = lines[0];
const sealLine = lines[1];
if (numberLine.length === 0 || sealLine.length === 0) fail();

const numberMatch = /^箱号 (.*)$/u.exec(numberLine);
const sealMatch = /^铅封 (.*)$/u.exec(sealLine);
if (!numberMatch || !sealMatch) fail();

const number = numberMatch[1];
const seal = sealMatch[1];
if (number.length !== 11 || seal.length < 6 || seal.length > 10) fail();

const letters = number.slice(0, 4);
const numberDigits = number.slice(4);
for (const ch of letters) {
  if (!/^[A-Z]$/.test(ch)) fail();
}
for (const ch of numberDigits) {
  if (!/^[0-9]$/.test(ch)) fail();
}
for (const ch of seal) {
  if (!/^[0-9]$/.test(ch)) fail();
}

const table = {};
const alphabetPath = path.join(process.cwd(), "字母表");
const alphabet = fs.readFileSync(alphabetPath, "utf8");
for (const line of alphabet.split("\n")) {
  if (line === "") continue;
  const entry = /^([A-Za-z]) (\d+)$/.exec(line);
  if (!entry) fail();
  table[entry[1]] = Number(entry[2]);
}

for (const ch of letters) {
  if (!(ch in table)) fail();
}

let numberSum = 0;
let multiplier = 1;
for (let i = 0; i < 10; i++) {
  const value = i < 4 ? table[number[i]] : Number(number[i]);
  numberSum += value * multiplier;
  multiplier *= 2;
}
const numberRemainder = numberSum % 11;
const expectedNumberDigit = numberRemainder === 10 ? 0 : numberRemainder;
const numberActualDigit = Number(number[10]);
const numberOk = numberActualDigit === expectedNumberDigit;

let sealSum = 0;
for (let i = 0; i < seal.length - 1; i++) {
  sealSum += Number(seal[i]) * (i + 1);
}
const expectedSealDigit = sealSum % 10;
const sealActualDigit = Number(seal[seal.length - 1]);
const sealOk = sealActualDigit === expectedSealDigit;

const output = [];
if (numberOk && sealOk) {
  output.push("箱号和铅封都对，这箱能走");
} else {
  if (!numberOk) {
    output.push("箱号最后一位不对，算出来应该是" + expectedNumberDigit);
  }
  if (!sealOk) {
    output.push("铅封最后一位不对，算出来应该是" + expectedSealDigit);
  }
}
process.stdout.write(output.join("\n"));
