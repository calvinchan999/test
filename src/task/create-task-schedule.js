require("dotenv").config();
const { setupBrowser, navigateToSchedule, waitForApiResponse } = require("../utils/browserUtils");
const { selectDropdownItem, configureScheduleRecurrence } = require("../utils/scheduleUtils");
const { delay } = require("../../helper");

async function createTaskSchedule(session, { templateCode, startDate, endDate, schedulingSettings = {}, arcsRobotType }) {
  return new Promise(async (resolve, reject) => {
    let browser;
    try {
      const { browser: br, page } = await setupBrowser(session);
      browser = br;

      const taskSchedulingInfo = {
        startDate,
        endDate,
      };

      try {
        const robotType = await navigateToSchedule(page, arcsRobotType);

        const newButtonSelector = "kendo-grid > kendo-grid-toolbar > button";
        await page.waitForSelector(newButtonSelector, {
          visible: true,
          timeout: 10000,
        });
        await page.click(newButtonSelector);

        await page.evaluate(delay, 1000);

        const startDateSelector = "uc-date-input.col.date-input-container.startDateTime > kendo-datetimepicker > span > kendo-dateinput input";
        const endDateSelector = "uc-date-input.col.date-input-container.endDateTime > kendo-datetimepicker > span > kendo-dateinput input";

        await page.waitForSelector(startDateSelector, { visible: true, timeout: 10000 });
        await page.waitForSelector(endDateSelector, { visible: true, timeout: 10000 });

        await page.type(startDateSelector, startDate, { delay: 100 });
        await page.type(endDateSelector, endDate, { delay: 100 });

        await page.evaluate(delay, 1000);
        const scheduleNameSelector = "div:nth-child(2) > uc-txtbox > form > kendo-textbox > input";
        const scheduleName = `[Schedule] ${templateCode}`;
        await page.type(scheduleNameSelector, scheduleName, { delay: 100 });
        taskSchedulingInfo.scheduleName = scheduleName;

        await page.evaluate(delay, 2000);

        const recurrenceDropdownSelector = "uc-cron-editor > div > uc-dropdown > div > kendo-dropdownlist";
        const recurrenceDropdownSelectorResult = await selectDropdownItem(page, recurrenceDropdownSelector, schedulingSettings.recurrence);
        taskSchedulingInfo.recurrenceDropdownSelectorResult = recurrenceDropdownSelectorResult;
        await page.evaluate(delay, 3000);

        if (Object.keys(schedulingSettings).length > 0) {
          const { patternDropdownSelectorResult, minute } = await configureScheduleRecurrence(page, schedulingSettings);
          taskSchedulingInfo.patternDropdownSelectorResult = patternDropdownSelectorResult;
          taskSchedulingInfo.minute = minute;
        }

        await page.evaluate(delay, 2000);
        const templateDropdownSelector = "uc-dropdown > div > kendo-dropdownlist";
        const templateDropdownSelectorResult = await selectDropdownItem(page, templateDropdownSelector, templateCode);
        taskSchedulingInfo.templateDropdownSelectorResult = templateDropdownSelectorResult;

        await page.evaluate(delay, 1000);
        await page.click("div.button-container > button.k-button.ng-star-inserted");
        await waitForApiResponse(page, "/api/mission/v1/schedule", 15000);

        await page.evaluate(delay, 3000);

        resolve({
          status: "Create Task Schedule Pass",
          robotType,
          taskSchedulingInfo,
        });
      } catch (error) {
        console.error("Task Schedule creation failed:", error?.message ? error.message : error);
        throw new Error("Task Schedule creation failed");
      }
    } catch (error) {
      throw error;
    } finally {
      if (browser) {
        // Uncomment the next line when you want to close the browser automatically
        await browser.close();
      }
    }
  });
}

module.exports = createTaskSchedule;
