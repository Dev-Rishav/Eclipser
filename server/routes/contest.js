const router = require('express').Router();
const knex = require('../db/postgres');

router.post('/create', async (req, res) => {
  const { title, duration, problems } = req.body;

  const contest = await knex.transaction(async trx => {
    const [contestId] = await trx('contests')
      .insert({ title, duration })
      .returning('id');

    for (const problem of problems) {
      const [problemId] = await trx('problems')
        .insert({
          contest_id: contestId,
          title: problem.title,
          difficulty: problem.difficulty
        })
        .returning('id');

      await trx('test_cases').insert(
        problem.testCases.map(tc => ({
          problem_id: problemId,
          input: tc.input,
          expected_output: tc.output,
          is_hidden: tc.hidden
        }))
      );
    }
    
    return contestId;
  });

  res.status(201).json({ contestId: contest[0] });
});

router.post('/submit', async (req, res) => {
    const { contestId, problemId, code, language } = req.body;
    
    const submission = new Submission({
      user: req.user.id,
      contestId,
      problemId,
      code,
      language
    });
    
    await submission.save();
    await addToQueue(submission.toObject()); // Add to RabbitMQ queue
    
    res.json({ submissionId: submission._id });
  });