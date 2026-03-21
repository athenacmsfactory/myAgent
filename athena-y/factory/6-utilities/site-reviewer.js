import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { QualityChecker } from '../5-engine/lib/quality-check.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Locate athena-y root
let root = path.resolve(__dirname, '../..'); 
if (!fs.existsSync(path.join(root, 'pnpm-workspace.yaml'))) {
    root = path.resolve(__dirname, '../../..');
}

const AUDIT_LOG = path.join(root, 'output/AUDIT_PROGRESS.json');
const SITES_DIRS = [
    path.join(root, 'sites'),
    path.join(root, 'sites-external')
];

async function runReview() {
    console.log("🕵️ Starting Site Portfolio Reviewer...");
    
    let history = {};
    if (fs.existsSync(AUDIT_LOG)) {
        history = JSON.parse(fs.readFileSync(AUDIT_LOG, 'utf8'));
    }

    const results = [];

    for (const dirPath of SITES_DIRS) {
        if (!fs.existsSync(dirPath)) continue;
        const projects = fs.readdirSync(dirPath).filter(f => fs.statSync(path.join(dirPath, f)).isDirectory() && !f.startsWith('.'));

        for (const project of projects) {
            const pPath = path.join(dirPath, project);
            console.log(`\n--- Reviewing: ${project} ---`);
            
            const report = QualityChecker.check(pPath);
            const status = report.errors.length === 0 ? 'PASS' : 'FAIL';
            
            const entry = {
                site: project,
                path: dirPath.includes('external') ? 'external' : 'native',
                status,
                errors: report.errors,
                lastReviewed: new Date().toISOString()
            };

            results.push(entry);
            history[project] = entry;
        }
    }

    // Save Progress
    if (!fs.existsSync(path.dirname(AUDIT_LOG))) fs.mkdirSync(path.dirname(AUDIT_LOG), { recursive: true });
    fs.writeFileSync(AUDIT_LOG, JSON.stringify(history, null, 2));

    // Generate Markdown Summary
    let md = `# 🕵️ Portfolio Review Progress\n\n`;
    md += `| Status | Site | Path | Last Review | Errors |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;
    
    Object.values(history).sort((a,b) => a.site.localeCompare(b.site)).forEach(h => {
        const statusIcon = h.status === 'PASS' ? '✅' : '❌';
        md += `| ${statusIcon} ${h.status} | ${h.site} | ${h.path} | ${new Date(h.lastReviewed).toLocaleDateString()} | ${h.errors.length} |\n`;
    });

    fs.writeFileSync(path.join(root, 'output/SITES_REVIEW_STATUS.md'), md);
    
    console.log(`\n✅ Review complete. Summary saved to output/SITES_REVIEW_STATUS.md`);
}

runReview();
