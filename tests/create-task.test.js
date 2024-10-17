const createTaskTemplate = require("../src/task/create-task-template");
const { writeResultToJson } = require("../helper");
const { sessionData } = require('../test-reporting/login-test-result.json');

describe("ARCS Tests", () => {
  // const { sessionData } = readFileSync(' ../test-reporting/login-test-result.json');
  console.log(sessionData)

  test("Task Template Test", async () => {
    try {
      const testData = {
        robot: "[SIM-ROBOT-5]  Patrol S5",
        templateActions: [
          {
            action: ["5W", "R03"]
          },
          {
            action: ["5W", "Croner"],
          },
          {
            action: ["5W", "R05"],
          },
          {
            action: ["5W", "R07"]
          },
          {
            action: ["5W", "Parking"]
          },
          {
            action: ["5W", "R07"]
          },
          {
            action: ["5W", "R05"]
          },
          {
            action: ["5W", "Croner"]
          },
          {
            action: ["5W", "R03",  "Sleep"],
            duration: "5",
          },
          {
            action: ["5W", "R03",  "Sleep"],
            duration: "150",
          },
        ],
      };
      const createTaskTemplateResult = await createTaskTemplate(sessionData, testData);
      await writeResultToJson("create-task-template-result", createTaskTemplateResult);
      expect(createTaskTemplateResult.status).toBe("Create Task Template Pass");
      expect(createTaskTemplateResult.templateInfo.robot).toBeDefined();
      expect(createTaskTemplateResult.templateInfo.templateActions).toBeDefined();
      expect(createTaskTemplateResult.templateInfo.templateCode).toBeDefined();
      expect(createTaskTemplateResult.templateInfo.templateName).toBeDefined();
      expect(createTaskTemplateResult.templateInfo.robotType).toBeDefined();
      expect(createTaskTemplateResult.templateInfo.dropdownResults).toBeDefined();
      expect(createTaskTemplateResult.templateInfo.dropdownResults[0].success).toBe(true);
      expect(createTaskTemplateResult.templateInfo.templateRowsResults).toBeDefined();

    } catch (error) {
      console.error("Task Template Test error:", error);
      throw error;
    }
  }, 300000);

});
