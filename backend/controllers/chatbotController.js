const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

exports.processMessage = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const { stdout } = await execPromise(
      `python C:/Users/VMT/Desktop/160store/backend/services/nlpService.py "${message.replace(/"/g, '\\"')}"`,
      {
        cwd: "C:/Users/VMT/Desktop/160store/backend",
        env: {
          ...process.env,
          PYTHONIOENCODING: "utf-8",
          DB_SERVER: "localhost",
          DB_DATABASE: "160storeDB",
          DB_USER: "sa",
          DB_PASSWORD: "Trung1999!",
        },
      }
    );
    const reply = stdout.trim();
    res.json({ reply });
  } catch (error) {
    console.error(
      "Error processing message:",
      error.message,
      error.stderr || error
    );
    res.status(500).json({ reply: "Có lỗi xảy ra, vui lòng thử lại!" });
  }
};
