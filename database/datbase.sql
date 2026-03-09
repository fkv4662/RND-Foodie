CREATE DATABASE food_control;

USE food_control;

CREATE TABLE incidents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE,
  time TIME,
  reported_by VARCHAR(255),
  description TEXT,
  action_taken TEXT,
  status ENUM('Open','In Progress','Resolved'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
