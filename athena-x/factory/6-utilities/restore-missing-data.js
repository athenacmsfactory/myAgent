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

const SITES_DIRS = [
    path.join(root, 'sites'),
    path.join(root, 'sites-external')
];

function restoreData() {
    console.log("🩹 Restoring missing data structures for static sites...");

    SITES_DIRS.forEach(dirPath => {
        if (!fs.existsSync(dirPath)) return;
        const projects = fs.readdirSync(dirPath).filter(f => fs.statSync(path.join(dirPath, f)).isDirectory() && !f.startsWith('.'));

        projects.forEach(project => {
            const pPath = path.join(dirPath, project);
            const dataDir = path.join(pPath, 'src/data');
            
            if (!fs.existsSync(dataDir)) {
                console.log(`🔨 Creating src/data for ${project}...`);
                fs.mkdirSync(dataDir, { recursive: true });
                
                const siteSettings = { site_name: project, tagline: "Statische Portfolio Site" };
                const schema = { blueprint_name: "static-fallback", version: "1.0", data_structure: [] };
                
                fs.writeFileSync(path.join(dataDir, 'site_settings.json'), JSON.stringify([siteSettings], null, 4));
                fs.writeFileSync(path.join(dataDir, 'schema.json'), JSON.stringify(schema, null, 4));
                fs.writeFileSync(path.join(dataDir, 'section_order.json'), JSON.stringify([], null, 4));
            }
        });
    });
    
    console.log("✨ Restoration complete.");
}

restoreData();
