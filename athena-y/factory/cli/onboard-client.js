import { DigitalStrategist } from '../5-engine/headless/DigitalStrategist.js';
import path from 'path';
import { fileURLToPath } from 'url';

const args = process.argv.slice(2);
const idea = args[0] || "Een nieuwe hippe koffiebar in Gent genaamd 'Café Congé'";
const email = args[1] || "karel.test.special@gmail.com";

const strategist = new DigitalStrategist();

console.log("🚀 Starting Digital Strategist Session...");
strategist.brainstorm(idea, email)
    .then(() => console.log("🏁 Client onboarding complete."))
    .catch(err => console.error("❌ Onboarding failed:", err));
