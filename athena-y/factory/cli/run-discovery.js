import { DiscoveryAgent } from '../5-engine/headless/DiscoveryAgent.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inbox = path.resolve(__dirname, '../../input/gateway_inbox.json');

console.log(`Debug Inbox Path: ${inbox}`);
console.log("🕵️ Starting Athena Discovery Cycle...");
DiscoveryAgent.runFromInbox(inbox)
    .then(() => console.log("🏁 Discovery cycle complete."))
    .catch(err => console.error("❌ Fatal error in discovery cycle:", err));
