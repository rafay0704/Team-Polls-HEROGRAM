import { pool } from '../db/db.js';
import { publishTallyUpdate } from '../ws/publisher.js';
import { publishNewPoll } from '../ws/publisher.js';

export const createPoll = async (req, res) => {
  const { question, options, expiresAt } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO polls (question, options, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [question, options, expiresAt]
    );

    const createdPoll = {
      ...result.rows[0],
      tally: {} // initialize empty tally
    };

    // Broadcast new poll
    publishNewPoll(createdPoll);

    res.json(createdPoll);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to create poll');
  }
};

export const getAllPolls = async (req, res) => {
  try {
    const polls = await pool.query('SELECT * FROM polls ORDER BY created_at DESC');
    const pollIds = polls.rows.map(p => p.id);

    const tallies = await pool.query(`
      SELECT poll_id, option, COUNT(*) AS count
      FROM votes
      WHERE poll_id = ANY($1::int[])
      GROUP BY poll_id, option
    `, [pollIds]);

    const tallyMap = {};
    tallies.rows.forEach(({ poll_id, option, count }) => {
      if (!tallyMap[poll_id]) tallyMap[poll_id] = {};
      tallyMap[poll_id][option] = parseInt(count);
    });

    const pollsWithTallies = polls.rows.map(p => ({
      ...p,
      tally: tallyMap[p.id] || {}
    }));

    res.json(pollsWithTallies);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch polls');
  }
};

export const votePoll = async (req, res) => {
  const { option } = req.body;
  const pollId = req.params.id;
  const userId = req.user.userId; // Get userId from decoded token

  try {
    const poll = await pool.query('SELECT * FROM polls WHERE id = $1', [pollId]);
    if (!poll.rows.length) return res.status(404).send('Poll not found');

    const expired = new Date(poll.rows[0].expires_at) < new Date();
    if (expired) return res.status(403).send('Poll expired');

    // Insert vote for the user if not already voted
    await pool.query(
      'INSERT INTO votes (poll_id, user_id, option) VALUES ($1, $2, $3) ON CONFLICT (poll_id, user_id) DO NOTHING',
      [pollId, userId, option]
    );

  const tally = await pool.query(
  'SELECT option, COUNT(*) as count FROM votes WHERE poll_id = $1 GROUP BY option',
  [pollId]
);

const tallyMap = {};
tally.rows.forEach(({ option, count }) => {
  tallyMap[option] = parseInt(count);
});

publishTallyUpdate(pollId, tallyMap);



    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Vote failed');
  }
};


export const getPoll = async (req, res) => {
  const pollId = req.params.id;
  const poll = await pool.query('SELECT * FROM polls WHERE id = $1', [pollId]);
  const tally = await pool.query(
    'SELECT option, COUNT(*) as count FROM votes WHERE poll_id = $1 GROUP BY option',
    [pollId]
  );
const tallyMap = {};
tally.rows.forEach(({ option, count }) => {
  tallyMap[option] = parseInt(count);
});

res.json({ ...poll.rows[0], tally: tallyMap });
};
