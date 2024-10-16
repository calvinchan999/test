const executeTaskTemplate = require("../src/task/execute-task-template");
const { writeResultToJson } = require("../helper");
const { sessionData } = require('../test-reporting/login-test-result.json');

describe("ARCS Tests", () => {

  test("Execute Task Template Test", async () => {
    try {
      const executeTaskTemplateResult = await executeTaskTemplate(sessionData);
      await writeResultToJson("execute-task-template-result", executeTaskTemplateResult);

      expect(executeTaskTemplateResult.status).toBe("Execute Task Template Pass");
      expect(executeTaskTemplateResult).toHaveProperty("processedRows");
      expect(Array.isArray(executeTaskTemplateResult.processedRows)).toBe(true);
    } catch (error) {
      console.error("Execute Task Template Test error:", error);
      throw error;
    }
  }, 60000);


  // test("Task Schedule Test", async () => {
  //   try {
  //     const testData = {
  //       templateName: "AUTO-CODE-PATROL-2024-10-16T06:59:43.894Z",
  //       startDate: "161020240000",
  //       endDate: "161020242359",
  //       recurrence: "One Time Only" // only support (One Time Only)

  //     };
  //     const createTaskTemplateResult = await createTaskTemplate(sessionData, testData);
  //     // await writeResultToJson("create-task-template-result", createTaskTemplateResult);

  //     expect(createTaskTemplateResult.status).toBe("Create Task Schedule Pass");
  //   } catch (error) {
  //     console.error("Task Template Test error:", error);
  //     throw error;
  //   }
  // }, 300000);


});
