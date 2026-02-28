CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(100) NOT NULL,
    fname VARCHAR(150) not null,
    jobPosition varchar(150) not null,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','worker') DEFAULT 'worker',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE materials (
    material_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE projects (
    Project_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    status ENUM('active','completed') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type ENUM('store','site') NOT NULL,
    project_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE SET NULL
);
CREATE TABLE material_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,

    material_id INT NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,

    from_location_id INT NULL,
    to_location_id INT NULL,

    type ENUM('purchase','transfer','usage','adjustment') NOT NULL,

    performed_by INT NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (material_id) REFERENCES materials(material_id),
    FOREIGN KEY (from_location_id) REFERENCES locations(location_id),
    FOREIGN KEY (to_location_id) REFERENCES locations(location_id),
    FOREIGN KEY (performed_by) REFERENCES users(user_id)
);