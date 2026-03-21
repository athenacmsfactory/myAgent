import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Locate athena-y root
let root = __dirname;
// We know we are in factory/6-utilities, so we need to go up 2 levels to get to athena-y
root = path.resolve(__dirname, '../..'); 

if (!fs.existsSync(path.join(root, 'pnpm-workspace.yaml'))) {
    // Fallback search if structure changes
    let search = __dirname;
    while (search !== '/' && !fs.existsSync(path.join(search, 'athena-y'))) {
        search = path.dirname(search);
    }
    if (fs.existsSync(path.join(search, 'athena-y'))) root = path.join(search, 'athena-y');
}

const SITES_DIRS = [
    path.join(root, 'sites'),
    path.join(root, 'sites-external')
];

console.log(`Debug Root: ${root}`);
console.log(`Debug SITES_DIRS: ${SITES_DIRS.join(', ')}`);

const auditResults = [];

function auditDir(dirPath, label) {
    if (!fs.existsSync(dirPath)) return;
    
    const sites = fs.readdirSync(dirPath).filter(f => 
        fs.statSync(path.join(dirPath, f)).isDirectory() && !f.startsWith('.')
    );

    console.log(`🔍 Start audit van ${sites.length} sites in ${label}...`);

    for (const site of sites) {
        const sitePath = path.join(dirPath, site);
        const issues = [];
        
        // 1. Check index.html
        const indexPath = path.join(sitePath, 'index.html');
        if (!fs.existsSync(indexPath)) {
            issues.push("Missing index.html");
        } else {
            const indexContent = fs.readFileSync(indexPath, 'utf8');
            if (indexContent.includes('src="/') && !indexContent.includes('src="/src')) {
                issues.push("Potentially broken absolute path in index.html");
            }
        }
        
        // 2. Check Data
        const dataDir = path.join(sitePath, 'src/data');
        if (!fs.existsSync(dataDir)) {
            // Sites-external might be static
            if (label !== 'sites-external') {
                issues.push("Missing src/data directory");
            }
        } else {
            const jsonFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
            if (jsonFiles.length === 0) issues.push("No data JSON files found");
        }
        
        // 3. Check for node_modules (hydration check)
        if (!fs.existsSync(path.join(sitePath, 'node_modules'))) {
            // Check if it has a package.json first
            if (fs.existsSync(path.join(sitePath, 'package.json'))) {
                issues.push("Dehydrated (node_modules missing)");
            }
        }

        // 4. Check for StyleInjector.jsx (Generation Fix Check)
        const injectorPath = path.join(sitePath, 'src/components/StyleInjector.jsx');
        if (!fs.existsSync(injectorPath) && fs.existsSync(path.join(sitePath, 'src/App.jsx'))) {
            const appContent = fs.readFileSync(path.join(sitePath, 'src/App.jsx'), 'utf8');
            if (appContent.includes('StyleInjector')) {
                issues.push("Missing StyleInjector.jsx (but used in App.jsx)");
            }
        }

        // 5. Check Section.jsx imports (Path Fix Check)
        const sectionPath = path.join(sitePath, 'src/components/Section.jsx');
        if (fs.existsSync(sectionPath)) {
            const sectionContent = fs.readFileSync(sectionPath, 'utf8');
            if (sectionContent.includes("from './components/")) {
                issues.push("Broken relative imports in Section.jsx");
            }
        }

        auditResults.push({
            site: `${label}/${site}`,
            status: issues.length === 0 ? '✅ OK' : '❌ ISSUE',
            issues
        });
    }
}

console.log("🔱 Athena Portfolio Audit v2.0");
auditDir(SITES_DIRS[0], 'sites');
auditDir(SITES_DIRS[1], 'sites-external');

console.log(`Generating report for ${auditResults.length} sites...`);

const reportHeader = `# Athena Portfolio Audit Report\n\nGenerated: ${new Date().toLocaleString()}\n\n`;
const reportTable = `| Status | Site | Issues |\n| :--- | :--- | :--- |\n` + 
    auditResults.map(r => `| ${r.status} | ${r.site} | ${r.issues.join('<br>') || '-'} |`).join('\n');

const outputDir = path.join(root, 'output');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

fs.writeFileSync(path.join(outputDir, 'SITES_PORTFOLIO_AUDIT.md'), reportHeader + reportTable);

console.log(`\n✅ Audit voltooid. Rapport opgeslagen in athena-y/output/SITES_PORTFOLIO_AUDIT.md`);
console.log(`Total sites audited: ${auditResults.length}`);
console.log(`Sites with issues: ${auditResults.filter(r => r.status === '❌ ISSUE').length}`);
