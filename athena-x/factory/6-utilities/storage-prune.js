import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../..');

const SITES_DIRS = [
    path.join(root, 'sites'),
    path.join(root, 'sites-external')
];

const INACTIVE_DAYS = 30;
const TEMP_DATA_DAYS = 21;

function pruneInactiveSites() {
    console.log(`🧹 Scanning for inactive sites (> ${INACTIVE_DAYS} days)...`);
    const now = Date.now();

    SITES_DIRS.forEach(dir => {
        if (!fs.existsSync(dir)) return;
        const projects = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory());

        projects.forEach(project => {
            const projectPath = path.join(dir, project);
            const stats = fs.statSync(projectPath);
            const diffDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);

            if (diffDays > INACTIVE_DAYS) {
                const nmPath = path.join(projectPath, 'node_modules');
                if (fs.existsSync(nmPath)) {
                    console.log(`🗑️  Pruning node_modules from inactive site: ${project} (${Math.round(diffDays)} days inactive)`);
                    try {
                        // Using rm -rf via shell for safety with nested node_modules
                        execSync(`rm -rf "${nmPath}"`);
                    } catch (e) {
                        console.error(`❌ Failed to prune ${nmPath}: ${e.message}`);
                    }
                }
            }
        });
    });
}

function pruneTempData() {
    console.log(`🧹 Cleaning up old temp data (> ${TEMP_DATA_DAYS} days)...`);
    const now = Date.now();

    SITES_DIRS.forEach(dir => {
        if (!fs.existsSync(dir)) return;
        const projects = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory());

        projects.forEach(project => {
            const tempDirPath = path.join(dir, project, 'src/data-temp');
            if (fs.existsSync(tempDirPath)) {
                const stats = fs.statSync(tempDirPath);
                const diffDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);

                if (diffDays > TEMP_DATA_DAYS) {
                    console.log(`🗑️  Removing old temp data from: ${project}`);
                    try {
                        execSync(`rm -rf "${tempDirPath}"`);
                    } catch (e) {
                        console.error(`❌ Failed to remove ${tempDirPath}: ${e.message}`);
                    }
                }
            }
        });
    });
}

function prunePnpmStore() {
    console.log("🧼 Pruning pnpm store...");
    try {
        execSync('pnpm store prune', { stdio: 'inherit' });
    } catch (e) {
        console.error("❌ pnpm store prune failed.");
    }
}

console.log("🚀 Starting Athena Storage Prune...");
pruneInactiveSites();
pruneTempData();
prunePnpmStore();
console.log("✨ Storage maintenance complete.");
