require("dotenv").config();
const { navigateToTemplate, addTemplateRows, clickEditButton } = require("../utils/taskUtils");
const { setupBrowser } = require("../utils/browserUtils");
const { delay } = require("../../helper");

async function updateTaskTemplate(session, { arcsRobotType, templateActions, templateCode }) {
  let browser;
  try {
    const { browser: br, page } = await setupBrowser(session);
    browser = br;

    const robotType = await navigateToTemplate(page, arcsRobotType);

    await clickEditButton(page, templateCode);
    await page.evaluate(delay, 1000);

    await page.waitForSelector("input.k-input", { visible: true, timeout: 10000 });
    const now = new Date();
    const inputFields = await page.$$("input.k-input");

    let currentTemplateName = await inputFields[1].evaluate((el) => el.value);

    if(currentTemplateName.includes('[UPDATED_AT')) {
      await inputFields[1].evaluate((input) => (input.value = ""));
      await inputFields[1].type(`${currentTemplateName.substring(0, currentTemplateName.indexOf("[UPDATED_AT"))} [UPDATED_AT_${now.toISOString()}]`);
    }else {
      await inputFields[1].type(` [UPDATED_AT_${now.toISOString()}]`);
    }

    await page.evaluate(delay, 1000);

    const templateRowsResults = await addTemplateRows(page, templateActions);

    await page.evaluate(delay, 3000);
    await page.waitForSelector("div > div > app-cm-task-job > div > div > div > button:nth-child(2)", { visible: true });
    await page.click("div > div > app-cm-task-job > div > div > div > button:nth-child(2)");
    await page.evaluate(delay, 3000);

    return {
      status: "Update Task Template Pass",
      templateInfo: {
        templateActions,
        templateCode,
        robotType,
        templateRowsResults,
      },
    };
  } catch (error) {
    console.error("Update Task template failed:", error.message);
    throw new Error("Update Task template failed");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = updateTaskTemplate;
