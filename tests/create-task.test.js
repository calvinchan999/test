const createTaskTemplate = require("../src/task/create-task-template");
const { writeResultToJson } = require("../helper");
const { sessionData } = require("../test-reporting/login-test-result.json");

describe("ARCS Tests", () => {
  // Dev
  const testData = [
    {
      data: {
        arcsRobotType: "Patrol", // Delivery, Patrol
        robot: "Patrol S5",
        templateActions: [
          {
            action: ["5W", "R03", null, "Automatic"],
          },
          {
            action: ["5W", "Parking", "Lidar Docking Dock", "Path Follow"],
            liderDockingDockSetting: "Shelf Carrier",
          },
          {
            action: ["5W", "Parking", "Lidar Docking Dock", "Path Follow"],
            liderDockingDockSetting: "Shelf Carrier",
          },
          {
            action: ["5W", "R05", "Safety Zone Change", "Path Follow"],
            safetyZoneSetting: "Minimum",
          },
          {
            action: ["5W", "R03", "Sleep"],
            duration: "1500",
          },
          {
            action: ["5W", "R03"],
          },
          {
            action: ["5W", "R05", "Safety Zone Change", "Path Follow"],
            safetyZoneSetting: "Custom1",
          },
          {
            action: ["5W", "R05", "Safety Zone Change", "Path Follow"],
            safetyZoneSetting: "Normal",
          },
        ],
      },
    },
    {
      data: {
        arcsRobotType: "Patrol", // Delivery, Patrol
        robot: "Patrol S4",
        templateActions: [
          {
            action: ["5W", "R03", null, "Automatic"],
          }
        ],
      },
    },
  ];

  // Jcrc
  // const testData = [
  //   {
  //     data: {
  //       arcsRobotType: "Delivery",
  //       robot: "E500",
  //       templateActions: [
  //         {
  //           action: ["tw_blockD_4th", "BLKD4F Center", null, "Automatic"],
  //         },
  //         {
  //           action: ["tw_blockD_4th", "BLKD4F D1", "Lidar Docking Dock", "Path Follow"],
  //           liderDockingDockSetting: "Shelf Carrier",
  //         },
  //         {
  //           action: ["tw_blockD_4th", "BLKD4F D1", "Sleep", "Path Follow"],
  //           duration: "1000",
  //         },
  //         {
  //           action: ["tw_blockD_4th", "BLKD4F D1", "Shelf Carrier Command", "Path Follow"],
  //           shelfCarrierCommandSetting: "Extend",
  //         },
  //         {
  //           action: ["tw_blockD_4th", "BLKD4F Center", null, "Path Follow"],
  //         },
  //         {
  //           action: ["tw_blockD_4t", "BLKD4F D3", "Safety Zone Change", "Path Follow"],
  //           safetyZoneSetting: "Lift",
  //         },
  //         {
  //           action: ["tw_blockD_4t", "BLKD4F CA3", "Shelf Carrier Command", "Path Follow"],
  //         },
  //         {
  //           action: ["tw_blockD_4t", "BLKD4F CA3", "Sleep", "Path Follow"],
  //           duration: "1000",
  //         },
  //         {
  //           action: ["tw_blockD_4t", "BLKD4F CA3", "Lidar Docking Undock", "Path Follow"],
  //         },
  //         {
  //           action: ["tw_blockD_4t", "BLKD4F CA3", "Safety Zone Change", "Path Follow"],
  //           safetyZoneSetting: "Normal",
  //         },
  //         {
  //           action: ["tw_blockD_4t", "BLKD4F Center", null, "Automatic"],
  //         },
  //         {
  //           action: ["tw_blockD_4t", "BLKD4F D3", "Lidar Docking Dock", "Path Follow"],
  //           liderDockingDockSetting: "Shelf Carrier",
  //         },
  //         {
  //           action: ["tw_blockD_4t", "BLKD4F D3", "Sleep", "Path Follow"],
  //           duration: "1000",
  //         },
  //       ],
  //     },
  //   },
  // ];

  testData.forEach((testCase, index) => {
    test(`Task Template Test #${index}`, async () => {
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
      } catch (error) {
        console.error(`Task Template Test #${index} error:`, error);
        throw error;
      }
    }, 300000);
  });
});
