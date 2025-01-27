const executeTaskTemplate = require("../src/task/execute-task-template");
const { writeResultToJson } = require("../helper");
const { sessionData } = require('../test-reporting/login-test-result.json');

describe("ARCS Tests", () => {

  test("Execute Task Template Test", async () => {
    try {
      const testData = { 
        arcsRobotType: 'Patrol' // Delivery, Patrol 
      };

      const executeTaskTemplateResult = await executeTaskTemplate(sessionData, testData);
      await writeResultToJson("execute-task-template-result", executeTaskTemplateResult);

      expect(executeTaskTemplateResult.status).toBe("Execute Task Template Pass");
      expect(executeTaskTemplateResult.robotType).toBeDefined();
      expect(executeTaskTemplateResult).toHaveProperty("processedRows");
      expect(Array.isArray(executeTaskTemplateResult.processedRows)).toBe(true);
    } catch (error) {
      console.error("Execute Task Template Test error:", error);
      throw error;
    }
  }, 60000);
});
