
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/GEMINI_API_KEY=["']?([^"'\n\r]+)["']?/);
const apiKey = match ? match[1].trim() : process.env.GEMINI_API_KEY;

if (!apiKey) { console.error("No key"); process.exit(1); }
const genAI = new GoogleGenerativeAI(apiKey);

async function check() {
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-pro"];
    for (const m of models) {
        try {
            console.log(`Testing ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            await model.generateContent("Hi");
            console.log(`SUCCESS: ${m}`);
            return;
        } catch (e) {
            console.log(`FAILED ${m}: ${e.message.split('\n')[0]}`);
        }
    }
}
check();
