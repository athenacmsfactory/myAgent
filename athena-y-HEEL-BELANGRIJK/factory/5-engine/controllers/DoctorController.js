/**
 * DoctorController.js
 * @description The immune system of Athena Factory.
 * Audits sites for integrity issues and handles "Hydration" (node_modules) management.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export class DoctorController {
    constructor(configManager) {
        this.configManager = configManager;
        this.sitesDir = configManager.get('paths.sites');
        this.policiesPath = path.join(process.cwd(), 'config/hydration-policies.json');
    }

    /**
     * Audit a specific site or all sites
     * @param {string} siteName (Optional)
     */
    audit(siteName = null) {
        if (siteName) return this._auditSite(siteName);

        const sites = fs.readdirSync(this.sitesDir).filter(f => 
            fs.statSync(path.join(this.sitesDir, f)).isDirectory() && !f.startsWith('.') && f !== 'athena-cms'
        );

        const results = sites.map(s => this._auditSite(s));
        return results;
    }

    _auditSite(siteName) {
        const siteDir = path.join(this.sitesDir, siteName);
        const report = { 
            site: siteName, 
            status: 'healthy', 
            issues: [], 
            fixes: [],
            hydration: fs.existsSync(path.join(siteDir, 'node_modules')) ? 'hydrated' : 'dormant',
            storage: this._calculateStorageUsage(siteName),
            hasTempData: fs.existsSync(path.join(siteDir, 'src/data-temp'))
        };

        const policy = this.getPolicy(siteName);
        report.policy = policy;

        // 1. Check node_modules status against policy
        if (policy === 'hydrated' && report.hydration === 'dormant') {
            report.status = 'warning';
            report.issues.push('Policy requires hydration, but node_modules is missing');
        } else if (policy === 'dormant' && report.hydration === 'hydrated') {
            report.status = 'warning';
            report.issues.push('Policy requires dormancy, but node_modules exists (space waste)');
        }

        // 2. Check JSON Integrity
        const dataDir = path.join(siteDir, 'src/data');
        if (fs.existsSync(dataDir)) {
            const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
            for (const file of files) {
                try {
                    const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
                    JSON.parse(content);
                    if (content.trim().length < 5) {
                        report.status = 'warning';
                        report.issues.push(`Empty JSON file: ${file}`);
                    }
                } catch (e) {
                    report.status = 'broken';
                    report.issues.push(`Corrupt JSON file: ${file}`);
                }
            }
        } else {
            // Sites might not have src/data if they are very basic or differently structured
            // but for Athena sites this is usually a broken state.
            if (fs.existsSync(path.join(siteDir, 'src'))) {
                report.status = 'broken';
                report.issues.push('Missing src/data directory');
            }
        }

        // 3. Check for leftover Temp Data
        if (report.hasTempData) {
            report.status = report.status === 'healthy' ? 'warning' : report.status;
            report.issues.push('Residual temporary data found (src/data-temp)');
        }

        // 4. Check Component Sync (Version Drift)
        const syncIssues = this._checkComponentSync(siteName);
        if (syncIssues.length > 0) {
            report.status = report.status === 'healthy' ? 'warning' : report.status;
            report.issues.push(`Component drift detected: ${syncIssues.length} components out of sync`);
            report.syncDetails = syncIssues;
        }

        // 5. Check Frontend Standards (Legacy Python script logic)
        const standardIssues = this._checkFrontendStandards(siteName);
        if (standardIssues.length > 0) {
            report.status = report.status === 'healthy' ? 'warning' : report.status;
            report.issues.push(...standardIssues);
        }

        // 6. Check Google Sheet Drift (placeholder for async call)
        report.sheetDrift = null;

        // 7. Check Link Integrity
        const linkIssues = this._checkLinkIntegrity(siteName);
        if (linkIssues.length > 0) {
            report.status = report.status === 'healthy' ? 'warning' : report.status;
            report.issues.push(...linkIssues);
        }

        return report;
    }

    _checkLinkIntegrity(siteName) {
        const sitePath = path.join(this.sitesDir, siteName);
        const dataDir = path.join(sitePath, 'src/data');
        const issues = [];

        if (!fs.existsSync(dataDir)) return [];

        const legacyDomains = [
            'athena-cms-factory.github.io',
            'athena-x.github.io',
            'kareltestspecial.github.io'
        ];

        const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
            const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
            legacyDomains.forEach(domain => {
                if (content.includes(domain)) {
                    issues.push(`Legacy link detected in ${file}: contains '${domain}'`);
                }
            });
        }

        return issues;
    }

    /**
     * Async version of audit for full checks including Google Sheets
     */
    async auditAsync(siteName) {
        const report = this.audit(siteName);
        
        try {
            const { AthenaDataManager } = await import('../lib/DataManager.js');
            const dataManager = new AthenaDataManager(this.configManager.get('paths.factory'));
            const driftReport = await dataManager.checkSheetDrift(siteName);
            if (driftReport.hasDrift) {
                report.status = report.status === 'healthy' ? 'warning' : report.status;
                report.issues.push(`Data drift detected: Google Sheet is ${driftReport.driftSeconds}s newer than local JSON`);
                report.sheetDrift = driftReport;
            }
        } catch (e) { /* Silent fail */ }

        return report;
    }

    _checkFrontendStandards(siteName) {
        const sitePath = path.join(this.sitesDir, siteName);
        const issues = [];

        // Check CSS Standards
        const indexCssPath = path.join(sitePath, 'src/index.css');
        if (fs.existsSync(indexCssPath)) {
            const content = fs.readFileSync(indexCssPath, 'utf8');
            if (!content.includes('@import "tailwindcss"') && !content.includes('@import \'tailwindcss\'')) {
                issues.push("Standard violation: Missing @import 'tailwindcss' in src/index.css");
            }
        }

        // Check HTML Standards (Relative vs Absolute)
        const indexHtmlPath = path.join(sitePath, 'index.html');
        if (fs.existsSync(indexHtmlPath)) {
            const content = fs.readFileSync(indexHtmlPath, 'utf8');
            if (content.includes('href="/assets') || content.includes('src="/assets')) {
                issues.push("Standard violation: Absolute paths (/assets) found in index.html. Use relative (./) for GH Pages.");
            }
        }

        return issues;
    }

    _checkComponentSync(siteName) {
        const siteCompDir = path.join(this.sitesDir, siteName, 'src/components');
        const sharedCompDir = path.join(process.cwd(), '2-templates/shared/components');
        const registryPath = path.join(sharedCompDir, 'components.json');
        
        if (!fs.existsSync(siteCompDir) || !fs.existsSync(registryPath)) return [];

        try {
            const { components } = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
            const drift = [];

            for (const comp of components) {
                const sitePath = path.join(siteCompDir, comp);
                const sharedPath = path.join(sharedCompDir, comp);

                if (fs.existsSync(sitePath) && fs.existsSync(sharedPath)) {
                    const siteContent = fs.readFileSync(sitePath, 'utf8');
                    const sharedContent = fs.readFileSync(sharedPath, 'utf8');

                    if (siteContent !== sharedContent) {
                        drift.push(comp);
                    }
                }
            }
            return drift;
        } catch (e) {
            return [];
        }
    }

    /**
     * Get the effective policy for a site (Site > Group > Global)
     */
    getPolicy(siteName) {
        try {
            const policies = JSON.parse(fs.readFileSync(this.policiesPath, 'utf8'));
            
            // 1. Site-specific override
            if (policies.sites && policies.sites[siteName]) return policies.sites[siteName];

            // 2. Group policy (requires site-to-group mapping)
            const siteConfigPath = path.join(this.sitesDir, siteName, 'athena-config.json');
            if (fs.existsSync(siteConfigPath)) {
                const siteConfig = JSON.parse(fs.readFileSync(siteConfigPath, 'utf8'));
                const group = siteConfig.group;
                if (group && policies.groups && policies.groups[group]) {
                    return policies.groups[group];
                }
            }
            
            // 3. Global default
            return policies.globalDefault || 'dormant';
        } catch (e) {
            return 'dormant'; // Fail safe
        }
    }

    /**
     * Set a policy for a site
     */
    setPolicy(siteName, policy) {
        const policies = JSON.parse(fs.readFileSync(this.policiesPath, 'utf8'));
        if (!policies.sites) policies.sites = {};
        policies.sites[siteName] = policy;
        fs.writeFileSync(this.policiesPath, JSON.stringify(policies, null, 4));
        return { success: true, policy };
    }

    /**
     * Enforce policy: Hydrate or Dehydrate based on settings
     */
    async enforcePolicy(siteName) {
        const policy = this.getPolicy(siteName);
        const hydration = fs.existsSync(path.join(this.sitesDir, siteName, 'node_modules')) ? 'hydrated' : 'dormant';

        if (policy === 'hydrated' && hydration === 'dormant') {
            return await this.hydrate(siteName);
        } else if (policy === 'dormant' && hydration === 'hydrated') {
            return this.dehydrate(siteName);
        }

        return { success: true, message: "Policy already met." };
    }

    /**
     * Install dependencies
     */
    async hydrate(siteName) {
        console.log(`💧 Hydrating ${siteName}...`);
        try {
            execSync('pnpm install --no-frozen-lockfile', { cwd: path.join(this.sitesDir, siteName), stdio: 'ignore' });
            return { success: true, message: "Hydration complete (node_modules installed)." };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    /**
     * Remove node_modules
     */
    dehydrate(siteName) {
        console.log(`🌵 Dehydrating ${siteName} (freeing space)...`);
        const nmPath = path.join(this.sitesDir, siteName, 'node_modules');
        if (fs.existsSync(nmPath)) {
            // Using rm -rf via shell for speed and robustness with deep trees
            execSync(`rm -rf "${nmPath}"`);
            return { success: true, message: "Dehydration complete (node_modules removed)." };
        }
        return { success: true, message: "Already dormant." };
    }

    /**
     * Calculate storage usage in MB
     */
    _calculateStorageUsage(siteName) {
        const siteDir = path.join(this.sitesDir, siteName);
        try {
            // Fast way to get directory size on Linux
            const output = execSync(`du -sm "${siteDir}"`).toString();
            return parseInt(output.split('\t')[0]);
        } catch (e) {
            return 0;
        }
    }

    /**
     * Attempt to heal a broken site (Legacy support, now uses enforcePolicy for NM)
     */
    async heal(siteName) {
        const audit = this._auditSite(siteName);
        const fixes = [];

        // Fix NM via policy enforcement
        const policyResult = await this.enforcePolicy(siteName);
        if (policyResult.success && policyResult.message !== "Policy already met.") {
            fixes.push(policyResult.message);
        }

        // Fix Corrupt JSON (Now handled by SiteHealer)

        return { success: true, message: `Healed ${fixes.length} issues.`, fixes };
    }

    /**
     * Remove all src/data-temp directories across all sites
     */
    async cleanupTempData() {
        console.log("🧹 Cleaning up temporary data directories (older than 3 weeks)...");
        const sites = fs.readdirSync(this.sitesDir).filter(f => 
            fs.statSync(path.join(this.sitesDir, f)).isDirectory() && !f.startsWith('.')
        );

        let cleanedCount = 0;
        const THREE_WEEKS_MS = 3 * 7 * 24 * 60 * 60 * 1000;
        const now = Date.now();

        for (const site of sites) {
            const tempDirPath = path.join(this.sitesDir, site, 'src/data-temp');
            if (fs.existsSync(tempDirPath)) {
                const stats = fs.statSync(tempDirPath);
                const age = now - stats.mtimeMs;
                
                if (age > THREE_WEEKS_MS) {
                    execSync(`rm -rf "${tempDirPath}"`);
                    cleanedCount++;
                }
            }
        }

        return { success: true, message: `Opgeschoond: ${cleanedCount} tijdelijke data-mappen (ouder dan 3 weken) verwijderd.` };
    }

    /**
     * Run pnpm store prune to recover global disk space
     */
    prunePnpmStore() {
        console.log("⚓ Running global pnpm store prune...");
        try {
            const output = execSync('pnpm store prune').toString();
            return { success: true, message: "PNPM Store opgeruimd!", output };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
}
