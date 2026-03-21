/**
 * 📚 generate-section-library.js
 * @description Extracts metadata about available UI sections for the Athena Dock.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FACTORY_ROOT = path.resolve(__dirname, '..'); // .../athena-y/factory
const OUTPUT_FILE = path.resolve(FACTORY_ROOT, 'output/SECTION_LIBRARY.json');

const standardSections = [
    {
        id: 'hero',
        name: 'Hero Section',
        description: 'Grote openingssectie met titel, ondertitel en achtergrondafbeelding.',
        icon: 'fa-rocket',
        layout: 'hero',
        fields: ['title', 'subtitle', 'image', 'cta_text', 'cta_url']
    },
    {
        id: 'intro',
        name: 'Introduction',
        description: 'Een korte introductie of welkomsttekst met eventueel een afbeelding.',
        icon: 'fa-align-left',
        layout: 'list',
        fields: ['title', 'content', 'subcontent', 'image']
    },
    {
        id: 'features',
        name: 'Features Grid',
        description: 'Overzicht van diensten of kenmerken in een modern grid.',
        icon: 'fa-table-columns',
        layout: 'grid',
        fields: ['titel', 'beschrijving', 'icon']
    },
    {
        id: 'about',
        name: 'About Section',
        description: 'Uitgebreidere informatie over het bedrijf of de persoon.',
        icon: 'fa-address-card',
        layout: 'list',
        fields: ['titel', 'tekst', 'afbeelding']
    },
    {
        id: 'testimonials',
        name: 'Testimonials',
        description: 'Klantbeoordelingen en ervaringen.',
        icon: 'fa-quote-left',
        layout: 'grid',
        fields: ['naam', 'quote', 'functie', 'foto']
    },
    {
        id: 'team',
        name: 'Team Members',
        description: 'Stel je medewerkers of team voor.',
        icon: 'fa-users',
        layout: 'grid',
        fields: ['naam', 'functie', 'telefoon', 'email', 'foto']
    },
    {
        id: 'faq',
        name: 'FAQ Section',
        description: 'Veelgestelde vragen en antwoorden.',
        icon: 'fa-circle-question',
        layout: 'list',
        fields: ['vraag', 'antwoord']
    },
    {
        id: 'cta',
        name: 'Call to Action',
        description: 'Een opvallende banner om conversies te stimuleren.',
        icon: 'fa-bullhorn',
        layout: 'hero',
        fields: ['titel', 'tekst', 'button_label', 'button_url']
    },
    {
        id: 'products',
        name: 'Product Grid',
        description: 'Toon je producten of diensten met prijzen.',
        icon: 'fa-store',
        layout: 'grid',
        fields: ['naam', 'prijs', 'beschrijving', 'foto', 'link']
    },
    {
        id: 'pricing',
        name: 'Pricing Table',
        description: 'Vergelijk verschillende pakketten of plannen.',
        icon: 'fa-tags',
        layout: 'grid',
        fields: ['naam', 'prijs', 'features', 'button_label', 'button_url', 'is_featured']
    },
    {
        id: 'gallery',
        name: 'Image Gallery',
        description: 'Een visuele galerij voor projecten of sfeerbeelden.',
        icon: 'fa-images',
        layout: 'list',
        fields: ['titel', 'beschrijving', 'foto']
    },
    {
        id: 'contact',
        name: 'Contact & Map',
        description: 'Contactgegevens met Google Maps integratie.',
        icon: 'fa-location-dot',
        layout: 'contact',
        fields: ['adres', 'telefoon', 'email', 'maps_url']
    }
];

async function generate() {
    console.log("📚 Generating Visual Component Library...");

    const library = {
        version: "1.0.0",
        generatedAt: new Date().toISOString(),
        sections: standardSections
    };

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(library, null, 2));
    console.log(`✅ Library saved to: ${OUTPUT_FILE}`);
}

generate().catch(err => console.error(err));
