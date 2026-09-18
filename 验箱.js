const fs = require("fs");
const path = require("path");

function fail(message) {
  process.stderr.write(message + "\n");
  process.exit(1);
}

let boxText;
try {
  boxText = fs.readFileSync(path.join(__dirname, "箱子"), "utf8");
} catch (error) {
  fail("找不到箱子");
}

let tableText = "";
try {
  tableText = fs.readFileSync(path.join(__dirname, "字母表"), "utf8");
} catch (error) {
  tableText = "";
}

const letterValue = {};
for (const line of tableText.split("\n")) {
  const match = /^(\S+)\s+(\d+)\s*$/.exec(line);
  if (match) letterValue[match[1]] = Number(match[2]);
}

const lines = boxText.split("\n");
if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
if (lines.length !== 2) fail("箱子不对");

const boxMatch = /^箱号 (\S{11})$/.exec(lines[0]);
if (!boxMatch) fail("箱子不对");
const code = boxMatch[1];
const letters = code.slice(0, 4);
const digits = code.slice(4);
if (!/^[A-Za-z]{4}$/.test(letters) || !/^[0-9]{7}$/.test(digits)) {
  fail("箱子不对");
}

const values = [];
for (const ch of letters) {
  if (!(ch in letterValue)) fail("箱子不对");
  values.push(letterValue[ch]);
}
for (const ch of digits) values.push(Number(ch));

let sum = 0;
let weight = 1;
for (let i = 0; i < 10; i++) {
  sum += values[i] * weight;
  weight *= 2;
}
let boxExpected = sum % 11;
if (boxExpected === 10) boxExpected = 0;
const boxOk = boxExpected === values[10];

const sealMatch = /^铅封 ([0-9]{6,10})$/.exec(lines[1]);
if (!sealMatch) fail("箱子不对");
const seal = sealMatch[1];
let sealSum = 0;
for (let i = 0; i < seal.length - 1; i++) {
  sealSum += Number(seal[i]) * (i + 1);
}
const sealExpected = sealSum % 10;
const sealOk = sealExpected === Number(seal[seal.length - 1]);

if (boxOk && sealOk) {
  process.stdout.write("箱号和铅封都对，这箱能走\n");
} else if (!boxOk && sealOk) {
  process.stdout.write("箱号最后一位不对，算出来应该是" + boxExpected + "\n");
} else if (boxOk && !sealOk) {
  process.stdout.write("铅封最后一位不对，算出来应该是" + sealExpected + "\n");
} else {
  process.stdout.write("箱号最后一位不对，算出来应该是" + boxExpected + "\n");
  process.stdout.write("铅封最后一位不对，算出来应该是" + sealExpected + "\n");
}
