const updateTaskSchedule = require("../src/task/update-task-schedule");
const { writeResultToJson } = require("../helper");
const { sessionData } = require("../test-reporting/login-test-result.json");

describe("ARCS Tests", () => {
  const testData = [
    {
      data: {
        templateCode: "AUTO-CODE-PATROL-2024-10-18T03:35:39.844Z",
        scheduleName: '[Schedule] AUTO-CODE-PATROL-2024-10-18T03:35:39.844Z', // [UPDATED_AT_2024-10-22T03:20:04.410Z]
        startDate: "181020240000",
        endDate: "111120992359",
        schedulingSettings: {
          recurrence: "Hourly", // only support (One Time Only, Hourly)
          pattern: "Every",
          minute: "4",
        },
        arcsRobotType: "Patrol", // Delivery, Patrol
      },
    },
  ];

  testData.forEach((testCase, index) => {
    test(`Edit Task Schedule Test #${index}`, async () => {
      try {
        const updateTaskScheduleResult = await updateTaskSchedule(sessionData, testCase.data);
        await writeResultToJson(`create-task-schedule-result-${index}`, updateTaskScheduleResult);
  
        expect(updateTaskScheduleResult.status).toBe("Update Task Schedule Pass");
        // expect(updateTaskScheduleResult.taskSchedulingInfo.scheduleName).toBeDefined();
        // expect(updateTaskScheduleResult.taskSchedulingInfo.startDate).toBeDefined();
        // expect(updateTaskScheduleResult.taskSchedulingInfo.endDate).toBeDefined();
        // expect(updateTaskScheduleResult.taskSchedulingInfo.templateDropdownSelectorResult).toBeDefined();
        // expect(updateTaskScheduleResult.taskSchedulingInfo.templateDropdownSelectorResult.success).toBe(true);
        // expect(updateTaskScheduleResult.taskSchedulingInfo.recurrenceDropdownSelectorResult).toBeDefined();
        // expect(updateTaskScheduleResult.taskSchedulingInfo.recurrenceDropdownSelectorResult.success).toBe(true);
      } catch (error) {
        console.error(`Edit Task Template Test #${index} error:`, error);
        throw error;
      }
    }, 300000);
  });
});
