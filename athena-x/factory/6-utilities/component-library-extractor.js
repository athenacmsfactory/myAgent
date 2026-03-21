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

const COMPONENTS_DIR = path.join(root, 'factory/2-templates/shared/components');
const OUTPUT_FILE = path.join(root, 'output/LIBRARY_METADATA.json');

function extractMetadata() {
    console.log("🔍 Extracting Component Library Metadata...");
    const results = {};

    if (!fs.existsSync(COMPONENTS_DIR)) {
        console.error("❌ Components directory not found.");
        return;
    }

    const files = fs.readdirSync(COMPONENTS_DIR).filter(f => f.endsWith('.jsx'));

    files.forEach(file => {
        const content = fs.readFileSync(path.join(COMPONENTS_DIR, file), 'utf8');
        const componentName = file.replace('.jsx', '');
        
        // Basic Metadata Extraction
        const metadata = {
            name: componentName,
            file: file,
            description: "",
            props: []
        };

        // 1. Extract JSDoc/Comments
        const docMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
        if (docMatch) {
            metadata.description = docMatch[1].replace(/\*/g, '').trim();
        }

        // 2. Extract Prop Names (simple heuristic)
        const propsMatch = content.match(/function\s+\w+\s*\({([\s\S]*?)}\)/) || 
                           content.match(/const\s+\w+\s*=\s*\({([\s\S]*?)}\)/);
        
        if (propsMatch) {
            const propList = propsMatch[1].split(',').map(p => p.trim().split('=')[0].trim()).filter(p => p && !p.startsWith('/'));
            metadata.props = propList;
        }

        results[componentName] = metadata;
        console.log(`✅ Extracted: ${componentName} (${metadata.props.length} props)`);
    });

    if (!fs.existsSync(path.dirname(OUTPUT_FILE))) fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 4));
    console.log(`\n✨ Library metadata saved to: output/LIBRARY_METADATA.json`);
}

extractMetadata();
