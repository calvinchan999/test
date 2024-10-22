const createTaskTemplate = require("../src/task/create-task-template");
const { writeResultToJson } = require("../helper");
const { sessionData } = require("../test-reporting/login-test-result.json");

describe("ARCS Tests", () => {

  const testData = [
    {
      data: {
        arcsRobotType: "Patrol", // Delivery, Patrol
        robot: "Patrol S1",
        templateActions: [ // Lidar Docking Dock, Lidar Docking Undock, Sleep, Shelf Carrier Command, Safety Zone Change
          {
            action: ["5W", "R03"],
          }
        ],
      },
    },
  ];


  testData.forEach((testCase, index) => {
    test(`Create Task Template Test #${index}`, async () => {
      try {
        const createTaskTemplateResult = await createTaskTemplate(sessionData, testCase.data);
        await writeResultToJson(`create-task-template-result-${index}`, createTaskTemplateResult);

        expect(createTaskTemplateResult.status).toBe("Create Task Template Pass");
        expect(createTaskTemplateResult.templateInfo.robot).toBeDefined();
        expect(createTaskTemplateResult.templateInfo.templateActions).toBeDefined();
        expect(createTaskTemplateResult.templateInfo.templateCode).toBeDefined();
        expect(createTaskTemplateResult.templateInfo.templateName).toBeDefined();
        expect(createTaskTemplateResult.templateInfo.robotType).toBeDefined();
        expect(createTaskTemplateResult.templateInfo.dropdownResults).toBeDefined();
        expect(createTaskTemplateResult.templateInfo.dropdownResults[0].success).toBe(true);
        expect(createTaskTemplateResult.templateInfo.templateRowsResults).toBeDefined();
        // expect(createTaskTemplateResult.templateInfo.apiResponse).toBeDefined();
      } catch (error) {
        console.error(`Create Task Template Test #${index} error:`, error);
        throw error;
      }
    }, 300000);
  });
});
