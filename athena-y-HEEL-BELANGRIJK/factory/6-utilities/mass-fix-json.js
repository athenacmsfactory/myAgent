/**
 * 🧼 mass-fix-json.js (v2.0)
 * @description Mass-healing of sites using the SiteHealer controller.
 * Standardizes empty JSON files and restores missing schema requirements.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SiteHealer } from '../5-engine/controllers/SiteHealer.js';
import { AthenaConfigManager } from '../5-engine/lib/ConfigManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FACTORY_ROOT = path.resolve(__dirname, '..');
const SITES_DIR = path.resolve(FACTORY_ROOT, '../sites');

async function massHeal() {
    console.log("🧼 Starting Mass-Healing of all sites...");
    
    const cm = new AthenaConfigManager(FACTORY_ROOT);
    const healer = new SiteHealer(cm);

    const sites = fs.readdirSync(SITES_DIR).filter(f => 
        fs.statSync(path.join(SITES_DIR, f)).isDirectory() && !f.startsWith('.')
    );

    let healedCount = 0;

    for (const site of sites) {
        console.log(`🔍 Healing ${site}...`);
        try {
            const res = await healer.heal(site);
            if (res.success) {
                const changes = res.results.restored.length + res.results.repaired.length + (res.results.assets?.length || 0);
                if (changes > 0) {
                    console.log(`   ✨ Healed: ${res.results.restored.length} restored, ${res.results.repaired.length} repaired, ${res.results.assets?.length || 0} assets.`);
                    healedCount++;
                }
            }
        } catch (e) {
            console.error(`   ❌ Failed to heal ${site}:`, e.message);
        }
    }

    console.log(`\n✨ Mass-healing complete. ${healedCount} sites were modified.`);
}

massHeal().catch(err => console.error(err));
