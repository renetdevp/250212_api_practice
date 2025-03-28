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

    describe('USER services which userAuth needed', () => {
        let token = '';

        beforeAll(async () => {
            // Login to fdsa user
            const res = await request(app).post('/authentications').send({ userId: 'fdsa', hash: 'fdsa' });
            token = res.body.token;
        });

        test('Update other user', async () => {
            const res = await request(app).put('/users/asdf').send({ userId: 'notAsdf' }).set('Authorization', token);
            expect(res.statusCode).toBe(403);
        });

        test('Delete other user', async () => {
            const res = await request(app).delete('/users/asdf').set('Authorization', token);
            expect(res.statusCode).toBe(403);
        });

        test('Update self', async () => {
            const res = await request(app).put('/users/fdsa').send({ hash: 'notFdsa' }).set('Authorization', token);
            expect(res.statusCode).toBe(201);
        });

        test('Login after update', async () => {
            const res = await request(app).post('/authentications').send({ userId: 'fdsa', hash: 'notFdsa' });
            expect(res.statusCode).toBe(201);
        });

        test('Delete self', async () => {
            const res = await request(app).delete('/users/fdsa').set('Authorization', token);
            expect(res.statusCode).toBe(201);
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

describe('Test POST CRUD', () => {
    let token = '';

    beforeAll(async () => {
        // get \"asdf\" user's token
        const res = await request(app).post('/authentications').send({ userId: 'asdf', hash: 'asdf' });
        token = res.body.token;
    });

    test('Delete All Posts', async () => {
        const res = await request(app).delete('/posts');
        expect(res.statusCode).toBe(201);
    });

    test('Create new Post', async () => {
        const res = await request(app).post('/posts').send({ title: 'title1', content: 'content1' }).set('Authorization', token);
        expect(res.statusCode).toBe(201);
    });

    test('Send Wrong Post Format', async () => {
        const res = await request(app).post('/posts').send({ title: 'title2', body: 'content2' }).set('Authorization', token);
        expect(res.statusCode).toBe(400);
    });

    test('Create another Post', async () => {
        const res = await request(app).post('/posts').send({ title: 'title2', content: 'content2' }).set('Authorization', token);
        expect(res.statusCode).toBe(201);
    });

    test('Read All Posts', async () => {
        const res = await request(app).get('/posts');
        expect(res.statusCode).toBe(200);
        // 받아온 posts에서 _id를 제거하고 title, content, author 만을 test
        res.body.posts.map(v => {
            delete v._id;
        });
        expect(res.body).toStrictEqual({
            posts: [{
                title: 'title1',
                content: 'content1',
                author: 'asdf',
            }, {
                title: 'title2',
                content: 'content2',
                author: 'asdf',
            }],
        });
    });
});

afterAll(() => {
    mongoose.connection.close();
});