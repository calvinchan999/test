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

async function navigateToTemplate(page, arcsRobotType) {
  await page.goto(process.env.SITE, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });

  await page.waitForSelector("div.header.header-bg", { timeout: 10000 });

  const userName = await page.$eval("div.profile span", (el) => el.textContent);
  if (!userName.includes("RV")) {
    throw new Error("User name does not match expected value");
  }

  await page.waitForSelector("li[kendodraweritem]", {
    visible: true,
    timeout: 10000,
  });

  const filteredMenuItems = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll("li[kendodraweritem]"));
    const allLabels = items.map((item) => item.getAttribute("aria-label")).filter((label) => label);
    return allLabels.filter((label) => !["Dashboard", "Setup"].includes(label));
  });

  const robotType = arcsRobotType || filteredMenuItems[0];
  await page.goto(`${process.env.SITE}/${robotType.toLowerCase()}?selectedTab=template`, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });

  return robotType;
}

async function navigateToSchedule(page, arcsRobotType) {
    await page.goto(process.env.SITE, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });
  
    await page.waitForSelector("div.header.header-bg", { timeout: 10000 });
  
    const userName = await page.$eval("div.profile span", (el) => el.textContent);
    if (!userName.includes("RV")) {
      throw new Error("User name does not match expected value");
    }
  
    await page.waitForSelector("li[kendodraweritem]", {
      visible: true,
      timeout: 10000,
    });
  
    const filteredMenuItems = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll("li[kendodraweritem]"));
      const allLabels = items.map((item) => item.getAttribute("aria-label")).filter((label) => label);
      return allLabels.filter((label) => !["Dashboard", "Setup"].includes(label));
    });
  
    const robotType = arcsRobotType || filteredMenuItems[0];
    await page.goto(`${process.env.SITE}/${robotType.toLowerCase()}?selectedTab=schedule`, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });
  
    return robotType;
  }
  
module.exports = {
  setupBrowser,
  navigateToTemplate,
  navigateToSchedule
};
