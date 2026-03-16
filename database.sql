CREATE DATABASE workflow;

USE workflow;

CREATE TABLE users (
 id INT AUTO_INCREMENT PRIMARY KEY,
 username VARCHAR(50),
 password VARCHAR(255),
 role VARCHAR(50),
 department VARCHAR(50)
);

CREATE TABLE requests (
 id INT AUTO_INCREMENT PRIMARY KEY,
 title VARCHAR(200),
 description TEXT,
 status VARCHAR(50),
 document VARCHAR(200),
 created_by VARCHAR(50),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);