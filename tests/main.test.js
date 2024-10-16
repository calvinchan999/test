// const runLoginTest = require("../src/login/login-test");
// const createTaskTemplate = require("../src/task/create-task-template");
// const executeTaskTemplate = require("../src/task/execute-task-template");
// const fs = require("fs").promises;
// const path = require("path");

describe("ARCS Tests", () => {
  // let sessionData;

  // const writeResultToJson = async (filename, data) => {
  //   try {
  //     const dirPath = path.join(__dirname, "..", "test-reporting");
  //     const filePath = path.join(dirPath, `${filename}.json`);

  //     // Create the directory if it doesn't exist
  //     await fs.mkdir(dirPath, { recursive: true });

  //     // Write the file
  //     await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  //     console.log(`Results written to ${filePath}`);
  //   } catch (error) {
  //     console.error(`Error writing results to JSON: ${error.message}`);
  //     throw error; // Re-throw the error to fail the test if writing fails
  //   }
  // };

  // test("Login Test", async () => {
  //   try {
  //     const result = await runLoginTest();
  //     await writeResultToJson("login-test-result", result);

  //     expect(result.status).toBe("Login Pass");
  //     expect(result.sessionData).toBeDefined();
  //     expect(result.sessionData.accessToken).toBeDefined();
  //     expect(result.sessionData.refreshToken).toBeDefined();
  //     expect(result.sessionData.userId).toBeDefined();
  //     expect(result.sessionData.clientId).toBeDefined();
  //     expect(result.sessionData.currentUser).toBeDefined();
  //     expect(result.sessionData.isGuestMode).toBeDefined();
  //     expect(result.sessionData.arcsDefaultBuilding).toBeDefined();
  //     expect(result.sessionData.arcsLocationTree).toBeDefined();

  //     sessionData = result.sessionData;
  //   } catch (error) {
  //     console.error("Login Test error:", error);
  //     throw error;
  //   }
  // }, 60000);

  // test("Task Template Test", async () => {
  //   try {
  //     const testData = {
  //       robot: "[SIM-ROBOT-5]  Patrol S5",
  //       templateActions: [
  //         {
  //           action: ["5W", "R03"]
  //         },
  //         {
  //           action: ["5W", "Croner"],
  //         },
  //         {
  //           action: ["5W", "R05"],
  //         },
  //         {
  //           action: ["5W", "R07"]
  //         },
  //         {
  //           action: ["5W", "Parking"]
  //         },
  //         {
  //           action: ["5W", "R07"]
  //         },
  //         {
  //           action: ["5W", "R05"]
  //         },
  //         {
  //           action: ["5W", "Croner"]
  //         },
  //         {
  //           action: ["5W", "R03",  "Sleep"],
  //           duration: "5",
  //         },
  //         {
  //           action: ["5W", "R03",  "Sleep"],
  //           duration: "150",
  //         },
  //       ],
  //     };
  //     const createTaskTemplateResult = await createTaskTemplate(sessionData, testData);
  //     await writeResultToJson("create-task-template-result", createTaskTemplateResult);

  //     expect(createTaskTemplateResult.status).toBe("Create Task Template Pass");
  //   } catch (error) {
  //     console.error("Task Template Test error:", error);
  //     throw error;
  //   }
  // }, 300000);

  // test("Execute Task Template Test", async () => {
  //   try {
  //     const executeTaskTemplateResult = await executeTaskTemplate(sessionData);
  //     await writeResultToJson("execute-task-template-result", executeTaskTemplateResult);

  //     expect(executeTaskTemplateResult.status).toBe("Execute Task Template Pass");
  //     expect(executeTaskTemplateResult).toHaveProperty("processedRows");
  //     expect(Array.isArray(executeTaskTemplateResult.processedRows)).toBe(true);
  //   } catch (error) {
  //     console.error("Execute Task Template Test error:", error);
  //     throw error;
  //   }
  // }, 60000);


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
