require('dotenv').config();
const mongoose = require('mongoose');
const { codeQueue } = require('../utils/queue');
const Contest = require('../models/Contest');
const { exec } = require('child_process');
const fs = require('fs');

mongoose.connect(process.env.MONGO_URI);

codeQueue.process(async (job) => {
  const { contestId, userId, code, language } = job.data;

  const filename = `/tmp/${job.id}.${language === 'python' ? 'py' : 'js'}`;
  fs.writeFileSync(filename, code);

  const command = `docker run --rm -v ${filename}:/code.${language} python:3 python /code.py`;

  return new Promise((resolve, reject) => {
    exec(command, async (err, stdout, stderr) => {
      const result = err ? { passed: false, error: stderr } : { passed: true, output: stdout };
      await Contest.findByIdAndUpdate(contestId, {
        $push: {
          submissions: {
            userId,
            code,
            language,
            submittedAt: new Date(),
            result,
          },
        },
      });
      resolve(result);
    });
  });
});
