const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = 'super_secret_key_123';

// РЕГИСТРАЦИЯ
app.post('/api/register', async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Введите email и пароль' });

    const hash = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO users (email, password, role) VALUES (?, ?, ?)`, 
        [email, hash, role || 'manager'], 
        function(err) {
            if (err) return res.status(400).json({ error: 'Email уже существует' });
            res.json({ message: 'Пользователь создан', id: this.lastID });
        }
    );
});

// ЛОГИН
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (!user) return res.status(400).json({ error: 'Пользователь не найден' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ error: 'Неверный пароль' });

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, role: user.role });
    });
});

// ПОЛУЧИТЬ КЛИЕНТОВ
app.get('/api/clients', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Нет токена' });
    
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Неверный токен' });
        
        const query = decoded.role === 'admin' 
            ? `SELECT * FROM clients` 
            : `SELECT * FROM clients WHERE manager_id = ?`;
        const params = decoded.role === 'admin' ? [] : [decoded.id];

        db.all(query, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });
});

// ДОБАВИТЬ КЛИЕНТА
app.post('/api/clients', (req, res) => {
    const { name, phone } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Нет токена' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Неверный токен' });

        db.run(`INSERT INTO clients (name, phone, manager_id) VALUES (?, ?, ?)`,
            [name, phone, decoded.id],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Клиент добавлен', id: this.lastID });
            }
        );
    });
});

app.listen(3000, () => {
    console.log(' Сервер запущен на http://localhost:3000');
});