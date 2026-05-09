const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log("Browser launched successfully!");
    const page = await browser.newPage();
    console.log("New page created.");
    await page.goto('https://example.com');
    console.log("Navigated to example.com");
    await browser.close();
    console.log("Browser closed.");
  } catch (err) {
    console.error("Puppeteer test failed:", err);
    process.exit(1);
  }
})();
