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

//detail the schema for the MySQL database
const databaseSchema = {
  accounts: [
      'CREATE TABLE IF NOT EXISTS accounts (' +
      'id INT AUTO_INCREMENT PRIMARY KEY, ' +
      'username VARCHAR(255), ' +
      'password VARCHAR(255))',
  ],
  track: [
      'CREATE TABLE IF NOT EXISTS track (' +
      'id INT AUTO_INCREMENT PRIMARY KEY, ' +
      'title VARCHAR(255), ' +
      'album_id INT, ' +
      'artist_id INT, ' +
      'FOREIGN KEY (album_id) REFERENCES album(id), ' +
      'FOREIGN KEY (artist_id) REFERENCES artist(id))',
  ],
  album: [
      'CREATE TABLE IF NOT EXISTS album (' +
      'id INT AUTO_INCREMENT PRIMARY KEY, ' +
      'title VARCHAR(255), ' +
      'artist_id INT, ' +
      'FOREIGN KEY (artist_id) REFERENCES artist(id))',
  ],
  artist: [
      'CREATE TABLE IF NOT EXISTS artist (' +
      'id INT AUTO_INCREMENT PRIMARY KEY, ' +
      'name VARCHAR(255))',
  ],
  playlist: [
      'CREATE TABLE IF NOT EXISTS playlist (' +
      'id INT AUTO_INCREMENT PRIMARY KEY, ' +
      'name VARCHAR(255), ' +
      'account_id INT, ' +
      'FOREIGN KEY (account_id) REFERENCES accounts(id))',
  ],
  concert: [
      'CREATE TABLE IF NOT EXISTS concert (' +
      'id INT AUTO_INCREMENT PRIMARY KEY, ' +
      'date DATE, ' +
      'duration INT, ' +
      'FOREIGN KEY (artist_id) REFERENCES artist(id))',
  ],
};

0
export { databasePool};