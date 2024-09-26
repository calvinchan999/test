require("dotenv").config();
const puppeteer = require("puppeteer");

async function executeTaskTemplate(session) {
  return new Promise(async (resolve, reject) => {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();

      await page.setViewport({ width: 1080, height: 720 });

      // Set session storage before navigation
      await page.evaluateOnNewDocument((sessionData) => {
        Object.keys(sessionData).forEach((key) => {
          sessionStorage.setItem(key, sessionData[key]);
        });
        console.log("SessionStorage set in the browser");
      }, session);

      await page.goto("https://dev.rv-arcs.com", {
        waitUntil: "networkidle0",
        timeout: 60000, // Increase timeout to 60 seconds
      });
      console.log("Page loaded with session data");

      try {
        await page.waitForSelector("div.header.header-bg", { timeout: 10000 });
        console.log("Found header, likely logged in");

        const userName = await page.$eval("div.profile span", (el) => el.textContent);
        console.log("User name found:", userName);

        if (userName.includes("RV_ADMIN")) {
          console.log("Session is valid, user is logged in");

          await page.waitForSelector("li[kendodraweritem]", {
            visible: true,
            timeout: 10000,
          });

          const filteredMenuItems = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll("li[kendodraweritem]"));
            const allLabels = items.map((item) => item.getAttribute("aria-label")).filter((label) => label);
            return allLabels.filter((label) => !["Dashboard", "Setup"].includes(label));
          });

          console.log("Available filtered menu items:", filteredMenuItems);

          if (filteredMenuItems.length === 0) {
            throw new Error("No valid menu items found");
          }

          await page.goto(`https://dev.rv-arcs.com/${filteredMenuItems[0].toLowerCase()}?selectedTab=template`, {
            waitUntil: "networkidle0",
            timeout: 60000,
          });

          

          console.log("Task template execution successfully");

          resolve({
            status: "Execute Task Template Pass",
          });
        } else {
          throw new Error("User name does not match expected value");
        }
      } catch (error) {
        console.error("Task template execution failed:", error.message);
        throw new Error("Task template execution failed");
      }
    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  });
}

module.exports = executeTaskTemplate;
