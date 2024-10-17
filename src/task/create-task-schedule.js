require("dotenv").config();
const puppeteer = require("puppeteer");
const { delay } = require("../../helper");

async function selectDropdownItem(page, selector, item) {
  await page.waitForSelector(selector, {
    visible: true,
    timeout: 10000,
  });
  await page.click(selector);

  await page.waitForSelector(".k-list-container", { visible: true, timeout: 3000 });
  await page.evaluate(delay, 1000);

  const result = await page.evaluate((value) => {
    const selectors = [".k-list-item", ".k-list-container li", ".k-list-scroller li", '[role="option"]', "kendo-list .k-item"];

    let options = [];
    for (const selector of selectors) {
      options = Array.from(document.querySelectorAll(selector));
      if (options.length > 0) {
        console.log(`Found ${options.length} options with selector: ${selector}`);
        break;
      }
    }

    if (options.length === 0) {
      console.log("No options found with any selector");
      return { success: false, message: "No options found in dropdown" };
    }

    const optionsData = options.map((option, index) => ({
      index,
      text: option.textContent.trim(),
      html: option.outerHTML,
      classes: option.className,
    }));

    let targetOption;

    if (value) {
      targetOption = optionsData.find((item) => item.text.includes(value)); // todo
      if (!targetOption) {
        return { success: false, message: `Option with value "${value}" not found`, optionsData };
      }
    } else {
      targetOption = optionsData[optionsData.length - 1]; // Last option if no value provided
    }

    console.log("Target option:", targetOption);

    const optionElement = options[targetOption.index];
    console.log(`Selecting option: "${targetOption.text}"`);
    optionElement.click();

    return { success: true, selected: targetOption.text, optionsData };
  }, item);

  if (!result.success) {
    console.error(`Error in dropdown:`, result.message);
  }

  console.log(`Selected value for dropdown: ${result.selected}`);
  return result; 
}

async function createTaskSchedule(session, { templateName, startDate, endDate, schedulingSettings = {}, arcsRobotType }) {
  return new Promise(async (resolve, reject) => {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();

      await page.setViewport({ width: 1080, height: 720 });

      const taskSchedulingInfo = {
        startDate,
        endDate,
      }

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
          const robotType = arcsRobotType ? arcsRobotType : filteredMenuItems[0];
          await page.goto(`${process.env.SITE}/${robotType.toLowerCase()}?selectedTab=schedule`, {
            waitUntil: "networkidle0",
            timeout: 60000,
          });

          const newButtonSelector = "kendo-grid > kendo-grid-toolbar > button";
          await page.waitForSelector(newButtonSelector, {
            visible: true,
            timeout: 10000,
          });
          await page.click(newButtonSelector);

          await page.evaluate(delay, 1000);

          const startDateSelector = 'uc-date-input.col.date-input-container.startDateTime > kendo-datetimepicker > span > kendo-dateinput input';
          const endDateSelector = 'uc-date-input.col.date-input-container.endDateTime > kendo-datetimepicker > span > kendo-dateinput input';

          await page.waitForSelector(startDateSelector, { visible: true, timeout: 10000 });
          await page.waitForSelector(endDateSelector, { visible: true, timeout: 10000 });

          await page.type(startDateSelector, startDate, { delay: 100 });
          await page.type(endDateSelector, endDate, { delay: 100 });

          await page.evaluate(delay, 1000);
          const scheduleNameSelector = 'div:nth-child(2) > uc-txtbox > form > kendo-textbox > input';
          const scheduleName = `[Schedule] ${templateName}`;
          await page.type(scheduleNameSelector, scheduleName, { delay: 100 });
          taskSchedulingInfo.scheduleName = scheduleName;

          await page.evaluate(delay, 2000);

          const recurrenceDropdownSelector = "uc-cron-editor > div > uc-dropdown > div > kendo-dropdownlist";
          const recurrenceDropdownSelectorResult = await selectDropdownItem(page, recurrenceDropdownSelector, schedulingSettings.recurrence );
          taskSchedulingInfo.recurrenceDropdownSelectorResult = recurrenceDropdownSelectorResult;
          await page.evaluate(delay, 3000);

          if(schedulingSettings.recurrence ==='One Time Only') {}

          if(schedulingSettings.recurrence ==='Hourly') {
            const patternDropdownSelector = "uc-dropdown.col.dropdown-container.ng-star-inserted > div > kendo-dropdownlist";
            const patternDropdownSelectorResult = await selectDropdownItem(page, patternDropdownSelector, schedulingSettings.pattern );
            taskSchedulingInfo.patternDropdownSelectorResult = patternDropdownSelectorResult;

            const minuteSelector = 'div.form-row.hour-minute.ng-star-inserted > uc-txtbox > div > kendo-numerictextbox > span > input';
            await page.type(minuteSelector, schedulingSettings.minute, { delay: 100 });
            taskSchedulingInfo.minute = schedulingSettings.minute;
          }

          await page.evaluate(delay, 2000);
          const templateDropdownSelector = "uc-dropdown > div > kendo-dropdownlist";
          const templateDropdownSelectorResult = await selectDropdownItem(page, templateDropdownSelector, templateName );
          taskSchedulingInfo.templateDropdownSelectorResult = templateDropdownSelectorResult

   
          await page.evaluate(delay, 1000);
          await page.click("div.button-container > button.k-button.ng-star-inserted");

          await page.evaluate(delay, 3000);

          resolve({
            status: "Create Task Schedule Pass",
            // taskSchedulingInfo: {
            //   scheduleName,
            //   startDate,
            //   endDate,
            //   templateDropdownSelectorResult,
            //   recurrenceDropdownSelectorResult,
            //   patternDropdownSelectorResult
            // }
            taskSchedulingInfo

          });
        } else {
          throw new Error("User name does not match expected value");
        }
      } catch (error) {
        console.error("Task Schedule creation failed:", error.message);
        throw new Error("Task Schedule creation failed");
      }
    } catch (error) {
      console.error("Test failed:", error);
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
