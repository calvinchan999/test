const createTaskSchedule = require("../src/task/create-task-schedule");
const { writeResultToJson } = require("../helper");
const { sessionData } = require('../test-reporting/login-test-result.json');

describe("ARCS Tests", () => {

  test("Task Schedule Test", async () => {
    try {
      const testData = {
        templateName: "AUTO-CODE-PATROL-2024-10-16T06:59:43.894Z",
        startDate: "161020240000",
        endDate: "161020242359",
        recurrence: "One Time Only" // only support (One Time Only)

      };
      const createTaskTemplateResult = await createTaskTemplate(sessionData, testData);
      // await writeResultToJson("create-task-template-result", createTaskTemplateResult);

      expect(createTaskTemplateResult.status).toBe("Create Task Schedule Pass");
    } catch (error) {
      console.error("Task Template Test error:", error);
      throw error;
    }
  }, 300000);


});
