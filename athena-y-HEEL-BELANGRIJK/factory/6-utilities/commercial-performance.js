import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Locate athena-y root
let root = path.resolve(__dirname, '../..'); 

if (!fs.existsSync(path.join(root, 'pnpm-workspace.yaml'))) {
    // Fallback
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

function getDirectorySize(dirPath) {
    let size = 0;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) size += stats.size;
        else if (stats.isDirectory()) size += getDirectorySize(filePath);
    }
    return size;
}

function analyzePerformance() {
    const results = [];
    console.log("📊 Analyzing Portfolio Performance...");

    SITES_DIRS.forEach(dirPath => {
        if (!fs.existsSync(dirPath)) return;
        const projects = fs.readdirSync(dirPath).filter(f => fs.statSync(path.join(dirPath, f)).isDirectory());

        projects.forEach(project => {
            const pPath = path.join(dirPath, project);
            const distPath = path.join(pPath, 'dist');
            const hasDist = fs.existsSync(distPath);
            
            let bundleSize = 0;
            if (hasDist) bundleSize = getDirectorySize(distPath);

            const imagesDir = path.join(pPath, 'public/images');
            const imageCount = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir).length : 0;

            const dataDir = path.join(pPath, 'src/data');
            const dataCount = fs.existsSync(dataDir) ? fs.readdirSync(dataDir).length : 0;

            // Simple "Commercial Value Index" based on complexity and assets
            const complexityScore = (dataCount * 10) + (imageCount * 5);
            const efficiencyScore = bundleSize > 0 ? Math.round((complexityScore / (bundleSize / 1024)) * 100) : 0;

            results.push({
                name: project,
                bundleSize: (bundleSize / 1024 / 1024).toFixed(2) + ' MB',
                imageCount,
                dataCount,
                complexityScore,
                efficiencyScore
            });
        });
    });

    return results;
}

const stats = analyzePerformance();
const sorted = stats.sort((a, b) => b.complexityScore - a.complexityScore);

let report = `# 📈 Athena Factory: Commercial Value & Performance Report\n\n`;
report += `Datum: ${new Date().toLocaleString()}\n\n`;
report += `| Site | Bundle Size | Images | Data Tables | Value Index | Efficiency |\n`;
report += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

sorted.forEach(s => {
    report += `| ${s.name} | ${s.bundleSize} | ${s.imageCount} | ${s.dataCount} | ${s.complexityScore} | ${s.efficiencyScore} |\n`;
});

const outputDir = path.join(root, 'output');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

fs.writeFileSync(path.join(outputDir, 'COMMERCIAL_PERFORMANCE.md'), report);
console.log(`\n✅ Performance report generated: athena-y/output/COMMERCIAL_PERFORMANCE.md`);
