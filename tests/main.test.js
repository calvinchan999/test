const runLoginTest = require("../src/login-test");
const createTaskTemplate = require("../src/task/create-task-template");

describe("ARCS Tests", () => {
  let sessionData;

  test("Login Test", async () => {
    try {
      const result = await runLoginTest();
      expect(result.status).toBe("Login Pass");
      expect(result.sessionData).toBeDefined();
      expect(result.sessionData.accessToken).toBeDefined();
      expect(result.sessionData.refreshToken).toBeDefined();
      expect(result.sessionData.userId).toBeDefined();
      expect(result.sessionData.clientId).toBeDefined();
      expect(result.sessionData.currentUser).toBeDefined();
      expect(result.sessionData.isGuestMode).toBeDefined();
      expect(result.sessionData.arcsDefaultBuilding).toBeDefined();
      expect(result.sessionData.arcsLocationTree).toBeDefined();

      // Store session data for use in other tests
      sessionData = result.sessionData;
      console.log(sessionData);
    } catch (error) {
      console.error("Test error:", error);
      throw error;
    }
  }, 60000);

  test("Task Template Test", async () => {
    try {
      const testData = {
        robot: "[SIM-ROBOT-1]  Sim 1",
        templateActions: [
          {
            action: ["5W", "A", "Sleep", "Automatic"],
            duration: "2",
          },
          {
            action: ["5W", "B", "Sleep", "Automatic"],
            duration: "4",
          },
        ],
      };
      const createTaskTemplateResult = await createTaskTemplate(sessionData, testData);
      expect(createTaskTemplateResult.status).toBe("Create Task Template Pass");
    } catch (error) {
      console.error("Test error:", error);
      throw error;
    }
  }, 60000);
});
