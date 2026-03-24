#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const [fileName, ...content] = process.argv.slice(2);
const brainDir = path.join(process.env.HOME, 'myAgent/brain');
const filePath = path.join(brainDir, fileName);

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '# ' + fileName + '\n\n', 'utf8');
}

const newContent = content.join(' ');
fs.appendFileSync(filePath, '\n' + newContent + '\n', 'utf8');
console.log(`Updated ${fileName} with: ${newContent}`);
