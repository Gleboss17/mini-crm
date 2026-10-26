const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    // Таблица пользователей
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'manager'
    )`);

    // Таблица клиентов
    db.run(`CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT,
        manager_id INTEGER,
        FOREIGN KEY(manager_id) REFERENCES users(id)
    )`);

    // Таблица сделок
    db.run(`CREATE TABLE IF NOT EXISTS deals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        amount REAL,
        status TEXT DEFAULT 'Новый',
        client_id INTEGER,
        manager_id INTEGER,
        FOREIGN KEY(client_id) REFERENCES clients(id),
        FOREIGN KEY(manager_id) REFERENCES users(id)
    )`);
});

module.exports = db;