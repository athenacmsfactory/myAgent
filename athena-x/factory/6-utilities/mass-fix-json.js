import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Locate athena-x root
let root = path.resolve(__dirname, '../..'); 
if (!fs.existsSync(path.join(root, 'pnpm-workspace.yaml'))) {
    root = path.resolve(__dirname, '../../..');
}

function fixDir(dirName) {
    const dirPath = path.join(root, dirName);
    if (!fs.existsSync(dirPath)) return;

    const projects = fs.readdirSync(dirPath).filter(f => fs.statSync(path.join(dirPath, f)).isDirectory());

    projects.forEach(project => {
        const dataDir = path.join(dirPath, project, 'src/data');
        if (fs.existsSync(dataDir)) {
            const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
            files.forEach(f => {
                const p = path.join(dataDir, f);
                const stats = fs.statSync(p);
                // Flagging anything less than 10 bytes to be safe and catch all 2-3 byte ones
                if (stats.size < 10) {
                    try {
                        const content = fs.readFileSync(p, 'utf8').trim();
                        if (content === '[]' || content === '{}' || content === '' || content === '[ ]' || content === '{ }') {
                            console.log(`🔧 Standardizing ${dirName}/${project}/src/data/${f}...`);
                            const obj = (content === '' || content === '{}' || content === '{ }') ? {} : [];
                            fs.writeFileSync(p, JSON.stringify(obj, null, 4));
                        }
                    } catch (e) {
                        console.error(`❌ Failed to fix ${p}: ${e.message}`);
                    }
                }
            });
        }
    });
}

console.log("🧼 Mass-fixing small/empty JSON files...");
fixDir('sites');
fixDir('sites-external');
console.log("✨ Mass-fix complete.");
