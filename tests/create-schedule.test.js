const createTaskSchedule = require("../src/task/create-task-schedule");
const { writeResultToJson } = require("../helper");
const { sessionData } = require("../test-reporting/login-test-result.json");

describe("ARCS Tests", () => {
  test("Task Schedule Test", async () => {
    try {
      const testData = {
        templateName: "AUTO-CODE-PATROL-2024-10-17T07:59:29.317Z",
        startDate: "161020240000",
        endDate: "161020242359",
        schedulingSettings: {
          recurrence: "Hourly", // only support (One Time Only, Hourly)
          pattern: "Every",
          minute: "5"
        },
        arcsRobotType: 'Patrol', // Delivery Patrol
      };
  
      const createTaskScheduleResult = await createTaskSchedule(sessionData, testData);
      await writeResultToJson("create-task-schedule-result", createTaskScheduleResult);

      expect(createTaskScheduleResult.status).toBe("Create Task Schedule Pass");
      expect(createTaskScheduleResult.taskSchedulingInfo.scheduleName).toBeDefined();
      expect(createTaskScheduleResult.taskSchedulingInfo.startDate).toBeDefined();
      expect(createTaskScheduleResult.taskSchedulingInfo.endDate).toBeDefined();
      expect(createTaskScheduleResult.taskSchedulingInfo.templateDropdownSelectorResult).toBeDefined();
      expect(createTaskScheduleResult.taskSchedulingInfo.templateDropdownSelectorResult.success).toBe(true);
      expect(createTaskScheduleResult.taskSchedulingInfo.recurrenceDropdownSelectorResult).toBeDefined();
      expect(createTaskScheduleResult.taskSchedulingInfo.recurrenceDropdownSelectorResult.success).toBe(true);
    } catch (error) {
      console.error("Task Template Test error:", error);
      throw error;
    }
  }, 300000);
});
