const runLoginTest = require("../src/login/login-test");
const { writeResultToJson } = require("../helper");

describe("ARCS Tests", () => {

  test("Login Test", async () => {
    try {
      const result = await runLoginTest();
      await writeResultToJson("login-test-result", result);

      expect(result.status).toBe("Login Pass");
      expect(result.sessionData).toBeDefined();

    } catch (error) {
      console.error("Login Test error:", error);
      throw error;
    }
  }, 60000);

});
