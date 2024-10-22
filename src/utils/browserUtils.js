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

async function waitForApiResponse(page, apiUrlPattern, timeout = 30000) {
  //   return new Promise((resolve, reject) => {
  //     const timeoutId = setTimeout(() => {
  //       page.removeListener("response", responseHandler);
  //       reject(new Error(`API response timeout: The request to ${apiUrlPattern} took longer than ${timeout}ms`));
  //     }, timeout);

  //     const responseHandler = async (response) => {
  //       if (response.url().includes(apiUrlPattern) && response.status() === 200) {
  //         clearTimeout(timeoutId);
  //         try {
  //           const responseText = await response.text();
  //         //   console.log("Raw API Response:", responseText);
  //           let responseData;
  //           try {
  //             responseData = JSON.parse(responseText);
  //           } catch (jsonError) {
  //             console.log("Response is not JSON:", jsonError.message);
  //             responseData = responseText;
  //           }
  //           page.removeListener("response", responseHandler);
  //           reject(responseData);
  //         } catch (error) {
  //           page.removeListener("response", responseHandler);
  //           reject(new Error(`Failed to process API response: ${error.message}`));
  //         }
  //       }
  //     };

  //     page.on("response", responseHandler);
  //   });

  try {
    const response = await page.waitForResponse((response) => response.url().includes(apiUrlPattern) && response.status() === 200, { timeout });

    const responseText = await response.text();
    console.log("Raw API Response:", responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (jsonError) {
      console.log("Response is not JSON:", jsonError.message);
      responseData = responseText;
    }

    return responseData;
  } catch (error) {
    if (error.name === "TimeoutError") {
      throw new Error(`API response timeout: The request to ${apiUrlPattern} took longer than ${timeout}ms`);
    }
    throw new Error(`Failed to process API response: ${error.message}`);
  }
}

module.exports = {
  setupBrowser,
  navigateToTemplate,
  navigateToSchedule,
  waitForApiResponse,
};
