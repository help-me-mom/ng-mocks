const path = require('path');
const fs = require('fs');

const data = [];

function ThroughDirectory(Directory) {
  for (const File of fs.readdirSync(Directory)) {
    const Absolute = path.join(Directory, File);
    if (fs.statSync(Absolute).isDirectory()) {
      ThroughDirectory(Absolute);
    } else if (Absolute.endsWith('.spec.ts')) {
      data.push(Absolute);
    }
  }
}

ThroughDirectory('./src');

data.sort();

const total = process.env.CIRCLE_NODE_TOTAL ? parseInt(process.env.CIRCLE_NODE_TOTAL, 10) : 1;
const index = process.env.CIRCLE_NODE_INDEX ? parseInt(process.env.CIRCLE_NODE_INDEX, 10) : 0;

const result = [];
for (let i = 0; i < data.length; i += 1) {
  if ((i + index) % total === 0) {
    result.push(data[i]);
  }
}

process.stdout.write(`Result: ${result.length} / ${data.length}\n`);

module.exports = result;
