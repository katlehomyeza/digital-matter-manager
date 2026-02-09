DROP TABLE IF EXISTS device_firmware_history CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS device_types CASCADE;
DROP TABLE IF EXISTS firmware CASCADE;
DROP TABLE IF EXISTS groups CASCADE;

CREATE TABLE groups (
    group_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_group_id INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_parent_group FOREIGN KEY (parent_group_id) 
        REFERENCES groups(group_id) ON DELETE RESTRICT
);

CREATE TABLE device_types (
    device_type_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE firmware (
    firmware_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    device_type_id INTEGER NOT NULL,
    version VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_device_type
        FOREIGN KEY (device_type_id)
        REFERENCES device_types(device_type_id)
);

CREATE TABLE devices (
    device_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    device_type_id INT NOT NULL,
    firmware_id INT NOT NULL,
    group_id INT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_device_type FOREIGN KEY (device_type_id) 
        REFERENCES device_types(device_type_id) ON DELETE RESTRICT,
    CONSTRAINT fk_firmware FOREIGN KEY (firmware_id) 
        REFERENCES firmware(firmware_id) ON DELETE RESTRICT,
    CONSTRAINT fk_group FOREIGN KEY (group_id) 
        REFERENCES groups(group_id) ON DELETE SET NULL
);

CREATE TABLE device_firmware_history (
    device_firmware_history_id SERIAL PRIMARY KEY,
    device_id INT NOT NULL,
    firmware_id INT NOT NULL,
    installed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_device FOREIGN KEY (device_id) 
        REFERENCES devices(device_id) ON DELETE CASCADE,
    CONSTRAINT fk_history_firmware FOREIGN KEY (firmware_id) 
        REFERENCES firmware(firmware_id) ON DELETE RESTRICT
);

CREATE INDEX idx_firmware_device_type_id ON firmware(device_type_id);
CREATE INDEX idx_firmware_version ON firmware(version);
CREATE INDEX idx_devices_group_id ON devices(group_id);
CREATE INDEX idx_devices_firmware_id ON devices(firmware_id);
CREATE INDEX idx_devices_device_type_id ON devices(device_type_id);
CREATE INDEX idx_groups_parent_group_id ON groups(parent_group_id);
CREATE INDEX idx_device_firmware_history_device_id ON device_firmware_history(device_id);