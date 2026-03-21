import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../..');

// OAuth Config (Reuse from .env)
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

async function getAuthClient() {
    const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    auth.setCredentials({ refresh_token: REFRESH_TOKEN });
    return auth;
}

const LAST_MOD_CACHE = path.join(root, 'factory/config/sheet-mod-cache.json');

async function pollSheets() {
    console.log(`\n🕒 [${new Date().toLocaleString()}] Starting Google Sheets Poll...`);
    
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        console.warn("⚠️  Google OAuth credentials missing in .env. Skipping poll.");
        return;
    }

    const auth = await getAuthClient();
    const drive = google.drive({ version: 'v3', auth });

    let cache = {};
    if (fs.existsSync(LAST_MOD_CACHE)) {
        cache = JSON.parse(fs.readFileSync(LAST_MOD_CACHE, 'utf8'));
    }

    const sitesDir = path.join(root, 'sites');
    const sites = fs.readdirSync(sitesDir).filter(f => fs.statSync(path.join(sitesDir, f)).isDirectory());

    for (const site of sites) {
        const urlSheetPath = path.join(sitesDir, site, 'project-settings/url-sheet.json');
        if (!fs.existsSync(urlSheetPath)) continue;

        try {
            const urlConfig = JSON.parse(fs.readFileSync(urlSheetPath, 'utf8'));
            const firstUrl = (urlConfig._system || Object.values(urlConfig)[0]).editUrl;
            const spreadsheetId = firstUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];

            if (!spreadsheetId) continue;

            const res = await drive.files.get({
                fileId: spreadsheetId,
                fields: 'modifiedTime'
            });

            const modifiedTime = res.data.modifiedTime;
            if (cache[spreadsheetId] && cache[spreadsheetId] !== modifiedTime) {
                console.log(`✨ Detected changes in Google Sheet for: ${site}`);
                console.log(`   Syncing data and rebuilding...`);
                
                try {
                    // 1. Fetch Data
                    execSync('pnpm fetch-data', { cwd: path.join(sitesDir, site), stdio: 'inherit' });
                    
                    // 2. Build Site
                    execSync('pnpm run build', { cwd: path.join(sitesDir, site), stdio: 'inherit' });
                    
                    console.log(`✅ ${site} successfully updated and rebuilt.`);
                } catch (err) {
                    console.error(`❌ Failed to update ${site}:`, err.message);
                }
            }

            cache[spreadsheetId] = modifiedTime;
        } catch (e) {
            console.error(`⚠️ Error polling sheet for ${site}:`, e.message);
        }
    }

    fs.writeFileSync(LAST_MOD_CACHE, JSON.stringify(cache, null, 2));
}

pollSheets()
    .then(() => console.log("\n🏁 Poll cycle complete."))
    .catch(err => console.error("❌ Fatal error in poll cycle:", err));
