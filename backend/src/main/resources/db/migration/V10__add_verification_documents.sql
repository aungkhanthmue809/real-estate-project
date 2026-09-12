ALTER TABLE properties
    ADD COLUMN nrc_document_path VARCHAR(500),
    ADD COLUMN ownership_document_path VARCHAR(500),
    ADD COLUMN verification_required BOOLEAN NOT NULL DEFAULT FALSE;