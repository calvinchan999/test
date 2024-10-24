async function getTask(page, apiUrl) {
  const result = await page.evaluate(async (apiUrl) => {
    try {
      const response = await fetch(`${apiUrl}/api/task/v1/page/patrol?page=1&pageSize=100`, {
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const records = await response.json();

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers),
        data: records,
      };
    } catch (error) {
      return { error: error.message };
    }
  }, apiUrl);
  return result;
}

async function cancelTask(page, apiUrl, taskId) {
  await page.evaluate(
    async (apiUrl, taskId) => {
      await fetch(`${apiUrl}/api/task/v1/cancel?taskId=${taskId}&reasonCode=BAD_REQUEST&reasonMessage=`, {
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        method: "DELETE",
      });
    },
    apiUrl,
    taskId
  );
}

module.exports = {
  getTask,
  cancelTask,
};
