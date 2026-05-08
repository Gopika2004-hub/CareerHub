-- Update jobs table to support new fields
ALTER TABLE jobs 
ADD COLUMN company_logo VARCHAR(255) AFTER company_id,
ADD COLUMN company_name VARCHAR(255) AFTER company_logo,
ADD COLUMN role_department VARCHAR(255) AFTER title,
ADD COLUMN job_type VARCHAR(50) AFTER role_department,
ADD COLUMN salary_range VARCHAR(100) AFTER job_type,
ADD COLUMN experience_level VARCHAR(100) AFTER salary_range,
ADD COLUMN application_deadline DATE AFTER experience_level,
ADD COLUMN qualifications TEXT AFTER application_deadline,
ADD COLUMN company_size VARCHAR(100) AFTER company_name,
ADD COLUMN founded_year VARCHAR(50) AFTER company_size,
ADD COLUMN contact_phone VARCHAR(50) AFTER founded_year,
ADD COLUMN contact_email VARCHAR(100) AFTER contact_phone;
