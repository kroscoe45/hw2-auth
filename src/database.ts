import mysql from "mysql2/promise";

const databasePool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'test',
    password: 'your_password',
    waitForConnections: true,
    connectionLimit: 10, // Adjust based on expected traffic
    queueLimit: 0,
  });

const res = databasePool.execute('CREATE TABLE IF NOT EXISTS accounts ' +
                            +    'id INT AUTO_INCREMENT PRIMARY KEY, ' +
                            +    'username: VARCHAR(255), password VARCHAR(255)');

export { databasePool};