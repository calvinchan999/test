require("dotenv").config();
const puppeteer = require("puppeteer");
const { delay } = require("../../helper");

async function runLoginTest() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 720 });

    await page.goto(process.env.SITE, { waitUntil: "networkidle0" });
    console.log("Page loaded successfully");

    await page.waitForSelector("input.k-input", { visible: true });
    console.log("Found input fields");

    const inputFields = await page.$$("input.k-input");

    await inputFields[0].type(process.env.ARCSUSER);
    console.log("Entered username");

    await inputFields[1].type(process.env.ARCSPASSWORD);
    console.log("Entered password");

    await Promise.all([page.click("button.login-button"), page.waitForNavigation({ waitUntil: "networkidle0" })]);
    console.log("Clicked login button");

    await page.waitForSelector("div.header.header-bg", { timeout: 5000 });
    console.log("Found header");

    const userName = await page.$eval("div.profile span", (el) => el.textContent);
    console.log("User name found:", userName);

    if (userName.includes("RV")) {
      console.log("Login successful, user name found:", userName);

      console.log("Waiting 10 seconds for session data to be fully populated...");
      await page.evaluate(delay, 10000);

      const sessionData = await page.evaluate(() => {
        const data = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          data[key] = sessionStorage.getItem(key);
        }
        return data;

        // return {
        //   accessToken: sessionStorage.getItem("accessToken"),
        //   refreshToken: sessionStorage.getItem("refreshToken"),
        //   userId: sessionStorage.getItem("userId"),
        //   clientId: sessionStorage.getItem("clientId"),
        //   currentUser: sessionStorage.getItem("currentUser"),
        //   isGuestMode: sessionStorage.getItem("isGuestMode"),
        //   arcsDefaultBuilding: sessionStorage.getItem("arcsDefaultBuilding"),
        //   arcsLocationTree: sessionStorage.getItem("arcsLocationTree"),
        // };
      });

      console.log("Session data retrieved:", sessionData);

      return {
        status: "Login Pass",
        sessionData,
      };
    } else {
      throw new Error("Login verification failed");
    }
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = runLoginTest;
