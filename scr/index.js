const http = require('http');
const getUsers = require('./modules/users');

const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    const searchParams = url.searchParams;

    // Если никакие параметры не переданы
    if (searchParams.toString() === '') {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/plain; charset=utf-8');
        response.write('Hello, World!');
        response.end();
        return;
    }

    // Обработка запроса ?hello=<name>
    if (searchParams.has('hello')) {
        const name = searchParams.get('hello');
        if (name && name.trim() !== '') {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/plain; charset=utf-8');
            response.write(`Hello, ${name}.`);
            response.end();
            return;
        } else {
            response.statusCode = 400;
            response.setHeader('Content-Type', 'text/plain; charset=utf-8');
            response.write('Enter a name');
            response.end();
            return;
        }
    }

    // Обработка запроса ?users
    if (searchParams.has('users')) {
        try {
            const users = getUsers();
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json; charset=utf-8');
            response.write(JSON.stringify(users));
            response.end();
            return;
        } catch (error) {
            response.statusCode = 500;
            response.end();
            return;
        }
    }

    // Если переданы какие-либо другие параметры
    response.statusCode = 500;
    response.end();
});

const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1';

server.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});

