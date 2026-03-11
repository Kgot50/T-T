-- Traycee Safety Platform - MySQL Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS traycee_db;
USE traycee_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  guardian_mode BOOLEAN DEFAULT false,
  accessibility_settings JSON DEFAULT '{"highContrast": false, "textToSpeech": false, "speechToText": false, "colorBlindMode": "none"}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id VARCHAR(36) PRIMARY KEY,
  location JSON NOT NULL,
  type ENUM('danger', 'warning', 'info') NOT NULL,
  description TEXT NOT NULL,
  reported_by_id VARCHAR(36),
  reported_by_name VARCHAR(255) NOT NULL,
  anonymous BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reported_by_id) REFERENCES profiles(id) ON DELETE SET NULL,
  INDEX idx_created_at (created_at DESC),
  INDEX idx_type (type)
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('message', 'incident', 'alert') DEFAULT 'message',
  channel ENUM('general', 'alerts', 'nearby') DEFAULT 'general',
  location JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_created_at (created_at DESC),
  INDEX idx_channel (channel)
);

-- Create safety_zones table
CREATE TABLE IF NOT EXISTS safety_zones (
  id VARCHAR(36) PRIMARY KEY,
  location JSON NOT NULL,
  type ENUM('police', 'hospital', 'fire', 'safe_zone') NOT NULL,
  name VARCHAR(255) NOT NULL,
  radius INT DEFAULT 500,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (type)
);

-- Create sos_alerts table
CREATE TABLE IF NOT EXISTS sos_alerts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  location JSON NOT NULL,
  status ENUM('active', 'cancelled', 'resolved') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_user_id (user_id)
);

-- Insert sample safety zones
INSERT INTO safety_zones (id, location, type, name, radius) VALUES
  (UUID(), '{"lat": 40.7128, "lng": -74.0060}', 'police', 'NYPD Central Precinct', 500),
  (UUID(), '{"lat": 40.7589, "lng": -73.9851}', 'hospital', 'Emergency Hospital', 300),
  (UUID(), '{"lat": 40.7489, "lng": -73.9680}', 'fire', 'Fire Station 24', 400),
  (UUID(), '{"lat": 40.7614, "lng": -73.9776}', 'safe_zone', 'Community Safe House', 200)
ON DUPLICATE KEY UPDATE id=id;
