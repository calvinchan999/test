require("dotenv").config();
const { selectDropdownValue, addTemplateRows } = require("../utils/taskUtils");
const { setupBrowser, navigateToTemplate, waitForApiResponse } = require("../utils/browserUtils");
const { delay } = require("../../helper");

async function createTaskTemplate(session, { robot, arcsRobotType, templateActions }) {
  let browser;
  try {
    const { browser: br, page } = await setupBrowser(session);
    browser = br;

    const robotType = await navigateToTemplate(page, arcsRobotType);

    const buttonSelector = 'button.k-button.k-button-icontext[kendobutton][icon="plus"]:has(span.k-icon.k-i-plus)';
    await page.waitForSelector(buttonSelector, { visible: true, timeout: 10000 });
    await page.click(buttonSelector);
    await page.waitForSelector("input.k-input", { visible: true, timeout: 10000 });
    const inputFields = await page.$$("input.k-input");
    const now = new Date();
    const templateCode = `AUTO-CODE-${robotType.toUpperCase()}-${now.toISOString()}`;
    const templateName = `AUTO-NAME-${robotType.toUpperCase()}-${now.toISOString()}`;
    await inputFields[0].type(templateCode);
    await inputFields[1].type(templateName);

    await page.evaluate(delay, 1000);

    const robotDropdownSelector = 'uc-dropdown[lab="Robot"] kendo-dropdownlist .k-dropdown-wrap';
    const dropdownResults = await selectDropdownValue(page, robotDropdownSelector, [robot]);

    await page.evaluate(delay, 1000);

    const templateRowsResults = await addTemplateRows(page, templateActions);

    await page.evaluate(delay, 3000);
    await page.waitForSelector("div > div > app-cm-task-job > div > div > div > button:nth-child(2)", { visible: true });
    await page.click("div > div > app-cm-task-job > div > div > div > button:nth-child(2)");

    await waitForApiResponse(page, "/api/mission/v1", 15000);

    await page.evaluate(delay, 3000);

    return {
      status: "Create Task Template Pass",
      templateInfo: {
        robot,
        templateActions,
        templateCode,
        templateName,
        robotType,
        dropdownResults,
        templateRowsResults,
      },
    };
  } catch (error) {
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = createTaskTemplate;
