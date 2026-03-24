#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// 🛡️ Circuit Breaker Configuration
const PAUSE_FILE = path.join(__dirname, '../brain/PAUSE');

// Read stdin (Gemini CLI hook data)
let inputRaw = '';
process.stdin.on('data', chunk => { inputRaw += chunk; });
process.stdin.on('end', () => {
  try {
    // 1. Manual Override check
    if (fs.existsSync(PAUSE_FILE)) {
      process.stdout.write(JSON.stringify({
        decision: 'approve', 
        reason: 'Loop manually paused via PAUSE file.'
      }));
      return;
    }

    const input = JSON.parse(inputRaw);
    
    // 2. Extract text robustly
    let text = input.agentOutput?.text || '';
    if (!text && input.agentOutput?.candidates?.[0]?.content?.parts) {
      text = input.agentOutput.candidates[0].content.parts
        .map(p => p.text || '')
        .join(' ');
    }

    // 3. Status logic
    const isComplete = /WORK_COMPLETE/i.test(text);
    const isBlocked = /BLOCKER/i.test(text);

    if (isComplete || isBlocked) {
      process.stdout.write(JSON.stringify({
        decision: 'approve',
        reason: 'AI Employee finished work or is blocked.'
      }));
    } else {
      process.stdout.write(JSON.stringify({
        decision: 'deny',
        reason: 'Task is still in progress. Please continue until WORK_COMPLETE or BLOCKER is logged.'
      }));
    }
  } catch (err) {
    process.stdout.write(JSON.stringify({ decision: 'approve', reason: 'Hook error: ' + err.message }));
  }
});
