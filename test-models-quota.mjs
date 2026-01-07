
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/GEMINI_API_KEY=["']?([^"'\n\r]+)["']?/);
const apiKey = match ? match[1].trim() : process.env.GEMINI_API_KEY;

if (!apiKey) { console.error("No key"); process.exit(1); }
const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash", // The one that failed
    "gemini-1.5-flash" // Just in case
];

async function check() {
    console.log("Testing models for quota/availability...");

    for (const m of modelsToTest) {
        try {
            process.stdout.write(`Testing ${m} ... `);
            const model = genAI.getGenerativeModel({ model: m });
            // Use a very short prompt to minimize token usage
            const result = await model.generateContent("Hi");
            const response = await result.response;
            const text = response.text();
            console.log(`✅ SUCCESS!`);
            console.log(`Preferred Model Found: ${m}`);
            process.exit(0); // Exit as soon as we find one
        } catch (e) {
            if (e.message.includes('429')) {
                console.log(`❌ 429 (Quota Exceeded/Limit 0)`);
            } else if (e.message.includes('404')) {
                console.log(`❌ 404 (Not Found)`);
            } else {
                console.log(`❌ Error: ${e.message.split('\n')[0]}`);
            }
        }
    }
    console.log("No working models found.");
}
check();
