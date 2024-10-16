require("dotenv").config();
const puppeteer = require("puppeteer");

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function selectDropdownValue(page, dropdownSelector, values = []) {
  try {
    const dropdowns = await page.$$(dropdownSelector);
    console.log(`Found ${dropdowns.length} dropdowns`);

    for (let i = 0; i < values.length; i++) {
      console.log(`Processing dropdown ${i + 1} of ${dropdowns.length}`);

      // Click the dropdown
      await dropdowns[i].click();
      console.log(`Clicked dropdown ${i + 1}`);

      // Wait for the dropdown list to be visible
      await page.waitForSelector(".k-list-container", { visible: true, timeout: 3000 });
      console.log(`Dropdown list container is visible for dropdown ${i + 1}`);

      // Wait for options to load
      // await page.waitForTimeout(1000);
      await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 1000)));

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
          targetOption = optionsData.find((item) => item.text.includes(value));
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
      }, values[i]);

      console.log(`Evaluation result for dropdown ${i + 1}:`, result);

      if (!result.success) {
        console.error(`Error in dropdown ${i + 1}:`, result.message);
        continue; // Move to the next dropdown
      }

      console.log(`Selected value for dropdown ${i + 1}: ${result.selected}`);

      // Wait for the dropdown to close and the selection to be applied
      // await page.waitForTimeout(1000);
      await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 3000)));

      // Verify the selection
      const selectedValue = await dropdowns[i].evaluate((el) => el.textContent.trim());
      console.log(`Dropdown ${i + 1} now shows: ${selectedValue}`);

      if (!selectedValue.includes(result.selected)) {
        console.error(`Failed to select option in dropdown ${i + 1}. Expected to include: "${result.selected}", Actual: "${selectedValue}"`);
      } else {
        console.log(`Selection successful for dropdown ${i + 1}`);
      }
    }
  } catch (error) {
    console.error(`Error in selectDropdownValues:`, error);
    throw error;
  }
}

async function addTemplateRows(page, templateActions) {
  try {
    for (const item of templateActions) {
      if(!(item.action[2])) {
        await actionGoToWaypoint(page, item.action);
      }
      if(item.action[2] === "Sleep") {
        await actionSleep(page, item.action, item.duration.toString());
      }
    }
  } catch (error) {
    console.error("Error in addTemplateRows:", error);
    throw error;
  }
}

async function actionSleep(page, action, timeout) {
  try {
    const floorplanDropdownSelector =
      'uc-dropdown[class="col dropdown-container ng-star-inserted"] label.col-form-label + kendo-dropdownlist  .k-dropdown-wrap';
    await selectDropdownValue(page, floorplanDropdownSelector, action);

    await page.evaluate(delay, 3000);
    await page.type("uc-txtbox.numeric kendo-numerictextbox input.k-input", timeout);
    await page.evaluate(delay, 1000);
    await page.click(`div.add.listview-cell.ng-star-inserted > div > a`);
  } catch (error) {
    console.error("Error in actionSleep:", error);
    throw error;
  }
}

async function actionGoToWaypoint(page, action) {
  try {
    const floorplanDropdownSelector =
      'uc-dropdown[class="col dropdown-container ng-star-inserted"] label.col-form-label + kendo-dropdownlist  .k-dropdown-wrap';
    await selectDropdownValue(page, floorplanDropdownSelector, action);
    await page.evaluate(delay, 1000);
    await page.click(`div.add.listview-cell.ng-star-inserted > div > a`);
  } catch (error) {
    console.error("Error in actionSleep:", error);
    throw error;
  }

}

async function createTaskTemplate(session, { robot, templateActions }) {
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

          const buttonSelector = 'button.k-button.k-button-icontext[kendobutton][icon="plus"]:has(span.k-icon.k-i-plus)';
          await page.waitForSelector(buttonSelector, {
            visible: true,
            timeout: 10000,
          });
          await page.click(buttonSelector);

          // Wait for input fields to be available
          await page.waitForSelector("input.k-input", {
            visible: true,
            timeout: 10000,
          });
          const inputFields = await page.$$("input.k-input");
          const now = new Date();
          await inputFields[0].type(`AUTO-CODE-${filteredMenuItems[0].toUpperCase()}-${now.toISOString()}`);
          await inputFields[1].type(`AUTO-NAME-${filteredMenuItems[0].toUpperCase()}-${now.toISOString()}`);

          await page.evaluate(delay, 1000);

          const robotDropdownSelector = 'uc-dropdown[lab="Robot"] kendo-dropdownlist .k-dropdown-wrap';
          await selectDropdownValue(page, robotDropdownSelector, [robot]);

          await page.evaluate(delay, 1000);

          await addTemplateRows(page, templateActions);

          await page.evaluate(delay, 3000);
          await page.waitForSelector("div > div > app-cm-task-job > div > div > div > button:nth-child(2)", { visible: true });
          await page.click("div > div > app-cm-task-job > div > div > div > button:nth-child(2)");

          console.log("Task template creation completed successfully");

          resolve({
            status: "Create Task Template Pass",
          });
        } else {
          throw new Error("User name does not match expected value");
        }
      } catch (error) {
        console.error("Task template creation failed:", error.message);
        throw new Error("Task template creation failed");
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

module.exports = createTaskTemplate;
