ALTER TABLE firmware
ADD CONSTRAINT unique_firmware_name_version_type
UNIQUE (name, version, device_type_id);
