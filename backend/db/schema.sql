-- College Workflow Management System — Database Schema
-- Run once against an empty `college_workflow` database.

CREATE DATABASE IF NOT EXISTS college_workflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE college_workflow;

-- ─────────────────────────────────────────────
-- Migration: add name column if upgrading from older schema
-- ─────────────────────────────────────────────
-- ALTER TABLE users ADD COLUMN name VARCHAR(100) AFTER username;

-- ─────────────────────────────────────────────
-- Users
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  name       VARCHAR(100),
  password   VARCHAR(255) NOT NULL,          -- bcrypt hash
  role       ENUM('STUDENT','COORDINATOR','HOD','DIRECTOR') NOT NULL,
  department ENUM('CSE','ECE','MECH','CIVIL','EEE','IT')    NOT NULL
);

-- ─────────────────────────────────────────────
-- Requests
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS requests (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(200) NOT NULL,
  description  TEXT         NOT NULL,
  type         ENUM('LEAVE','LAB_ACCESS','ASSIGNMENT_EXT','LIBRARY_EXT','FEE_CONCESSION','CERTIFICATE','SCHOLARSHIP','COURSE_CHANGE','EXAM_REEVAL','PROJECT','EQUIPMENT','RESEARCH','INDUSTRIAL_VISIT','OTHER') NOT NULL,
  status       ENUM('PENDING','ESCALATED','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  current_role ENUM('COORDINATOR','HOD','DIRECTOR')              NOT NULL DEFAULT 'COORDINATOR',
  department   ENUM('CSE','ECE','MECH','CIVIL','EEE','IT')       NOT NULL,
  document     VARCHAR(200),
  priority     ENUM('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
  created_by   INT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_requests_user FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ─────────────────────────────────────────────
-- Approval History  (immutable log)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS approval_history (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  actor_id   INT NOT NULL,
  actor_role ENUM('COORDINATOR','HOD','DIRECTOR') NOT NULL,
  action     ENUM('APPROVED','REJECTED','ESCALATED') NOT NULL,
  comment    TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_history_request FOREIGN KEY (request_id) REFERENCES requests(id),
  CONSTRAINT fk_history_actor   FOREIGN KEY (actor_id)   REFERENCES users(id)
);

-- ─────────────────────────────────────────────
-- Seed Data
-- All passwords are bcrypt hash of "123"
-- ─────────────────────────────────────────────

-- One student per department
INSERT INTO users (username, password, role, department) VALUES
  ('student_cse',   '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'STUDENT', 'CSE'),
  ('student_ece',   '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'STUDENT', 'ECE'),
  ('student_mech',  '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'STUDENT', 'MECH'),
  ('student_civil', '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'STUDENT', 'CIVIL'),
  ('student_eee',   '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'STUDENT', 'EEE'),
  ('student_it',    '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'STUDENT', 'IT');

-- One coordinator per department
INSERT INTO users (username, password, role, department) VALUES
  ('coordinator_cse',   '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'COORDINATOR', 'CSE'),
  ('coordinator_ece',   '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'COORDINATOR', 'ECE'),
  ('coordinator_mech',  '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'COORDINATOR', 'MECH'),
  ('coordinator_civil', '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'COORDINATOR', 'CIVIL'),
  ('coordinator_eee',   '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'COORDINATOR', 'EEE'),
  ('coordinator_it',    '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'COORDINATOR', 'IT');

-- One HOD per department
INSERT INTO users (username, password, role, department) VALUES
  ('hod_cse',   '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'HOD', 'CSE'),
  ('hod_ece',   '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'HOD', 'ECE'),
  ('hod_mech',  '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'HOD', 'MECH'),
  ('hod_civil', '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'HOD', 'CIVIL'),
  ('hod_eee',   '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'HOD', 'EEE'),
  ('hod_it',    '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'HOD', 'IT');

-- One Director (cross-department)
INSERT INTO users (username, password, role, department) VALUES
  ('director', '$2b$10$BwR6NDiR3pmQ5sFkBdqaQ.1Z/q7QSRz..ab8OVvvIa.nseosArUsm', 'DIRECTOR', 'CSE');
