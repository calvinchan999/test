const puppeteer = require("puppeteer");

async function setupBrowser(session) {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 720 });

  await page.evaluateOnNewDocument((sessionData) => {
    Object.keys(sessionData).forEach((key) => {
      sessionStorage.setItem(key, sessionData[key]);
    });
    console.log("SessionStorage set in the browser");
  }, session);

  return { browser, page };
}

module.exports = {
  setupBrowser,
};
