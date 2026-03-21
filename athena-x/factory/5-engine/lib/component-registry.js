/**
 * @file component-registry.js
 * @description Maps layout types to React components.
 */

export const ComponentRegistry = {
    'hero': { name: 'Hero', path: './Hero' },
    'testimonials': { name: 'Testimonials', path: './Testimonials' },
    'team': { name: 'Team', path: './Team' },
    'faq': { name: 'FAQ', path: './FAQ' },
    'cta': { name: 'CTA', path: './CTA' },
    'product': { name: 'ProductGrid', path: './ProductGrid' },
    'about': { name: 'AboutSection', path: './AboutSection' },
    'grid': { name: 'GenericSection', path: './GenericSection' },
    'list': { name: 'GenericSection', path: './GenericSection' }
};

export function getComponentForSection(sectionName) {
    const lower = sectionName.toLowerCase();

    if (lower === 'basis' || lower === 'basisgegevens' || lower === 'hero') return ComponentRegistry['hero'];
    if (lower.includes('testimonial') || lower.includes('review') || lower.includes('ervaring')) return ComponentRegistry['testimonials'];
    if (lower.includes('team') || lower.includes('medewerker') || lower.includes('wie_zijn_wij')) return ComponentRegistry['team'];
    if (lower.includes('faq') || lower.includes('vragen')) return ComponentRegistry['faq'];
    if (lower.includes('cta') || lower.includes('banner') || lower.includes('actie')) return ComponentRegistry['cta'];
    if (lower.includes('product') || lower.includes('shop')) return ComponentRegistry['product'];
    if (lower.includes('about') || lower.includes('info')) return ComponentRegistry['about'];

    return ComponentRegistry['list']; // Default
}
