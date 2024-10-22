// taskUtils.js
const { delay } = require("../../helper");

async function clickTaskTemplateEditButton(page, templateCode) {
  await page.evaluate((code) => {
    const rows = document.querySelectorAll("tbody tr");
    for (const row of rows) {
      const codeCell = row.querySelector("td.missionId span");
      //   if (codeCell && codeCell.textContent.trim() === code) {
      //     const editButton = row.querySelector("td.edit.button a");
      //     if (editButton) {
      //       editButton.click();
      //       return true;
      //     }
      //   }
      if (codeCell && codeCell.textContent.trim().includes(code)) {
        const editButton = row.querySelector("td.edit.button a");
        if (editButton) {
          editButton.click();
          return true;
        }
      }
    }
    throw new Error(`Template with code ${code} not found`);
  }, templateCode);
}

async function selectDropdownValue(page, dropdownSelector, values = []) {
  const results = [];
  try {
    const dropdowns = await page.$$(dropdownSelector);
    console.log(`Found ${dropdowns.length} dropdowns`);

    for (let i = 0; i < values.length; i++) {
      if (values[i]) {
        console.log(`Processing dropdown ${i + 1} of ${dropdowns.length}`);

        // Click the dropdown
        await dropdowns[i].click();
        console.log(`Clicked dropdown ${i + 1}`);

        // Wait for the dropdown list to be visible
        await page.waitForSelector(".k-list-container", { visible: true, timeout: 3000 });
        console.log(`Dropdown list container is visible for dropdown ${i + 1}`);

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
          results.push({ success: false, message: result.message, dropdownIndex: i });
          continue; // Move to the next dropdown
        }

        console.log(`Selected value for dropdown ${i + 1}: ${result.selected}`);
        await page.evaluate(delay, 3000);

        // Verify the selection
        const selectedValue = await dropdowns[i].evaluate((el) => el.textContent.trim());
        console.log(`Dropdown ${i + 1} now shows: ${selectedValue}`);

        if (!selectedValue.includes(result.selected)) {
          console.error(`Failed to select option in dropdown ${i + 1}. Expected to include: "${result.selected}", Actual: "${selectedValue}"`);
          results.push({ success: false, message: `Failed to select option`, expected: result.selected, actual: selectedValue, dropdownIndex: i });
        } else {
          console.log(`Selection successful for dropdown ${i + 1}`);
          results.push({ success: true, dropdownIndex: i, result });
        }
      }
    }
  } catch (error) {
    console.error(`Error in selectDropdownValues:`, error);
    results.push({ success: false, message: error.message, error });
    // throw error;
  }
  return results;
}

async function addTemplateRows(page, templateActions) {
  const results = [];
  try {
    for (const item of templateActions) {
      let result;
      if (!item.action[2]) {
        result = await actionGoToWaypoint(page, item.action);
        results.push({ type: "GoToWaypoint", action: item.action, result });
      }
      if (item.action[2] === "Sleep") {
        result = await actionSleep(page, item.action, item.duration.toString());
        results.push({ type: "Sleep", action: item.action, duration: item.duration, result });
      }
      if (item.action[2] === "Safety Zone Change") {
        result = await actionSafetyZoneChange(page, item.action, item.safetyZoneSetting);
        results.push({ type: "SafetyZoneChange", action: item.action, safetyZoneSetting: item.safetyZoneSetting, result });
      }
      if (item.action[2] === "Lidar Docking Dock") {
        result = await actionLidarDockingDock(page, item.action, item.liderDockingDockSetting);
        results.push({ type: "LidarDockingDock", action: item.action, liderDockingDockSetting: item.liderDockingDockSetting, result });
      }
      if (item.action[2] === "Shelf Carrier Command") {
        result = await actionShelfCarrierCommand(page, item.action, item.shelfCarrierCommandSetting);
        results.push({ type: "ShelfCarrierComman", action: item.action, shelfCarrierCommandSetting: item.shelfCarrierCommandSetting, result });
      }
      if (item.action[2] === "Lidar Docking Undock") {
        result = await actionLidarDockingUndock(page, item.action);
        results.push({ type: "LidarDockingUndock", action: item.action, result });
      }
    }
  } catch (error) {
    console.error("Error in addTemplateRows:", error);
    results.push({ type: "Error", error: error.message });
  }
  return results;
}

async function actionLidarDockingUndock(page, action) {
  const floorplanDropdownSelector =
    'uc-dropdown[class="col dropdown-container ng-star-inserted"] label.col-form-label + kendo-dropdownlist  .k-dropdown-wrap';
  const dropdownResult = await selectDropdownValue(page, floorplanDropdownSelector, action);

  await page.evaluate(delay, 1000);
  await page.click(`div.add.listview-cell.ng-star-inserted > div > a`);

  return { success: true, dropdownResult };
}

async function actionShelfCarrierCommand(page, action, shelfCarrierCommandSetting) {
  const floorplanDropdownSelector =
    'uc-dropdown[class="col dropdown-container ng-star-inserted"] label.col-form-label + kendo-dropdownlist  .k-dropdown-wrap';
  const dropdownResult = await selectDropdownValue(page, floorplanDropdownSelector, action);

  await page.evaluate(delay, 3000);

  await page.waitForSelector('.form-row .checkbox input[type="radio"]');

  await page.evaluate((value) => {
    const labels = Array.from(document.querySelectorAll(".form-row .checkbox label"));
    const custom1Label = labels.find((label) => label.textContent.trim() === value);
    if (custom1Label) {
      custom1Label.previousElementSibling.click();
    } else {
      throw new Error(`${value} radio button not found`);
    }
  }, shelfCarrierCommandSetting);

  await page.evaluate(delay, 1000);
  await page.click(`div.add.listview-cell.ng-star-inserted > div > a`);

  return { success: true, dropdownResult };
}

async function actionLidarDockingDock(page, action, liderDockingDockSetting) {
  const floorplanDropdownSelector =
    'uc-dropdown[class="col dropdown-container ng-star-inserted"] label.col-form-label + kendo-dropdownlist  .k-dropdown-wrap';
  const dropdownResult = await selectDropdownValue(page, floorplanDropdownSelector, action);

  await page.evaluate(delay, 3000);

  await page.waitForSelector('.form-row .checkbox input[type="radio"]');

  await page.evaluate((value) => {
    const labels = Array.from(document.querySelectorAll(".form-row .checkbox label"));
    const custom1Label = labels.find((label) => label.textContent.trim() === value);
    if (custom1Label) {
      custom1Label.previousElementSibling.click();
    } else {
      throw new Error(`${value} radio button not found`);
    }
  }, liderDockingDockSetting);

  await page.evaluate(delay, 1000);
  await page.click(`div.add.listview-cell.ng-star-inserted > div > a`);

  return { success: true, dropdownResult };
}

async function actionSafetyZoneChange(page, action, safetyZoneSetting) {
  try {
    const floorplanDropdownSelector =
      'uc-dropdown[class="col dropdown-container ng-star-inserted"] label.col-form-label + kendo-dropdownlist  .k-dropdown-wrap';
    const dropdownResult = await selectDropdownValue(page, floorplanDropdownSelector, action);

    await page.evaluate(delay, 3000);

    await page.waitForSelector('.form-row .checkbox input[type="radio"]');

    await page.evaluate((value) => {
      const labels = Array.from(document.querySelectorAll(".form-row .checkbox label"));
      const custom1Label = labels.find((label) => label.textContent.trim() === value);
      if (custom1Label) {
        custom1Label.previousElementSibling.click();
      } else {
        throw new Error(`${value} radio button not found`);
      }
    }, safetyZoneSetting);

    await page.evaluate(delay, 1000);
    await page.click(`div.add.listview-cell.ng-star-inserted > div > a`);

    return { success: true, dropdownResult };
  } catch (error) {
    console.error("Error in actionSafetyZoneChange:", error);
    return { success: false, error: error.message };
  }
}

async function actionSleep(page, action, timeout) {
  try {
    const floorplanDropdownSelector =
      'uc-dropdown[class="col dropdown-container ng-star-inserted"] label.col-form-label + kendo-dropdownlist  .k-dropdown-wrap';
    const dropdownResult = await selectDropdownValue(page, floorplanDropdownSelector, action);

    await page.evaluate(delay, 3000);
    await page.type("uc-txtbox.numeric kendo-numerictextbox input.k-input", timeout);
    await page.evaluate(delay, 1000);
    await page.click(`div.add.listview-cell.ng-star-inserted > div > a`);

    return { success: true, dropdownResult };
  } catch (error) {
    console.error("Error in actionSleep:", error);
    return { success: false, error: error.message };
  }
}

async function actionGoToWaypoint(page, action) {
  try {
    const floorplanDropdownSelector =
      'uc-dropdown[class="col dropdown-container ng-star-inserted"] label.col-form-label + kendo-dropdownlist  .k-dropdown-wrap';
    const dropdownResult = await selectDropdownValue(page, floorplanDropdownSelector, action);

    await page.evaluate(delay, 1000);
    await page.click(`div.add.listview-cell.ng-star-inserted > div > a`);

    return { success: true, dropdownResult };
  } catch (error) {
    console.error("Error in actionGoToWaypoint:", error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  selectDropdownValue,
  addTemplateRows,
  clickTaskTemplateEditButton,
};
