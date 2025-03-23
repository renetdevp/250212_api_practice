const request = require('supertest');
const mongoose = require('mongoose');

const app = require('./app');

describe('Test USER CRUD', () => {
    test('Delete All Users', async () => {
        const res = await request(app).delete('/users');
        expect(res.statusCode).toBe(201);
    });

    test('Create new User', async () => {
        const res = await request(app).post('/users').send({ userId: 'asdf', hash: 'asdf' });
        expect(res.statusCode).toBe(201);
    });

    test('Create exist User', async () => {
        const res = await request(app).post('/users').send({ userId: 'asdf', hash: 'asdf1' });
        expect(res.statusCode).toBe(409);
    });

    test('Send Wrong User Format', async () => {
        const res = await request(app).post('/users').send({ id: 'asdf', pw: 'asdf' });
        expect(res.statusCode).toBe(400);
    });

    test('Create another User', async () => {
        const res = await request(app).post('/users').send({ userId: 'fdsa', hash: 'fdsa' });
        expect(res.statusCode).toBe(201);
    });

    test('Read All Users', async () => {
        const res = await request(app).get('/users');
        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({
            users: [{
                userId: 'asdf'
            }, {
                userId: 'fdsa'
            }],
        });
    });
});

afterAll(() => {
    mongoose.connection.close();
});