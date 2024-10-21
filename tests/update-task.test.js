const updateTaskTemplate = require("../src/task/update-task-template");
const { writeResultToJson } = require("../helper");
const { sessionData } = require("../test-reporting/login-test-result.json");

describe("ARCS Tests", () => {
  const testData = [
    {
      data: {
        arcsRobotType: "Patrol",
        templateCode: "AUTO-CODE-PATROL-2024-10-21T02:27:13.498Z",
        templateActions: [
          {
            action: ["5W", "R03"],
          }
        ],
      },
    }
  ];

  testData.forEach((testCase, index) => {
    test(`Edit Task Template Test #${index}`, async () => {
      try {
        const updateTaskTemplateResult = await updateTaskTemplate(sessionData, testCase.data);
        await writeResultToJson(`update-task-template-result-${index}`, updateTaskTemplateResult);
        
        expect(updateTaskTemplateResult.status).toBe("Update Task Template Pass");
        expect(updateTaskTemplateResult.templateInfo.templateActions).toBeDefined();
        expect(updateTaskTemplateResult.templateInfo.templateCode).toBeDefined();
        expect(updateTaskTemplateResult.templateInfo.robotType).toBeDefined();
        expect(updateTaskTemplateResult.templateInfo.templateRowsResults).toBeDefined();
      } catch (error) {
        console.error(`Task Template Test #${index} error:`, error);
        throw error;
      }
    }, 300000);
  });
});
