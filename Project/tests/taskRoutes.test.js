const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Task = require('../models/taskModel');

let token;

beforeAll(async () => {
  await request(app)
    .post('/api/users/register')
    .send({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
    });
  
  const res = await request(app)
    .post('/api/users/login')
    .send({
      email: 'testuser@example.com',
      password: 'password123',
    });

  token = res.body.token;
});

afterAll(async () => {
  await User.deleteMany({});
  await Task.deleteMany({});
  mongoose.connection.close();
});

describe('Task Routes', () => {
  it('should create a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        description: 'This is a test task',
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toEqual('Test Task');
  });

  it('should get all tasks for the user', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should update a task', async () => {
    const task = await Task.findOne({ title: 'Test Task' });
    
    const res = await request(app)
      .put(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'completed',
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('completed');
  });

  it('should delete a task', async () => {
    const task = await Task.findOne({ title: 'Test Task' });
    
    const res = await request(app)
      .delete(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Task removed');
  });
});
