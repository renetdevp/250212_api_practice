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

describe('Test Authentication', () => {
    test('Login to \"asdf\" user', async () => {
        const res = await request(app).post('/authentications').send({ userId: 'asdf', hash: 'asdf' });
        expect(res.statusCode).toBe(201);
    });

    test('Login to \"asdf\" user with wrong password', async () => {
        const res = await request(app).post('/authentications').send({ userId: 'asdf', hash: 'wrongPassword' });
        expect(res.statusCode).toBe(401);
    });

    test('Login to non-exist user', async () => {
        const res = await request(app).post('/authentications').send({ userId: 'john doe', hash: 'password' });
        expect(res.statusCode).toBe(404);
    });
});

afterAll(() => {
    mongoose.connection.close();
});