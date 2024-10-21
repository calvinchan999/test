require("dotenv").config();
const { setupBrowser, navigateToTemplate } = require("../utils/browserUtils");
const { delay } = require("../../helper");

async function clickAutoRowExecuteButtons(page) {
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

async function executeTaskTemplate(session, { arcsRobotType }) {
  let browser;
  try {
    const { browser: br, page } = await setupBrowser(session);
    browser = br;

    // await page.goto(process.env.SITE, { waitUntil: "networkidle0", timeout: 60000 });
    // console.log("Page loaded with session data");

    const robotType = await navigateToTemplate(page, arcsRobotType);
    const result = await clickAutoRowExecuteButtons(page);

    return {
      status: "Execute Task Template Pass",
      robotType,
      processedRows: result,
    };
  } catch (error) {
    console.error("Task template execution failed:", error.message);
    return {
      status: `Task template execution failed: ${error.message}`,
      processedRows: null,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = executeTaskTemplate;
