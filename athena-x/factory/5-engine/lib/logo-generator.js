import fs from 'fs';
import path from 'path';

/**
 * Athena Randomized Logo Generator (v2.0)
 * Generates a unique SVG logo based on site name, color, and business type.
 */
export class LogoGenerator {
    static getIconForType(siteType) {
        const type = (siteType || '').toLowerCase();
        
        const icons = {
            'webshop': '<path d="M20 30 H80 L75 70 H25 Z M35 30 V20 Q35 10 50 10 Q65 10 65 20 V30" fill="none" stroke="currentColor" stroke-width="4"/>',
            'medical': '<path d="M30 50 H70 M50 30 V70" fill="none" stroke="currentColor" stroke-width="8"/>',
            'restaurant': '<path d="M35 20 V80 M65 20 V80 M35 50 H65" fill="none" stroke="currentColor" stroke-width="4"/>',
            'tech': '<path d="M20 20 L80 80 M80 20 L20 80" fill="none" stroke="currentColor" stroke-width="4"/>',
            'beauty': '<path d="M50 20 Q80 50 50 80 Q20 50 50 20" fill="none" stroke="currentColor" stroke-width="4"/>',
            'default': '<circle cx="50" cy="50" r="10" fill="currentColor"/>'
        };

        if (type.includes('shop') || type.includes('store')) return icons['webshop'];
        if (type.includes('medical') || type.includes('dentist') || type.includes('care')) return icons['medical'];
        if (type.includes('restaurant') || type.includes('food') || type.includes('bakery')) return icons['restaurant'];
        if (type.includes('tech') || type.includes('code') || type.includes('consultancy')) return icons['tech'];
        if (type.includes('beauty') || type.includes('wellness') || type.includes('salon')) return icons['beauty'];

        return icons['default'];
    }

    static generate(siteName, primaryColor = '#3b82f6', siteType = '') {
        const firstLetter = (siteName || 'A').charAt(0).toUpperCase();
        const icon = this.getIconForType(siteType);
        
        // Pick a random style (1-4)
        const style = Math.floor(Math.random() * 4) + 1;
        
        let svgContent = '';
        const viewBox = "0 0 100 100";
        
        if (style === 1) {
            // Minimalist Square + Icon
            svgContent = `
                <rect x="10" y="10" width="80" height="80" rx="15" fill="${primaryColor}" fill-opacity="0.1" stroke="${primaryColor}" stroke-width="4"/>
                <g color="${primaryColor}">${icon}</g>
                <text x="50" y="85" font-family="serif" font-size="20" font-weight="bold" fill="${primaryColor}" text-anchor="middle">${siteName.toUpperCase()}</text>
            `;
        } else if (style === 2) {
            // Modern Circle
            svgContent = `
                <circle cx="50" cy="50" r="45" fill="${primaryColor}"/>
                <g color="white" transform="scale(0.6) translate(33, 25)">${icon}</g>
                <text x="50" y="80" font-family="sans-serif" font-size="14" font-weight="900" fill="white" text-anchor="middle">${siteName.toUpperCase()}</text>
            `;
        } else if (style === 3) {
            // Abstract Hexagon
            svgContent = `
                <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" fill="none" stroke="${primaryColor}" stroke-width="6"/>
                <text x="50" y="55" font-family="monospace" font-size="40" font-weight="bold" fill="${primaryColor}" text-anchor="middle">${firstLetter}</text>
                <g color="${primaryColor}" transform="scale(0.3) translate(115, 180)">${icon}</g>
            `;
        } else {
            // Split Style
            svgContent = `
                <rect x="0" y="0" width="50" height="100" fill="${primaryColor}"/>
                <rect x="50" y="0" width="50" height="100" fill="${primaryColor}" fill-opacity="0.1"/>
                <text x="25" y="65" font-family="sans-serif" font-size="50" font-weight="bold" fill="white" text-anchor="middle">${firstLetter}</text>
                <g color="${primaryColor}" transform="translate(55, 30) scale(0.4)">${icon}</g>
            `;
        }

        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${svgContent}</svg>`;
    }

    static saveToProject(projectDir, siteName, primaryColor, siteType = '') {
        const svg = this.generate(siteName, primaryColor, siteType);
        const publicDir = path.join(projectDir, 'public');
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
        
        const logoPath = path.join(publicDir, 'site-logo.svg');
        fs.writeFileSync(logoPath, svg);
        console.log(`🎨 Logo Generator: Created unique aware logo for ${siteName} (${siteType}) at ${logoPath}`);
        return 'site-logo.svg';
    }
}
