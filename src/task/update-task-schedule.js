require("dotenv").config();
const { clickTaskScheduleEditButton, configureScheduleRecurrence } = require("../utils/scheduleUtils");
const { setupBrowser, navigateToSchedule, waitForApiResponse } = require("../utils/browserUtils");
const { delay } = require("../../helper");

async function updateTaskSchedule(session, { templateCode, scheduleName, startDate, endDate, schedulingSettings = {}, arcsRobotType }) {
  let browser;
  try {
    const taskSchedulingInfo = {
      startDate,
      endDate,
    };
    const { browser: br, page } = await setupBrowser(session);
    browser = br;

    const robotType = await navigateToSchedule(page, arcsRobotType);

    await clickTaskScheduleEditButton(page, templateCode, scheduleName);
    await page.evaluate(delay, 1000);

    if (startDate && endDate) {
      const startDateSelector = "uc-date-input.col.date-input-container.startDateTime > kendo-datetimepicker > span > kendo-dateinput input";
      const endDateSelector = "uc-date-input.col.date-input-container.endDateTime > kendo-datetimepicker > span > kendo-dateinput input";

      await page.waitForSelector(startDateSelector, { visible: true, timeout: 10000 });
      await page.waitForSelector(endDateSelector, { visible: true, timeout: 10000 });

      await page.type(startDateSelector, startDate, { delay: 100 });
      await page.type(endDateSelector, endDate, { delay: 100 });
    }

    const scheduleNameSelector = await page.$("div:nth-child(2) > uc-txtbox > form > kendo-textbox > input");
    let currentScheduleName = await scheduleNameSelector.evaluate((el) => el.value);
    const now = new Date();

    if (currentScheduleName.includes("[UPDATED_AT")) {
      await scheduleNameSelector.evaluate((el) => (el.value = ""));
    }
    const newName = `${currentScheduleName.substring(0, currentScheduleName.indexOf("[UPDATED_AT"))} [UPDATED_AT_${now.toISOString()}]`;
    taskSchedulingInfo.scheduleName = newName;
    await scheduleNameSelector.type(newName);

    if (Object.keys(schedulingSettings).length > 0) {
      const { patternDropdownSelectorResult, minute } = await configureScheduleRecurrence(page, schedulingSettings);
      taskSchedulingInfo.patternDropdownSelectorResult = patternDropdownSelectorResult;
      taskSchedulingInfo.minute = minute;
    }

    await page.evaluate(delay, 1000);
    await page.click("div.button-container > button.k-button.ng-star-inserted");
    await waitForApiResponse(page, "/api/mission/v1/schedule", 15000);

    await page.evaluate(delay, 3000);

    return {
      status: "Update Task Schedule Pass",
      robotType,
      taskSchedulingInfo,
    };
  } catch (error) {
    // throw new Error("Update Task template failed");
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = updateTaskSchedule;
