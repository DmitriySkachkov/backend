const http = require('http');
const url = require('url');
const readUsers = require('./utils/readUsers');

// Порт из переменной окружения или 3000 по умолчанию
const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1';

const server = http.createServer((request, response) => {
    // Парсим URL и получаем параметры запроса
    const parsedUrl = url.parse(request.url, true);
    const query = parsedUrl.query;
    
    // Получаем все параметры запроса
    const queryKeys = Object.keys(query);
    
    // Проверяем наличие параметра hello
    if (query.hasOwnProperty('hello')) {
        const name = query.hello;
        
        // Проверяем, передан ли name (не пустая строка)
        if (!name || name.trim() === '') {
            response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            response.end('Enter a name');
            return;
        }
        
        // Возвращаем приветствие с именем
        response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end(`Hello, ${name}.`);
        return;
    }
    
    // Проверяем наличие параметра users
    if (query.hasOwnProperty('users')) {
        try {
            // Получаем пользователей из отдельного модуля
            const users = readUsers();
            
            response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            response.end(JSON.stringify(users));
        } catch (error) {
            // В случае ошибки чтения файла
            response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            response.end('Internal Server Error');
        }
        return;
    }
    
    // Если параметры не переданы
    if (queryKeys.length === 0) {
        response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Hello, World!');
        return;
    }
    
    // Если переданы другие параметры
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('');
});

// Запуск сервера
server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}/`);
    console.log('Available endpoints:');
    console.log('  - GET /                 -> "Hello, World!"');
    console.log('  - GET /?hello=<name>    -> "Hello, <name>."');
    console.log('  - GET /?hello=          -> "Enter a name" (400)');
    console.log('  - GET /?users           -> JSON from data/users.json');
    console.log('  - GET /?other           -> Empty response (500)');
});