const request = require('supertest');
const app = require('../app');

describe('Start to testing the server', () => {
    test('GET / must return the hello world string', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe('hello world!');
    });

    test('GET /static/favicon.ico must return the favicon file', async () => {
        const res = await request(app).get('/static/favicon.ico');
        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toBe('image/x-icon');
    });
});
