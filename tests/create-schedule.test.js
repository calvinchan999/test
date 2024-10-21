const createTaskSchedule = require("../src/task/create-task-schedule");
const { writeResultToJson } = require("../helper");
const { sessionData } = require("../test-reporting/login-test-result.json");

describe("ARCS Tests", () => {
  const testData = [
    {
      data: {
        templateName: "AUTO-CODE-PATROL-2024-10-18T03:35:39.844Z",
        startDate: "181020240000",
        endDate: "181020242359",
        schedulingSettings: {
          recurrence: "Hourly", // only support (One Time Only, Hourly)
          pattern: "Every",
          minute: "2",
        },
        arcsRobotType: "Patrol", // Delivery, Patrol
      },
    },
  ];

  testData.forEach((testCase, index) => {
    test(`Task Schedule Test #${index}`, async () => {
      try {
        const createTaskScheduleResult = await createTaskSchedule(sessionData, testCase.data);
        await writeResultToJson(`create-task-schedule-result-${index}`, createTaskScheduleResult);
  
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
    },300000)

  })
});
