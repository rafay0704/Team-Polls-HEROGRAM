import request from 'supertest';
import app from '../../index'; // Make sure your app instance is exported from index.js

describe('Auth Routes', () => {
  it('should generate a JWT token on /auth/anon', async () => {
    const res = await request(app).post('/auth/anon');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});

describe('Poll Routes', () => {
  let token;

  beforeAll(async () => {
    // Get JWT token from /auth/anon
    const res = await request(app).post('/auth/anon');
    token = res.body.token;
  });

  it('should create a poll', async () => {
    const res = await request(app)
      .post('/poll')
      .set('Authorization', `Bearer ${token}`)
      .send({
        question: 'What is your favorite color?',
        options: ['Red', 'Blue', 'Green'],
        expiresAt: '2025-12-31T23:59:59Z'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pollId');
  });

  it('should allow voting for a poll', async () => {
    const pollId = 1; // Use the ID from the created poll

    const res = await request(app)
      .post(`/poll/${pollId}/vote`)
      .set('Authorization', `Bearer ${token}`)
      .send({ option: 'Red' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('should get poll details', async () => {
    const pollId = 1; // Use the ID from the created poll

    const res = await request(app).get(`/poll/${pollId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('question');
    expect(res.body).toHaveProperty('options');
  });
});
