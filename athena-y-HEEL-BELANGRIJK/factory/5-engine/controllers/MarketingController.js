/**
 * MarketingController.js
 * @description Handles autonomous content generation for SEO and marketing.
 * Integrates with AI Engine for brains and DataManager for Sheets sync.
 */

import fs from 'fs';
import path from 'path';
import { generateWithAI } from '../core/ai-engine.js';
import { AthenaDataManager } from '../lib/DataManager.js';

export class MarketingController {
    constructor(configManager) {
        this.configManager = configManager;
        this.dataManager = new AthenaDataManager(configManager.get('paths.factory'));
    }

    /**
     * Generate a new blog post for a specific site
     * @param {string} projectName 
     * @param {string} topic (Optional)
     */
    async generateBlog(projectName, topic = "the future of AI-driven web design") {
        console.log(`✍️  AI Marketing: Blog genereren voor '${projectName}' over '${topic}'...`);

        // 1. Haal context op van de site voor relevante content
        const paths = this.dataManager.resolvePaths(projectName);
        const siteSettings = this.dataManager.loadJSON(path.join(paths.dataDir, 'site_settings.json')) || {};
        const basis = this.dataManager.loadJSON(path.join(paths.dataDir, 'basis.json')) || {};
        
        const systemInstruction = `
            Je bent een 'SEO Copywriter'. Schrijf een boeiende blogpost voor de website '${projectName}'.
            SITE CONTEXT: ${JSON.stringify(siteSettings)}
            BASIS INFO: ${JSON.stringify(basis)}
            ONDERWERP: ${topic}
            
            REGEER UITSLUITEND MET EEN JSON OBJECT:
            {
                "title": "Titel van de blog",
                "excerpt": "Korte samenvatting voor de overzichtspagina",
                "content": "Volledige HTML of Markdown inhoud van de blog",
                "author": "Athena Agent",
                "date": "${new Date().toISOString().split('T')[0]}",
                "category": "Technologie"
            }
        `;

        const blogJson = await generateWithAI(systemInstruction, { isJson: true });
        if (!blogJson) throw new Error("AI kon geen blog genereren.");

        // 2. Voeg de blog toe aan de lokale data (blog.json)
        const blogFilePath = path.join(paths.dataDir, 'blog.json');
        let existingBlogs = [];
        if (fs.existsSync(blogFilePath)) {
            existingBlogs = JSON.parse(fs.readFileSync(blogFilePath, 'utf8'));
        }
        
        existingBlogs.unshift(blogJson); // Nieuwste bovenaan
        fs.writeFileSync(blogFilePath, JSON.stringify(existingBlogs, null, 2));
        
        console.log(`✅ Blog lokaal opgeslagen: ${blogJson.title}`);

        // 3. SYNC NAAR GOOGLE SHEETS
        console.log(`📡 Blog synchroniseren naar Google Sheet van ${projectName}...`);
        await this.dataManager.syncToSheet(projectName);

        // Map excerpt to summary for UI consistency
        const article = { ...blogJson, summary: blogJson.excerpt };

        return {
            success: true,
            message: "Blog succesvol gegenereerd en gesynchroniseerd naar de Sheet.",
            articles: [article]
        };
    }

    /**
     * Generate optimized SEO metadata for all pages
     * @param {string} projectName 
     */
    async generateSEO(projectName) {
        console.log(`🔍 AI Marketing: SEO metadata optimaliseren voor '${projectName}'...`);

        const paths = this.dataManager.resolvePaths(projectName);
        const siteSettings = this.dataManager.loadJSON(path.join(paths.dataDir, 'site_settings.json')) || {};
        const basis = this.dataManager.loadJSON(path.join(paths.dataDir, 'basis.json')) || {};
        
        // We proberen ook pagina-specifieke data te laden als die er is
        const pagesDir = path.join(paths.dataDir);
        const dataFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.json') && f !== 'seo.json');
        
        const context = {
            settings: siteSettings,
            basis: basis,
            contentOverview: dataFiles.map(f => f.replace('.json', ''))
        };

        const systemInstruction = `
            Je bent een 'SEO Expert'. Genereer geoptimaliseerde meta-tags voor de website '${projectName}'.
            CONTEXT: ${JSON.stringify(context)}
            
            Genereer voor de homepage en algemene site-tags.
            
            REGEER UITSLUITEND MET EEN JSON OBJECT:
            {
                "title": "SEO Geoptimaliseerde Titel (max 60 chars)",
                "description": "Meta description die aanzet tot klikken (max 160 chars)",
                "keywords": "keyword1, keyword2, keyword3, ...",
                "og_title": "Social media titel",
                "og_description": "Social media beschrijving",
                "structured_data": {
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "${projectName}"
                }
            }
        `;

        const seoJson = await generateWithAI(systemInstruction, { isJson: true });
        if (!seoJson) throw new Error("AI kon geen SEO data genereren.");

        const seoFilePath = path.join(paths.dataDir, 'seo.json');
        // We slaan het op als een array met 1 object voor consistentie met andere data files
        fs.writeFileSync(seoFilePath, JSON.stringify([seoJson], null, 2));
        
        console.log(`✅ SEO metadata lokaal opgeslagen.`);

        // SYNC NAAR GOOGLE SHEETS
        console.log(`📡 SEO synchroniseren naar Google Sheet van ${projectName}...`);
        await this.dataManager.syncToSheet(projectName);

        return {
            success: true,
            message: "SEO metadata succesvol gegenereerd en gesynchroniseerd.",
            seo: seoJson
        };
    }

    /**
     * Run SEO optimization for multiple sites.
     * @param {number} limit 
     */
    async bulkOptimizeSEO(limit = 5) {
        console.log(`🚀 Starting bulk SEO optimization (limit: ${limit})...`);
        const sites = fs.readdirSync(path.join(process.cwd(), '../sites'))
            .filter(f => fs.statSync(path.join(process.cwd(), '../sites', f)).isDirectory() && !f.startsWith('.'))
            .slice(0, limit);

        const results = [];
        for (const site of sites) {
            try {
                const res = await this.generateSEO(site);
                results.push({ site, success: true });
            } catch (e) {
                console.error(`❌ SEO failed for ${site}:`, e.message);
                results.push({ site, success: false, error: e.message });
            }
        }
        return { success: true, count: results.length, details: results };
    }

    /**
     * Generate a commercial proposal for a project.
     * @param {string} projectName 
     */
    async generateProposal(projectName) {
        console.log(`📜 AI Marketing: Commercieel voorstel opstellen voor '${projectName}'...`);

        const paths = this.dataManager.resolvePaths(projectName);
        const siteSettings = this.dataManager.loadJSON(path.join(paths.dataDir, 'site_settings.json')) || {};
        const basis = this.dataManager.loadJSON(path.join(paths.dataDir, 'basis.json')) || {};
        
        const systemInstruction = `
            Je bent 'Athena Business Consultant'. Schrijf een overtuigend en professioneel zakelijk voorstel voor de website '${projectName}'.
            SITE CONTEXT: ${JSON.stringify(siteSettings)}
            BASIS INFO: ${JSON.stringify(basis)}
            
            HET VOORSTEL MOET BEVATTEN:
            1. Samenvatting van de unieke waarde.
            2. Voorgestelde technische stack (React 19, Tailwind v4).
            3. ROI Analyse (waarom dit project zichzelf terugverdient).
            4. Volgende stappen (Stripe Hub checkout).
            
            REGEER UITSLUITEND MET EEN JSON OBJECT:
            {
                "projectName": "${projectName}",
                "proposal_title": "Omschrijving van het project",
                "content_markdown": "De volledige tekst van het voorstel in Markdown",
                "estimated_value": "Vrijblijvende prijsindicatie",
                "date": "${new Date().toISOString().split('T')[0]}"
            }
        `;

        const proposalJson = await generateWithAI(systemInstruction, { isJson: true });
        if (!proposalJson) throw new Error("AI kon geen voorstel genereren.");

        const proposalPath = path.join(paths.dataDir, 'proposal.json');
        fs.writeFileSync(proposalPath, JSON.stringify([proposalJson], null, 2));
        
        console.log(`✅ Voorstel opgesteld en opgeslagen in ${projectName}/src/data/proposal.json`);

        return {
            success: true,
            message: "Voorstel succesvol opgesteld.",
            proposal: proposalJson
        };
    }
}
