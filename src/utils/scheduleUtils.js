const { delay } = require("../../helper");

async function clickTaskScheduleEditButton(page, templateCode, scheduleName) {
  // console.log(`clickTaskScheduleEditButton templateCode ${templateCode} scheduleName ${scheduleName}`);
  await page.evaluate(
    (code, name) => {
      const rows = document.querySelectorAll("tbody tr");
      for (const row of rows) {
        const codeCell = row.querySelector("td[class='missionId'] span");
        const nameCell = row.querySelector("td[class='name'] span");

        if (codeCell && nameCell && codeCell.textContent.trim() === code && nameCell.textContent.trim() === name) {
          const editButton = row.querySelector("td.edit.button a span.iconButton.k-i-edit");
          if (editButton) {
            editButton.click();
            return true;
          }
        }
      }
      throw new Error(`Schedule with code ${code} and name ${name} not found`);
    },
    templateCode,
    scheduleName
  );
}

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

async function configureScheduleRecurrence(page, schedulingSettings) {
  const taskSchedulingInfo = {};

  switch (schedulingSettings.recurrence) {
    case "One Time Only":
      break;

    case "Daily":
      break;

    case "Weekly":
      break;

    case "Hourly":
      await configureHourlyRecurrence(page, schedulingSettings, taskSchedulingInfo);
      break;

    default:
      console.log(`Unsupported recurrence type: ${schedulingSettings.recurrence}`);
  }

  return taskSchedulingInfo;
}

async function configureHourlyRecurrence(page, schedulingSettings, taskSchedulingInfo) {
  const patternDropdownSelector = "uc-dropdown.col.dropdown-container.ng-star-inserted > div > kendo-dropdownlist";
  const patternDropdownSelectorResult = await selectDropdownItem(page, patternDropdownSelector, schedulingSettings.pattern);
  taskSchedulingInfo.patternDropdownSelectorResult = patternDropdownSelectorResult;

  const minuteSelector = "div.form-row.hour-minute.ng-star-inserted > uc-txtbox > div > kendo-numerictextbox > span > input";
  await page.type(minuteSelector, schedulingSettings.minute, { delay: 100 });
  taskSchedulingInfo.minute = schedulingSettings.minute;
}

module.exports = {
  clickTaskScheduleEditButton,
  selectDropdownItem,
  configureScheduleRecurrence,
};
