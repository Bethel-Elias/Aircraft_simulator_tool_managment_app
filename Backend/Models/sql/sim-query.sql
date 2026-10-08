CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM(
        'ADMIN',
        'MANAGER',
        'SUPERVISOR',
        'TOOL_CONTROLLER',
        'TECHNICIAN',
        'CALIBRATION_OFFICER',
        'QUALITY',
        'VIEWER'
    ) NOT NULL DEFAULT 'TECHNICIAN',

    status ENUM(
        'ACTIVE',
        'INACTIVE'
    ) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_role (role),
    INDEX idx_users_status (status)
);

CREATE TABLE IF NOT EXISTS tool_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tools (
    id INT AUTO_INCREMENT PRIMARY KEY,

    tool_id VARCHAR(50) NOT NULL UNIQUE,
    tool_name VARCHAR(150) NOT NULL,

    part_number VARCHAR(100),
    serial_number VARCHAR(100),

    category_id INT,
    manufacturer VARCHAR(100),

    location VARCHAR(150),

    status ENUM(
        'AVAILABLE',
        'ISSUED',
        'MAINTENANCE',
        'CALIBRATION',
        'MISSING',
        'SCRAPPED'
    ) NOT NULL DEFAULT 'AVAILABLE',

    condition_status ENUM(
        'SERVICEABLE',
        'DAMAGED',
        'UNSERVICEABLE'
    ) NOT NULL DEFAULT 'SERVICEABLE',

    qr_code VARCHAR(255),

    purchase_date DATE,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_tools_category
        FOREIGN KEY (category_id)
        REFERENCES tool_categories(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    INDEX idx_tools_status (status),
    INDEX idx_tools_category (category_id),
    INDEX idx_tools_serial (serial_number),
    INDEX idx_tools_part_number (part_number),
    INDEX idx_tools_location (location)
);

CREATE TABLE IF NOT EXISTS simulators (
    id INT AUTO_INCREMENT PRIMARY KEY,

    simulator_code VARCHAR(50) NOT NULL UNIQUE,
    simulator_type VARCHAR(100) NOT NULL,

    manufacturer VARCHAR(100),

    location VARCHAR(150),

    status ENUM(
        'OPERATIONAL',
        'MAINTENANCE',
        'OUT_OF_SERVICE'
    ) NOT NULL DEFAULT 'OPERATIONAL',

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_simulator_status (status),
    INDEX idx_simulator_type (simulator_type)
);

CREATE TABLE IF NOT EXISTS tool_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    tool_id INT NOT NULL,

    technician_id INT NOT NULL,

    simulator_id INT,

    transaction_type ENUM(
        'ISSUE',
        'RETURN',
        'TRANSFER',
        'MISSING',
        'DAMAGED'
    ) NOT NULL,

    issue_date DATETIME,
    expected_return DATETIME,
    return_date DATETIME,

    condition_before VARCHAR(50),
    condition_after VARCHAR(50),

    comments TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transaction_tool
        FOREIGN KEY (tool_id)
        REFERENCES tools(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_transaction_technician
        FOREIGN KEY (technician_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_transaction_simulator
        FOREIGN KEY (simulator_id)
        REFERENCES simulators(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    INDEX idx_transaction_tool (tool_id),
    INDEX idx_transaction_technician (technician_id),
    INDEX idx_transaction_simulator (simulator_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_transaction_date (created_at)
);

CREATE TABLE IF NOT EXISTS calibrations (
    id INT AUTO_INCREMENT PRIMARY KEY,

    tool_id INT NOT NULL,

    calibration_date DATE NOT NULL,
    next_calibration_date DATE NOT NULL,

    certificate_number VARCHAR(100),

    calibration_provider VARCHAR(150),

    result ENUM(
        'PASS',
        'FAIL'
    ) NOT NULL,

    certificate_file VARCHAR(255),

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_calibration_tool
        FOREIGN KEY (tool_id)
        REFERENCES tools(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    INDEX idx_calibration_tool (tool_id),
    INDEX idx_calibration_next_date (next_calibration_date),
    INDEX idx_calibration_result (result)
);

CREATE TABLE IF NOT EXISTS tool_maintenance (
    id INT AUTO_INCREMENT PRIMARY KEY,

    tool_id INT NOT NULL,

    reported_by INT NOT NULL,

    issue_description TEXT NOT NULL,

    maintenance_action TEXT,

    status ENUM(
        'REPORTED',
        'UNDER_INSPECTION',
        'UNDER_REPAIR',
        'AWAITING_PARTS',
        'COMPLETED',
        'SCRAPPED'
    ) NOT NULL DEFAULT 'REPORTED',

    reported_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    completed_date DATETIME,

    technician_id INT,

    CONSTRAINT fk_maintenance_tool
        FOREIGN KEY (tool_id)
        REFERENCES tools(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_maintenance_reported_by
        FOREIGN KEY (reported_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_maintenance_technician
        FOREIGN KEY (technician_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    INDEX idx_maintenance_tool (tool_id),
    INDEX idx_maintenance_status (status),
    INDEX idx_maintenance_reported_date (reported_date)
);

CREATE TABLE IF NOT EXISTS work_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,

    work_order_number VARCHAR(50) NOT NULL UNIQUE,

    simulator_id INT NOT NULL,

    created_by INT NOT NULL,

    assigned_to INT,

    system_name VARCHAR(150),

    task_description TEXT,

    priority ENUM(
        'LOW',
        'MEDIUM',
        'HIGH',
        'CRITICAL'
    ) NOT NULL DEFAULT 'MEDIUM',

    status ENUM(
        'OPEN',
        'IN_PROGRESS',
        'ON_HOLD',
        'COMPLETED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'OPEN',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    completed_at DATETIME,

    CONSTRAINT fk_workorder_simulator
        FOREIGN KEY (simulator_id)
        REFERENCES simulators(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_workorder_creator
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_workorder_assignee
        FOREIGN KEY (assigned_to)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    INDEX idx_workorder_simulator (simulator_id),
    INDEX idx_workorder_status (status),
    INDEX idx_workorder_priority (priority),
    INDEX idx_workorder_assigned (assigned_to)
);

CREATE TABLE IF NOT EXISTS work_order_tools (
    id INT AUTO_INCREMENT PRIMARY KEY,

    work_order_id INT NOT NULL,
    tool_id INT NOT NULL,

    required_quantity INT NOT NULL DEFAULT 1,

    CONSTRAINT chk_required_quantity
        CHECK (required_quantity > 0),

    CONSTRAINT fk_wot_workorder
        FOREIGN KEY (work_order_id)
        REFERENCES work_orders(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_wot_tool
        FOREIGN KEY (tool_id)
        REFERENCES tools(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    UNIQUE KEY unique_workorder_tool (
        work_order_id,
        tool_id
    ),

    INDEX idx_wot_tool (tool_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id INT,

    action VARCHAR(100) NOT NULL,

    entity_type VARCHAR(100),

    entity_id INT,

    old_value JSON,

    new_value JSON,

    ip_address VARCHAR(45),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    INDEX idx_audit_user (user_id),
    INDEX idx_audit_entity (
        entity_type,
        entity_id
    ),
    INDEX idx_audit_action (action),
    INDEX idx_audit_date (created_at)
);