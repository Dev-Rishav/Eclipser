require("dotenv").config();
const mongoose = require("mongoose");
const { codeQueue } = require("../utils/queue");
const Contest = require("../models/Contest");
const { exec } = require("child_process");
const fs = require("fs");

console.log("🚀 Worker starting...");

mongoose
  // .connect(process.env.MONGO_URI)
  .connect("mongodb://localhost:27017/contest-service")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

codeQueue.process(async (job) => {
  console.log("📥 Received job:", job.id, job.data);

  try {
    const { contestId, userId, code, language } = job.data;
    const extension = language === "python" ? "py" : "js";
    const filename = `/tmp/${job.id}.${extension}`;

    if (!mongoose.Types.ObjectId.isValid(contestId)) {
      return res.status(400).json({ error: "Invalid contest ID" });
    }

    fs.writeFileSync(filename, code);

    const command = `docker run --rm -v ${filename}:/code.${extension} python:3 python /code.py`;

    console.log("🔧 Running command:", command);

    return new Promise((resolve, reject) => {
      exec(command, async (err, stdout, stderr) => {
        console.log("📤 STDOUT:", stdout || "[none]");
        console.log("❌ STDERR:", stderr || "[none]");
        console.log("⚠️  Error:", err || "[no error]");

        const result = err
          ? { passed: false, error: stderr }
          : { passed: true, output: stdout };

        try {
          const updated = await Contest.findByIdAndUpdate(
            contestId,
            {
              $push: {
                submissions: {
                  userId,
                  code,
                  language,
                  submittedAt: new Date(),
                  result,
                },
              },
            },
            { new: true } // Optional: returns updated document
          );

          if (!updated) {
            console.error("❗ Contest not found or update failed:", contestId);
          } else {
            console.log("✅ Submission saved to contest:", updated._id);
          }
        } catch (err) {
          console.error("❌ MongoDB update error:", err);
        }

        resolve(result);
      });
    });
  } catch (err) {
    console.error("❌ Error inside job processor:", err);
  }
});
