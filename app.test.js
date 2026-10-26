const request = require('supertest');
const express = require('express');
const app = express();
app.use(express.json());

// Тестовый роут для логина (имитация)
app.post('/api/login', (req, res) => {
    if (req.body.email === 'test@test.ru' && req.body.password === '123') {
        return res.status(200).json({ token: 'fake-jwt-token' });
    }
    return res.status(400).json({ error: 'Неверный пароль' });
});

describe('Тестирование API CRM', () => {
    test('Проверка математики (заглушка)', () => {
        expect(2 + 2).toBe(4);
    });

    test('POST /api/login - успешный вход', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ email: 'test@test.ru', password: '123' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    test('POST /api/login - неверный пароль', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ email: 'test@test.ru', password: 'wrong' });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Неверный пароль');
    });
});