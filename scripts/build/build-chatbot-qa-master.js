const fs = require("node:fs");
const path = require("node:path");

const dataDirectory = path.resolve(__dirname, "../../data/chatbot");
const topicFiles = [
  "about_sprint_QA_dataset.json",
  "admission_QA_dataset.json",
  "career_QA_dataset.json",
  "courses_QA_dataset.json",
  "payment_QA_dataset.json",
  "partnerships_events_QA_dataset.json",
  "privacy_security_QA_dataset.json",
  "quality_assurance_QA_dataset.json",
  "registration_QA_dataset.json",
  "scholarship_QA_dataset.json",
  "sprint_dashboard_QA_dataset.json",
  "support_QA_dataset.json",
];

const records = [];
for (const file of topicFiles) {
  const filePath = path.join(dataDirectory, file);
  const topicRecords = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (!Array.isArray(topicRecords)) {
    throw new TypeError(`${file} must contain a JSON array.`);
  }

  for (const record of topicRecords) {
    if (
      !record ||
      typeof record.id !== "string" ||
      typeof record.category !== "string" ||
      typeof record.question !== "string" ||
      typeof record.answer !== "string"
    ) {
      throw new TypeError(`${file} contains an invalid Q&A record.`);
    }

    records.push(record);
  }
}

const ids = new Set();
const orderIndexes = new Set();
for (const record of records) {
  if (ids.has(record.id)) {
    throw new Error(`Duplicate Q&A record id: ${record.id}`);
  }
  ids.add(record.id);

  if (Number.isInteger(record._master_order)) {
    if (orderIndexes.has(record._master_order)) {
      throw new Error(`Duplicate master order: ${record._master_order}`);
    }
    orderIndexes.add(record._master_order);
  }
}

records.sort((left, right) => {
  const leftOrder = left._master_order;
  const rightOrder = right._master_order;
  const hasLeftOrder = Number.isInteger(leftOrder);
  const hasRightOrder = Number.isInteger(rightOrder);

  if (hasLeftOrder && hasRightOrder) return leftOrder - rightOrder;
  if (hasLeftOrder) return -1;
  if (hasRightOrder) return 1;
  return 0;
});

const master = records.map(({ _master_order, ...record }) => record);
const outputPath = path.join(dataDirectory, "sprint-qa-master.json");
const output = `${JSON.stringify(master, null, 2).replace(/\n/g, "\r\n")}\r\n`;
fs.writeFileSync(outputPath, output, "utf8");
console.log(`Built ${path.basename(outputPath)} with ${master.length} Q&A records.`);
