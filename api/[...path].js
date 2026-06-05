let handleRequest;

module.exports = async function vercelHandler(req, res) {
  try {
    if (!handleRequest) {
      handleRequest = require("../server");
    }

    await handleRequest(req, res);
  } catch (error) {
    console.error("Serverless handler failed", error);

    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "Serverless handler failed", detail: error.message });
    }
  }
};
