const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1';

// Функции для работы с JSON файлами
function readJSON(filename) {
    try {
        const filePath = path.join(__dirname, '..', 'data', filename);
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Unable to read ${filename}`);
    }
}

function writeJSON(filename, data) {
    try {
        const filePath = path.join(__dirname, '..', 'data', filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (error) {
        throw new Error(`Unable to write to ${filename}`);
    }
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    const query = parsedUrl.query;

    // Устанавливаем CORS заголовки
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Обработка preflight запросов
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Функция для отправки JSON ответа
    const sendJSON = (data, statusCode = 200) => {
        res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(data));
    };

    // Функция для отправки текстового ответа
    const sendText = (text, statusCode = 200) => {
        res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(text);
    };

    // Функция для получения тела запроса
    const getBody = (callback) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                callback(JSON.parse(body || '{}'));
            } catch (error) {
                callback({});
            }
        });
    };

    // GET параметры для hello
    if (Object.keys(query).length > 0) {
        if (query.hasOwnProperty('hello')) {
            const name = query.hello;
            if (!name || name.trim() === '') {
                sendText('Enter a name', 400);
                return;
            }
            sendText(`Hello, ${name}.`);
            return;
        }
        
        if (query.hasOwnProperty('users')) {
            try {
                const users = readJSON('users.json');
                sendJSON(users);
                return;
            } catch (error) {
                sendText('Internal Server Error', 500);
                return;
            }
        }
        
        // Если переданы другие параметры
        sendText('', 500);
        return;
    }
    
    // Если параметров нет
    if (method === 'GET' && pathname === '/') {
        sendText('Hello, World!');
        return;
    }

    // БИБЛИОТЕКИ
    
    // BOOKS ENDPOINTS
    
    // Получить все книги
    if (method === 'GET' && pathname === '/api/books') {
        try {
            const books = readJSON('books.json');
            sendJSON(books);
        } catch (error) {
            sendJSON({ error: error.message }, 500);
        }
        return;
    }
    
    // Получить книгу по ID
    if (method === 'GET' && pathname.match(/^\/api\/books\/\d+$/)) {
        const id = parseInt(pathname.split('/').pop());
        try {
            const books = readJSON('books.json');
            const book = books.find(b => b.id === id);
            if (book) {
                sendJSON(book);
            } else {
                sendJSON({ error: 'Book not found' }, 404);
            }
        } catch (error) {
            sendJSON({ error: error.message }, 500);
        }
        return;
    }
    
    // Создать новую книгу
    if (method === 'POST' && pathname === '/api/books') {
        getBody((body) => {
            try {
                const books = readJSON('books.json');
                const newBook = {
                    id: books.length + 1,
                    title: body.title,
                    author: body.author,
                    year: body.year,
                    genre: body.genre,
                    total_copies: body.total_copies || 1,
                    available_copies: body.total_copies || 1
                };
                books.push(newBook);
                writeJSON('books.json', books);
                sendJSON(newBook, 201);
            } catch (error) {
                sendJSON({ error: error.message }, 500);
            }
        });
        return;
    }
    
    // Обновить книгу
    if (method === 'PUT' && pathname.match(/^\/api\/books\/\d+$/)) {
        const id = parseInt(pathname.split('/').pop());
        getBody((body) => {
            try {
                const books = readJSON('books.json');
                const index = books.findIndex(b => b.id === id);
                if (index !== -1) {
                    books[index] = { ...books[index], ...body, id };
                    writeJSON('books.json', books);
                    sendJSON({ updated: true, book: books[index] });
                } else {
                    sendJSON({ error: 'Book not found' }, 404);
                }
            } catch (error) {
                sendJSON({ error: error.message }, 500);
            }
        });
        return;
    }
    
    // Удалить книгу
    if (method === 'DELETE' && pathname.match(/^\/api\/books\/\d+$/)) {
        const id = parseInt(pathname.split('/').pop());
        try {
            const books = readJSON('books.json');
            const filteredBooks = books.filter(b => b.id !== id);
            if (filteredBooks.length !== books.length) {
                writeJSON('books.json', filteredBooks);
                sendJSON({ deleted: true });
            } else {
                sendJSON({ error: 'Book not found' }, 404);
            }
        } catch (error) {
            sendJSON({ error: error.message }, 500);
        }
        return;
    }
    
    // Поиск книг
    if (method === 'GET' && pathname === '/api/books/search') {
        try {
            const books = readJSON('books.json');
            let result = [...books];
            
            if (query.title) {
                result = result.filter(b => 
                    b.title.toLowerCase().includes(query.title.toLowerCase())
                );
            }
            if (query.author) {
                result = result.filter(b => 
                    b.author.toLowerCase().includes(query.author.toLowerCase())
                );
            }
            if (query.genre) {
                result = result.filter(b => 
                    b.genre.toLowerCase().includes(query.genre.toLowerCase())
                );
            }
            
            sendJSON(result);
        } catch (error) {
            sendJSON({ error: error.message }, 500);
        }
        return;
    }
    
    // Получить доступные книги
    if (method === 'GET' && pathname === '/api/books/available') {
        try {
            const books = readJSON('books.json');
            const availableBooks = books.filter(b => b.available_copies > 0);
            sendJSON(availableBooks);
        } catch (error) {
            sendJSON({ error: error.message }, 500);
        }
        return;
    }
    
    // История операций с книгой
    if (method === 'GET' && pathname.match(/^\/api\/books\/\d+\/history$/)) {
        const bookId = parseInt(pathname.split('/')[3]);
        try {
            const borrowings = readJSON('borrowings.json');
            const users = readJSON('users.json');
            
            const bookHistory = borrowings
                .filter(b => b.book_id === bookId)
                .map(b => {
                    const user = users.find(u => u.id === b.user_id);
                    return {
                        ...b,
                        user_name: user ? user.name : 'Unknown'
                    };
                });
            
            sendJSON(bookHistory);
        } catch (error) {
            sendJSON({ error: error.message }, 500);
        }
        return;
    }
    
    // USERS
    
    // Получить всех читателей
    if (method === 'GET' && pathname === '/api/users') {
        try {
            const users = readJSON('users.json');
            sendJSON(users);
        } catch (error) {
            sendJSON({ error: error.message }, 500);
        }
        return;
    }
    
    // Получить читателя по ID
    if (method === 'GET' && pathname.match(/^\/api\/users\/\d+$/)) {
        const id = parseInt(pathname.split('/').pop());
        try {
            const users = readJSON('users.json');
            const borrowings = readJSON('borrowings.json');
            const user = users.find(u => u.id === id);
            
            if (user) {
                const userBooks = borrowings
                    .filter(b => b.user_id === id && !b.returned_at)
                    .map(b => b.book_id);
                sendJSON({ ...user, borrowed_books: userBooks });
            } else {
                sendJSON({ error: 'User not found' }, 404);
            }
        } catch (error) {
            sendJSON({ error: error.message }, 500);
        }
        return;
    }
    
    // Создать читателя
    if (method === 'POST' && pathname === '/api/users') {
        getBody((body) => {
            try {
                const users = readJSON('users.json');
                const newUser = {
                    id: users.length + 1,
                    name: body.name,
                    email: body.email,
                    phone: body.phone || '',
                    address: body.address || ''
                };
                users.push(newUser);
                writeJSON('users.json', users);
                sendJSON(newUser, 201);
            } catch (error) {
                sendJSON({ error: error.message }, 500);
            }
        });
        return;
    }
    
    // Обновить читателя
    if (method === 'PUT' && pathname.match(/^\/api\/users\/\d+$/)) {
        const id = parseInt(pathname.split('/').pop());
        getBody((body) => {
            try {
                const users = readJSON('users.json');
                const index = users.findIndex(u => u.id === id);
                if (index !== -1) {
                    users[index] = { ...users[index], ...body, id };
                    writeJSON('users.json', users);
                    sendJSON({ updated: true, user: users[index] });
                } else {
                    sendJSON({ error: 'User not found' }, 404);
                }
            } catch (error) {
                sendJSON({ error: error.message }, 500);
            }
        });
        return;
    }
    
    // Удалить читателя
    if (method === 'DELETE' && pathname.match(/^\/api\/users\/\d+$/)) {
        const id = parseInt(pathname.split('/').pop());
        try {
            const users = readJSON('users.json');
            const filteredUsers = users.filter(u => u.id !== id);
            if (filteredUsers.length !== users.length) {
                writeJSON('users.json', filteredUsers);
                sendJSON({ deleted: true });
            } else {
                sendJSON({ error: 'User not found' }, 404);
            }
        } catch (error) {
            sendJSON({ error: error.message }, 500);
        }
        return;
    }
    
    // Получить книги пользователя
    if (method === 'GET' && pathname.match(/^\/api\/users\/\d+\/books$/)) {
        const userId = parseInt(pathname.split('/')[3]);
        try {
            const books = readJSON('books.json');
            const borrowings = readJSON('borrowings.json');
            
            const userBorrowings = borrowings.filter(
                b => b.user_id === userId && !b.returned_at
            );
            
            const userBooks = userBorrowings.map(borrowing => {
                const book = books.find(b => b.id === borrowing.book_id);
                return {
                    ...book,
                    borrowed_at: borrowing.borrowed_at,
                    due_date: borrowing.due_date
                };
            });
            
            sendJSON(userBooks);
        } catch (error) {
            sendJSON({ error: error.message }, 500);
        }
        return;
    }
    
    // OPERATIONS
    
    // Взять книгу
    if (method === 'POST' && pathname.match(/^\/api\/users\/\d+\/borrow\/\d+$/)) {
        const parts = pathname.split('/');
        const userId = parseInt(parts[3]);
        const bookId = parseInt(parts[5]);
        
        try {
            const books = readJSON('books.json');
            const borrowings = readJSON('borrowings.json');
            
            const book = books.find(b => b.id === bookId);
            if (!book) {
                sendJSON({ error: 'Book not found' }, 404);
                return;
            }
            
            if (book.available_copies <= 0) {
                sendJSON({ error: 'No copies available' }, 400);
                return;
            }
            
            // Проверяем, не взята ли уже книга этим пользователем
            const alreadyBorrowed = borrowings.some(
                b => b.user_id === userId && b.book_id === bookId && !b.returned_at
            );
            
            if (alreadyBorrowed) {
                sendJSON({ error: 'Book already borrowed by this user' }, 400);
                return;
            }
            
            // Создаем запись о взятии книги
            const newBorrowing = {
                id: borrowings.length + 1,
                user_id: userId,
                book_id: bookId,
                borrowed_at: new Date().toISOString(),
                due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                returned_at: null
            };
            
            borrowings.push(newBorrowing);
            writeJSON('borrowings.json', borrowings);
            
            // Уменьшаем количество доступных копий
            const bookIndex = books.findIndex(b => b.id === bookId);
            books[bookIndex].available_copies--;
            writeJSON('books.json', books);
            
            sendJSON({ 
                borrowed: true, 
                due_date: newBorrowing.due_date,
                message: 'Book borrowed successfully'
            });
        } catch (error) {
            sendJSON({ error: error.message }, 500);
        }
        return;
    }
    
    // Вернуть книгу
    if (method === 'POST' && pathname.match(/^\/api\/users\/\d+\/return\/\d+$/)) {
        const parts = pathname.split('/');
        const userId = parseInt(parts[3]);
        const bookId = parseInt(parts[5]);
        
        try {
            const books = readJSON('books.json');
            const borrowings = readJSON('borrowings.json');
            
            const borrowingIndex = borrowings.findIndex(
                b => b.user_id === userId && b.book_id === bookId && !b.returned_at
            );
            
            if (borrowingIndex === -1) {
                sendJSON({ error: 'Borrowing record not found' }, 404);
                return;
            }
            
            // Обновляем запись о возврате
            borrowings[borrowingIndex].returned_at = new Date().toISOString();
            writeJSON('borrowings.json', borrowings);
            
            // Увеличиваем количество доступных копий
            const bookIndex = books.findIndex(b => b.id === bookId);
            books[bookIndex].available_copies++;
            writeJSON('books.json', books);
            
            sendJSON({ returned: true, message: 'Book returned successfully' });
        } catch (error) {
            sendJSON({ error: error.message }, 500);
        }
        return;
    }
    
    // STATISTICS
    
    // Получить статистику библиотеки
    if (method === 'GET' && pathname === '/api/statistics') {
        try {
            const books = readJSON('books.json');
            const users = readJSON('users.json');
            const borrowings = readJSON('borrowings.json');
            
            const activeBorrowings = borrowings.filter(b => !b.returned_at);
            
            sendJSON({
                total_books: books.length,
                total_users: users.length,
                borrowed_books: activeBorrowings.length,
                available_books: books.reduce((sum, b) => sum + b.available_copies, 0),
                total_copies: books.reduce((sum, b) => sum + b.total_copies, 0)
            });
        } catch (error) {
            sendJSON({ error: error.message }, 500);
        }
        return;
    }
    
    // Если маршрут не найден
    sendJSON({ error: 'Route not found' }, 404);
});

server.listen(PORT, HOST, () => {
    console.log(`\n📚 Library API Server running at http://${HOST}:${PORT}/`);
    console.log('\n✅ Legacy endpoints:');
    console.log('   GET  /?hello=<name>');
    console.log('   GET  /?users');
    console.log('   GET  /');
    console.log('\n📚 Library API endpoints:');
    console.log('   GET    /api/books');
    console.log('   GET    /api/books/:id');
    console.log('   POST   /api/books');
    console.log('   PUT    /api/books/:id');
    console.log('   DELETE /api/books/:id');
    console.log('   GET    /api/books/search');
    console.log('   GET    /api/books/available');
    console.log('   GET    /api/books/:id/history');
    console.log('   GET    /api/users');
    console.log('   GET    /api/users/:id');
    console.log('   POST   /api/users');
    console.log('   PUT    /api/users/:id');
    console.log('   DELETE /api/users/:id');
    console.log('   GET    /api/users/:id/books');
    console.log('   POST   /api/users/:id/borrow/:book_id');
    console.log('   POST   /api/users/:id/return/:book_id');
    console.log('   GET    /api/statistics\n');
});