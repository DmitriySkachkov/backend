const fs = require('fs');
const path = require('path');

function getUsers() {
    const filePath = path.join(__dirname, '../../data/users.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
}

module.exports = getUsers;

