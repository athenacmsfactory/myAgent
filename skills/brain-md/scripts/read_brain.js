#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const brainDir = path.join(process.env.HOME, 'myAgent/brain');
const files = ['tasks.md', 'context.md', 'logs.md', 'blockers.md'];

console.log('--- BRAIN STATE ---');
files.forEach(file => {
  const filePath = path.join(brainDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`\n### ${file}\n`);
    console.log(fs.readFileSync(filePath, 'utf8'));
  }
});
