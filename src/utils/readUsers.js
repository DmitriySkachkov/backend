const fs = require('fs');
const path = require('path');

function readUsers() {
    try {
        // Формируем путь к файлу users.json
        const usersPath = path.join(__dirname, '..', '..', 'data', 'users.json');
        
        // Читаем файл синхронно
        const usersData = fs.readFileSync(usersPath, 'utf-8');
        
        // Парсим JSON
        return JSON.parse(usersData);
    } catch (error) {
        // Если файл не найден или ошибка чтения
        throw new Error('Unable to read users file');
    }
}

module.exports = readUsers;