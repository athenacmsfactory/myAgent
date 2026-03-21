import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TransformationEngine } from '../5-engine/core/TransformationEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateAllSites() {
    const root = path.resolve(__dirname, '../..');
    const sitesDir = path.join(root, 'sites');
    const factoryDir = path.join(root, 'factory');
    const TPL = path.join(factoryDir, '2-templates');
    const SHARED_COMPONENTS = path.join(TPL, 'shared/components');

    if (!fs.existsSync(sitesDir)) {
        console.error("❌ Sites directory not found.");
        return;
    }

    const sites = fs.readdirSync(sitesDir).filter(f => fs.statSync(path.join(sitesDir, f)).isDirectory());

    console.log(`🚀 Starting Global Update for ${sites.length} sites...\n`);

    for (const siteName of sites) {
        const projectDir = path.join(sitesDir, siteName);
        const configPath = path.join(projectDir, 'athena-config.json');
        
        if (!fs.existsSync(configPath)) {
            console.log(`⏭️  Skipping ${siteName} (no athena-config.json)`);
            continue;
        }

        let config = {};
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (e) {
            console.error(`❌ Failed to parse config for ${siteName}`);
            continue;
        }

        console.log(`🛠️  Updating ${siteName}...`);

        const engine = new TransformationEngine({
            variables: { PROJECT_NAME: config.projectName || siteName },
            flags: { isDocked: true } // Most sites are docked now
        });

        try {
            // 1. Sync Universal Shared Components
            const essential = [
                'EditableImage.jsx', 'EditableMedia.jsx', 'EditableText.jsx', 'EditableLink.jsx',
                'Header.jsx', 'Footer.jsx', 'StyleInjector.jsx', 'Section.jsx',
                'CartContext.jsx', 'CartOverlay.jsx', 'Checkout.jsx', 'RepeaterControls.jsx',
                'SectionToolbar.jsx', 'MetadataConfigModal.jsx', 'AboutSection.jsx',
                'StyleContext.jsx', 'DisplayConfigContext.jsx'
            ];

            essential.forEach(comp => {
                const src = path.join(SHARED_COMPONENTS, comp);
                const dest = path.join(projectDir, 'src/components', comp);
                
                if (fs.existsSync(src)) {
                    // Always copy/transform essential components to ensure site has the latest library
                    fs.writeFileSync(dest, engine.transform(fs.readFileSync(src, 'utf8'), comp));
                    console.log(`   ✅ ${comp} updated/added.`);
                }
            });

            // 2. Sync dock-connector.js (Production version)
            const connectorSrc = path.join(TPL, 'boilerplate/docked/shared/public/dock-connector.js');
            const connectorDest = path.join(projectDir, 'src/dock-connector.js');
            if (fs.existsSync(connectorSrc)) {
                fs.copyFileSync(connectorSrc, connectorDest);
                console.log(`   ✅ dock-connector.js updated.`);
            }

            // 3. Update fetch-data.js
            const fetchTpl = path.join(TPL, 'logic/fetch-data.js');
            const fetchDest = path.join(projectDir, 'fetch-data.js');
            if (fs.existsSync(fetchTpl)) {
                fs.copyFileSync(fetchTpl, fetchDest);
                console.log(`   ✅ fetch-data.js updated.`);
            }

            console.log(`   ✨ ${siteName} update complete.\n`);
        } catch (err) {
            console.error(`   ❌ Failed to update ${siteName}:`, err.message);
        }
    }

    console.log("🏁 All sites updated successfully!");
}

updateAllSites();
