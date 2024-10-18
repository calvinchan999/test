const runLoginTest = require("../src/login/login-test");
const { writeResultToJson } = require("../helper");

describe("ARCS Tests", () => {

  test("Login Test", async () => {
    try {
      const result = await runLoginTest();
      await writeResultToJson("login-test-result", result);

      expect(result.status).toBe("Login Pass");
      expect(result.sessionData).toBeDefined();
      // expect(result.sessionData).toBeDefined();
      // expect(result.sessionData.accessToken).toBeDefined();
      // expect(result.sessionData.refreshToken).toBeDefined();
      // expect(result.sessionData.userId).toBeDefined();
      // expect(result.sessionData.clientId).toBeDefined();
      // expect(result.sessionData.currentUser).toBeDefined();
      // expect(result.sessionData.isGuestMode).toBeDefined();
      // expect(result.sessionData.arcsDefaultBuilding).toBeDefined();
      // expect(result.sessionData.arcsLocationTree).toBeDefined();

    } catch (error) {
      console.error("Login Test error:", error);
      throw error;
    }
  }, 60000);

});
