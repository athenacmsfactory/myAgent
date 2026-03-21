/**
 * ToolController.js
 * @description Orchestrates external tools and scripts (Scraper, Variants, Onboarding).
 */

import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';

export class ToolController {
    constructor(configManager, executionService) {
        this.configManager = configManager;
        this.execService = executionService;
        this.factoryDir = configManager.get('paths.factory');
    }

    /**
     * Generate style variants for a site
     */
    generateVariants(id, styles = []) {
        const args = [id];
        if (styles && styles.length > 0) {
            args.push('--styles', styles.join(','));
        }
        return this.execService.runEngineScript('variant-generator.js', args);
    }

    /**
     * Run the website scraper for a project
     */
    scrape(id, inputFile) {
        return this.execService.runEngineScript('athena-scraper.js', [id, inputFile]);
    }

    /**
     * Run the client onboarding wizard
     */
    onboard(companyName, websiteUrl = '', clientEmail = '') {
        return this.execService.runEngineScript('onboarding-wizard.js', [companyName, websiteUrl, clientEmail]);
    }

    /**
     * Create a new sitetype based on an existing site's structure
     */
    createSitetypeFromSite(sourceSiteName, targetSitetypeName) {
        return this.execService.runEngineScript('sitetype-from-site-generator.js', [sourceSiteName, targetSitetypeName]);
    }

    /**
     * Clone an entire project to a new project name.
     */
    async cloneProject(sourceId, targetId) {
        const sitesDir = path.join(this.factoryDir, '../sites');
        const sourcePath = path.join(sitesDir, sourceId);
        const targetPath = path.join(sitesDir, targetId);

        if (!fs.existsSync(sourcePath)) throw new Error(`Bron-project ${sourceId} niet gevonden.`);
        if (fs.existsSync(targetPath)) throw new Error(`Doel-project ${targetId} bestaat al.`);

        console.log(`👯 Cloning project: ${sourceId} -> ${targetId}...`);
        
        try {
            // Recursive copy
            fs.cpSync(sourcePath, targetPath, { recursive: true });

            // Update athena-config.json in the clone
            const configPath = path.join(targetPath, 'athena-config.json');
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                config.projectName = targetId;
                config.safeName = targetId;
                config.generatedAt = new Date().toISOString();
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            }

            // Cleanup git if exists in clone
            const gitDir = path.join(targetPath, '.git');
            if (fs.existsSync(gitDir)) fs.rmSync(gitDir, { recursive: true });

            return { success: true, message: `Project ${sourceId} succesvol gedupliceerd naar ${targetId}.` };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    /**
     * Run a generic engine script
     */
    async runScript(script, args) {
        return await this.execService.runAsync(process.execPath, [path.join(this.factoryDir, '5-engine', script), ...args], { label: script });
    }
}
