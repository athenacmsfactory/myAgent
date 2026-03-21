/**
 * 🕵️ bulk-site-audit.js (v3.0)
 * @description Centralized portfolio auditing using the DoctorController.
 * Generates a comprehensive Markdown report of all sites.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DoctorController } from '../5-engine/controllers/DoctorController.js';
import { AthenaConfigManager } from '../5-engine/lib/ConfigManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FACTORY_ROOT = path.resolve(__dirname, '..');
const ROOT = path.resolve(FACTORY_ROOT, '..');

async function runBulkAudit() {
    console.log("🔱 Athena Portfolio Audit v3.0 (Zenith Engine)");
    
    const cm = new AthenaConfigManager(FACTORY_ROOT);
    const doctor = new DoctorController(cm);
    
    const sitesDirs = ['sites', 'sites-external'];
    const allResults = [];

    for (const dirName of sitesDirs) {
        const dirPath = path.join(ROOT, dirName);
        if (!fs.existsSync(dirPath)) continue;

        const sites = fs.readdirSync(dirPath).filter(f => 
            fs.statSync(path.join(dirPath, f)).isDirectory() && !f.startsWith('.')
        );

        console.log(`🔍 Auditing ${sites.length} sites in ${dirName}...`);

        for (const site of sites) {
            try {
                const report = await doctor.auditAsync(site);
                allResults.push({
                    dir: dirName,
                    ...report
                });
            } catch (e) {
                console.error(`   ❌ Failed to audit ${site}:`, e.message);
            }
        }
    }

    // Generate Markdown Report
    console.log(`\n📄 Generating report for ${allResults.length} sites...`);
    
    const reportHeader = `# Athena Portfolio Audit Report (Zenith)\n\nGenerated: ${new Date().toLocaleString()}\n\n`;
    const reportTable = `| Status | Site | Hydration | Issues |\n| :--- | :--- | :--- | :--- |\n` + 
        allResults.map(r => {
            const statusIcon = r.status === 'healthy' ? '✅' : (r.status === 'warning' ? '⚠️' : '❌');
            return `| ${statusIcon} ${r.status.toUpperCase()} | ${r.dir}/${r.site} | ${r.hydration} | ${r.issues.join('<br>') || '-'} |`;
        }).join('\n');

    const outputDir = path.join(FACTORY_ROOT, 'output');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(path.join(outputDir, 'SITES_PORTFOLIO_AUDIT.md'), reportHeader + reportTable);

    console.log(`✅ Audit complete. Results saved to athena-y/factory/output/SITES_PORTFOLIO_AUDIT.md`);
    console.log(`Total sites: ${allResults.length}`);
    console.log(`Healthy: ${allResults.filter(r => r.status === 'healthy').length}`);
    console.log(`Warnings/Errors: ${allResults.filter(r => r.status !== 'healthy').length}`);
}

runBulkAudit().catch(err => console.error(err));
