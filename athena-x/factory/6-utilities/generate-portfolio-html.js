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

function generateShowcase() {
    console.log("🎨 Generating Visual Portfolio Showcase...");
    
    let html = `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Athena CMS Portfolio Showcase</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
        </style>
    </head>
    <body class="p-8 lg:p-16">
        <header class="max-w-7xl mx-auto mb-16 border-b border-slate-200 pb-8 flex justify-between items-end">
            <div>
                <h1 class="text-5xl font-black tracking-tighter text-slate-900 mb-2">Athena Portfolio</h1>
                <p class="text-slate-500 font-medium uppercase tracking-widest text-sm">Visual Showcase & Inventory</p>
            </div>
            <div class="text-right">
                <span class="text-[10px] font-bold text-slate-400 uppercase">Generated</span>
                <p class="text-sm font-black text-slate-900">${new Date().toLocaleDateString()}</p>
            </div>
        </header>

        <main class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
    `;

    SITES_DIRS.forEach(dirPath => {
        if (!fs.existsSync(dirPath)) return;
        const projects = fs.readdirSync(dirPath).filter(f => fs.statSync(path.join(dirPath, f)).isDirectory() && !f.startsWith('.'));

        projects.forEach(project => {
            const pPath = path.join(dirPath, project);
            const logoPath = path.join(pPath, 'public/site-logo.svg');
            const hasLogo = fs.existsSync(logoPath);
            const logoContent = hasLogo ? fs.readFileSync(logoPath, 'utf8') : '';
            
            const configPath = path.join(pPath, 'athena-config.json');
            let type = "Standard";
            if (fs.existsSync(configPath)) {
                try { type = JSON.parse(fs.readFileSync(configPath, 'utf8')).siteType || "Standard"; } catch(e){}
            }

            html += `
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group">
                <div class="aspect-square bg-slate-50 rounded-2xl mb-6 flex items-center justify-center p-8 group-hover:bg-white transition-colors border border-slate-50">
                    ${hasLogo ? `<div class="w-full h-full">${logoContent}</div>` : `<span class="text-4xl font-black text-slate-200">${project.charAt(0).toUpperCase()}</span>`}
                </div>
                <h3 class="text-lg font-black text-slate-900 truncate mb-1">${project}</h3>
                <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md uppercase tracking-tighter">${type}</span>
                    <span class="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">${dirPath.includes('external') ? 'External' : 'Native'}</span>
                </div>
            </div>
            `;
        });
    });

    html += `
        </main>
        <footer class="max-w-7xl mx-auto mt-24 pt-8 border-t border-slate-200 text-center">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Powered by Athena CMS Factory Engine v2.1</p>
        </footer>
    </body>
    </html>
    `;

    const outputPath = path.join(root, 'output/PORTFOLIO_SHOWCASE.html');
    if (!fs.existsSync(path.dirname(outputPath))) fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html);
    console.log(`✅ Showcase generated: output/PORTFOLIO_SHOWCASE.html`);
}

generateShowcase();
