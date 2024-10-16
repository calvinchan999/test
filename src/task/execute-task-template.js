require("dotenv").config();
const puppeteer = require("puppeteer");
const { delay } = require("../../helper");

async function clickAutoRowExecuteButtons(page) {
  // const { clickAll = false, maxRows = Infinity, startFromLatest = true } = options;

  try {
    // callback function for clickButton
    const clickButton = async (rowInfo) => {
      const buttonSelector = `table.k-grid-table > tbody > tr:nth-child(${rowInfo.index + 1}) > td.execute > a`;

      await page.waitForSelector(buttonSelector, { visible: true, timeout: 10000 });

      try {
        await page.click(buttonSelector);
        console.log(`Clicked execute button for AUTO row ${rowInfo.index} (Mission ID: ${rowInfo.missionId})`);
        await page.evaluate(delay, 1000);

        const responsePromise = new Promise((resolve) => {
          const responseHandler = async (response) => {
            const url = response.url();
            let inputString = rowInfo.missionId;
            inputString = inputString.substring(0, inputString.length - 25);
            if (url.includes(inputString)) {
              const contentType = response.headers()["content-type"];
              if (contentType && contentType.includes("application/json")) {
                const responseBody = await response.json();
                if (page && typeof page.removeListener === "function") {
                  page.removeListener("response", responseHandler);
                }
                resolve(responseBody);
              } else {
                console.log(`Skipping non-JSON response for URL: ${url}`);
              }

              if (page && typeof page.removeListener === "function") {
                page.removeListener("response", responseHandler); // Remove the listener
              }
              resolve(null);
            }
          };

          page.on("response", responseHandler);
        });

        await page.click("app-cm-task-job > div > div > div > button:nth-child(2)");
        const apiResponse = await Promise.race([
          responsePromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("API response timeout")), 10000)),
        ]);

        console.log(`API response for confirm button click on row ${rowInfo.index}:`, apiResponse);
        const isSuccess = apiResponse ? true : false;

        if (isSuccess) {
          // console.log(`Successfully processed confirm action for row ${rowInfo.index}`);
          const msg = `Successfully processed confirm action for row ${rowInfo.index}`;
          return msg;
        } else {
          // console.log(`API indicated failure for confirm action on row ${rowInfo.index}`);
          const msg = `API indicated failure for confirm action on row ${rowInfo.index}`;
          return msg;
        }
      } catch (error) {
        // console.log(`Failed to click execute button for AUTO row ${rowInfo.index} (Mission ID: ${rowInfo.missionId})`, error);
        const err = `Failed to click execute button for AUTO row ${rowInfo.index} (Mission ID: ${rowInfo.missionId})`;
        return err;
      }
    };

    // Wait for the table to be visible
    await page.waitForSelector("table.k-grid-table", { visible: true, timeout: 30000 });

    // Find all AUTO rows and get their information
    const autoRowsInfo = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("table.k-grid-table > tbody > tr"));
      return rows
        .filter((row) => row.textContent.includes("AUTO"))
        .map((row) => {
          const missionId = row.querySelector("td.missionId").textContent.trim();
          const date = missionId.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)[0];
          return {
            date,
            index: Array.from(row.parentNode.children).indexOf(row),
            missionId,
          };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    if (autoRowsInfo.length === 0) {
      console.log("No AUTO rows found");
      return [];
    }

    console.log(`Found ${autoRowsInfo.length} AUTO rows`);

    const clickedRows = [];

    for (const rowInfo of autoRowsInfo) {
      const result = await clickButton(rowInfo);
      if (result) {
        clickedRows.push({ rowInfo, result: result });
      }
    }

    console.log(`Successfully clicked ${clickedRows.length} out of ${autoRowsInfo.length} AUTO row(s)`);

    return clickedRows;
  } catch (error) {
    console.error("Error clicking AUTO row execute button(s):", error);
    throw error;
  }
}

async function executeTaskTemplate(
  session 
) {
  return new Promise(async (resolve, reject) => {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: false,
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

      await page.goto(process.env.SITE, {
        waitUntil: "networkidle0",
        timeout: 60000, // Increase timeout to 60 seconds
      });
      console.log("Page loaded with session data");

      try {
        await page.waitForSelector("div.header.header-bg", { timeout: 10000 });
        console.log("Found header, likely logged in");

        const userName = await page.$eval("div.profile span", (el) => el.textContent);
        console.log("User name found:", userName);

        if (userName.includes("RV")) {
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

          await page.goto(`${process.env.SITE}/${filteredMenuItems[0].toLowerCase()}?selectedTab=template`, {
            waitUntil: "networkidle0",
            timeout: 60000,
          });

          const result = await clickAutoRowExecuteButtons(page);

          console.log(result);

          resolve({
            status: "Execute Task Template Pass",
            processedRows: result ? result : null,
          });
        } else {
          // throw new Error("User name does not match expected value");
          reject({
            status: "User name does not match expected value",
          });
        }
      } catch (error) {
        console.error("Task template execution failed:", error.message);
        // throw new Error("Task template execution failed");

        reject({
          status: `Task template execution failed: ${error.message}`,
          processedRows: result ? result : null,
        });
      }
    } catch (error) {
      console.error("Test failed:", error);
      // throw error;
      reject({
        status: `Test failed: ${error}`,
        processedRows: result ? result : null,
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  });
}

module.exports = executeTaskTemplate;

