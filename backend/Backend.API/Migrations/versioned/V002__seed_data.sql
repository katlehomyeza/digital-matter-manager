INSERT INTO device_types (name, description, created_at) VALUES
('Temperature Sensor', 'Monitors temperature', '2024-01-01 00:00:00'),
('GPS Tracker', 'Tracks location', '2024-01-01 00:00:00'),
('Motion Detector', 'Detects movement', '2024-01-01 00:00:00'),
('Humidity Sensor', 'Monitors humidity levels', '2024-01-01 00:00:00')
ON CONFLICT DO NOTHING;

INSERT INTO firmware (name, device_type_id, version, created_at) VALUES
('Temp Sensor Firmware v1', 1, '1.0.0', '2024-01-01 00:00:00'),
('Temp Sensor Firmware v1.1', 1, '1.1.0', '2024-03-01 00:00:00'),
('GPS Tracker Firmware v2', 2, '2.0.0', '2024-06-01 00:00:00')
ON CONFLICT DO NOTHING;


INSERT INTO groups (group_id, name, parent_group_id, created_at) VALUES
(1, 'Global Operations', NULL, '2024-01-01 00:00:00'),
(2, 'North America', 1, '2024-01-01 00:00:00'),
(3, 'Europe', 1, '2024-01-01 00:00:00'),
(4, 'US East Coast', 2, '2024-01-01 00:00:00'),
(5, 'US West Coast', 2, '2024-01-01 00:00:00'),
(6, 'UK Operations', 3, '2024-01-01 00:00:00'),
(7, 'New York Warehouse', 4, '2024-01-01 00:00:00'),
(8, 'San Francisco Office', 5, '2024-01-01 00:00:00')
ON CONFLICT DO NOTHING;

SELECT setval('groups_group_id_seq', (SELECT MAX(group_id) FROM groups));

INSERT INTO devices (name, serial_number, device_type_id, firmware_id, group_id, added_at) VALUES
('Temperature Sensor 001', 'TS-NYW-001', 1, 2, 7, '2024-02-01 00:00:00'),
('GPS Tracker 001', 'GPS-NYW-001', 2, 3, 7, '2024-05-15 00:00:00'),
('Motion Detector 001', 'MD-UK-001', 3, 2, 6, '2024-03-10 00:00:00'),
('Humidity Sensor 001', 'HS-NYW-001', 4, 2, 7, '2024-02-25 00:00:00'),
('Temperature Sensor 002', 'TS-SFO-001', 1, 1, 8, '2024-01-20 00:00:00')
ON CONFLICT (serial_number) DO NOTHING;

INSERT INTO device_firmware_history (device_id, firmware_id, installed_at) VALUES
(1, 1, '2024-02-01 00:00:00'),
(1, 2, '2024-03-15 00:00:00'),
(2, 3, '2024-05-15 00:00:00'),
(3, 1, '2024-03-10 00:00:00'),
(3, 2, '2024-04-01 00:00:00'),
(4, 2, '2024-02-25 00:00:00'),
(5, 1, '2024-01-20 00:00:00')
ON CONFLICT DO NOTHING;