/**
 * 🧹 update-all-site-components.js
 * @description Synchronizes the latest core components from the shared library to all generated sites.
 * This ensures that bugfixes and UI improvements are propagated ecosystem-wide.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// __dirname is now .../athena-y/factory/6-utilities
const FACTORY_ROOT = path.resolve(__dirname, '..'); // .../athena-y/factory
const SHARED_COMP_DIR = path.resolve(FACTORY_ROOT, '2-templates/shared/components');
const SITES_DIR = path.resolve(FACTORY_ROOT, '../sites');
const SITETYPES_DIR = path.resolve(FACTORY_ROOT, '3-sitetypes');
const BOILERPLATE_DIR = path.resolve(FACTORY_ROOT, '2-templates/boilerplate');

async function updateAllSites() {
    console.log("🚀 Starting Ecosystem-Wide Component Update...");

    // 1. Get the list of core components from the registry
    const registryPath = path.join(SHARED_COMP_DIR, 'components.json');
    if (!fs.existsSync(registryPath)) {
        console.error("❌ Error: components.json not found in shared library.");
        return;
    }
    const { components } = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    console.log(`📦 Found ${components.length} core components in registry.`);

    // 2. Resolve all target directories
    const targets = [];
    
    // Sites
    if (fs.existsSync(SITES_DIR)) {
        fs.readdirSync(SITES_DIR).forEach(site => {
            const p = path.join(SITES_DIR, site, 'src/components');
            if (fs.existsSync(p)) targets.push({ name: `Site: ${site}`, path: p });
        });
    }

    // SiteTypes
    const findDeepComponents = (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                if (file === 'components') {
                    targets.push({ name: `Subsystem: ${path.basename(dir)}`, path: fullPath });
                } else {
                    findDeepComponents(fullPath);
                }
            }
        }
    };
    if (fs.existsSync(SITETYPES_DIR)) findDeepComponents(SITETYPES_DIR);
    if (fs.existsSync(BOILERPLATE_DIR)) findDeepComponents(BOILERPLATE_DIR);

    let updatedCount = 0;
    let totalFilesUpdated = 0;

    for (const target of targets) {
        let targetUpdated = false;
        console.log(`🔍 Checking ${target.name}...`);

        for (const comp of components) {
            const srcPath = path.join(SHARED_COMP_DIR, comp);
            const destPath = path.join(target.path, comp);

            if (fs.existsSync(destPath)) {
                try {
                    fs.copyFileSync(srcPath, destPath);
                    totalFilesUpdated++;
                    targetUpdated = true;
                } catch (e) {
                    console.warn(`   ⚠️ Failed to update ${comp} in ${target.name}: ${e.message}`);
                }
            }
        }

        if (targetUpdated) {
            updatedCount++;
            fs.copyFileSync(registryPath, path.join(target.path, 'components.json'));
        }
    }

    console.log("\n✨ Update Complete!");
    console.log(`✅ Updated ${totalFilesUpdated} component instances across ${updatedCount} subsystems.`);
}

updateAllSites().catch(err => console.error(err));
