require("dotenv").config();
const { setupBrowser, navigateToTemplate } = require("../utils/browserUtils");
const { getTask, cancelTask } = require("../api/api");
const { delay } = require("../../helper");
const _ = require("lodash");

async function clickAutoRowExecuteButtons(page) {
  try {
    // callback function for clickButton
    const clickButton = async (rowInfo) => {
      const buttonSelector = `table.k-grid-table > tbody > tr:nth-child(${rowInfo.index + 1}) > td.execute > a`;
      const submitButtonSelector = `app-cm-task-job > div > div > div > button:nth-child(2)`;
      await page.waitForSelector(buttonSelector, { visible: true, timeout: 10000 });

      try {
        await page.click(buttonSelector);
        console.log(`Clicked execute button for AUTO row ${rowInfo.index} (Mission ID: ${rowInfo.missionId})`);
        await page.waitForSelector(submitButtonSelector, { visible: true, timeout: 10000 });
        await page.click(submitButtonSelector);
        return true;
      } catch (error) {
        const err = `Failed to click execute button for AUTO row ${rowInfo.index} (Mission ID: ${rowInfo.missionId})`;
        return err;
      }
    };

    await page.waitForSelector("table.k-grid-table", { visible: true, timeout: 30000 });

    // Find all AUTO rows and get their information
    const autoRowsInfo = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("table.k-grid-table > tbody > tr"));
      return rows
        .filter((row) => row.textContent.includes("AUTO-CODE"))
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
        clickedRows.push({ rowInfo });
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

    const FMS_API_URL = process.env.FMS_API_URL;
    const taskApiResponse = await getTask(page, FMS_API_URL);

    const { records } = taskApiResponse.data;
    console.log(records);
    const deletedRecord = [];
    const deletedRecordErrors = [];

    for (let record of records) {
      const { missionId, taskId } = record;
      if (missionId.indexOf("AUTO-CODE-") > -1) {
        try {
          await cancelTask(page, FMS_API_URL, taskId);
          deletedRecord.push(record);
        } catch (error) {
          deletedRecordErrors.push(`Error deleting task ${taskId}: ${error.message}`);
        }
      }
    }

    console.log("Deleted Records:", deletedRecord);
    console.log("Errors:", deletedRecordErrors);

    const robotType = await navigateToTemplate(page, arcsRobotType);
    const result = await clickAutoRowExecuteButtons(page);

    await page.evaluate(delay, 5000);

    // todo task status checking
    // const updatedTaskApiResponse = await getTask(page, FMS_API_URL);

    // const { processedRows } = result;
    // for(const processedRows of processedRows) {
    //   const { missionId } = processedRows.rowInfo;
    //   _.find(processedRows)
    // }


    // processedRows

    return {
      status: "Execute Task Template Pass",
      robotType,
      processedRows: result,
      deletedRecords: {
        deletedRecord,
        deletedRecordErrors,
      },
    };
  } catch (error) {
    console.error("Task template execution failed:", error?.message ? error.message : error);
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
