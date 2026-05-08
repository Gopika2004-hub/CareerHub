CREATE DATABASE IF NOT EXISTS job_portal_api;
USE job_portal_api;

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255)
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    city VARCHAR(100),
    company_id INT,
    recruiter_id VARCHAR(100) NOT NULL, -- Clerk User ID
    isOpen BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT,
    candidate_id VARCHAR(100) NOT NULL, -- Clerk User ID
    status ENUM('applied', 'interviewing', 'hired', 'rejected') DEFAULT 'applied',
    resume_url VARCHAR(255),
    experience INT,
    skills TEXT,
    education VARCHAR(255),
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Saved Jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL, -- Clerk User ID
    job_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_job (user_id, job_id),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Seed Data
INSERT INTO companies (name, logo_url) VALUES 
('Google', '/google.webp'),
('Amazon', '/amazon.svg'),
('Microsoft', '/microsoft.webp');
