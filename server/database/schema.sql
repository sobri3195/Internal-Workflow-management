-- Drop existing tables
DROP TABLE IF EXISTS signature_logs CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS document_versions CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS workflow_assignments CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS document_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS action_type CASCADE;
DROP TYPE IF EXISTS signature_status CASCADE;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('submitter', 'reviewer1', 'reviewer2', 'reviewer3', 'approver', 'signer', 'admin');
CREATE TYPE document_status AS ENUM ('draft', 'review1', 'review2', 'review3', 'approve', 'sign', 'archived', 'rejected', 'revision');
CREATE TYPE action_type AS ENUM ('submit', 'approve', 'reject', 'request_changes', 'sign', 'comment', 'archive');
CREATE TYPE signature_status AS ENUM ('pending', 'signed', 'failed');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'submitter',
    unit_kerja VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    document_number VARCHAR(100) UNIQUE,
    title VARCHAR(500) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    unit_kerja VARCHAR(255) NOT NULL,
    description TEXT,
    valid_date DATE,
    status document_status DEFAULT 'draft',
    submitter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    current_reviewer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_locked BOOLEAN DEFAULT false,
    retention_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    signed_at TIMESTAMP,
    archived_at TIMESTAMP
);

-- Workflow assignments table
CREATE TABLE workflow_assignments (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    stage document_status NOT NULL,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    deadline TIMESTAMP,
    is_completed BOOLEAN DEFAULT false,
    action action_type,
    notes TEXT
);

-- Attachments table
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    version INTEGER DEFAULT 1,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document versions table
CREATE TABLE document_versions (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    title VARCHAR(500),
    description TEXT,
    changes_requested TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    stage document_status NOT NULL,
    comment TEXT NOT NULL,
    is_inline BOOLEAN DEFAULT false,
    inline_position TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action action_type NOT NULL,
    stage document_status NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Signature logs table
CREATE TABLE signature_logs (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    signer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    signature_status signature_status DEFAULT 'pending',
    signature_type VARCHAR(100),
    certificate_info TEXT,
    signature_data TEXT,
    signed_at TIMESTAMP,
    is_sequential BOOLEAN DEFAULT true,
    sequence_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_submitter ON documents(submitter_id);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_workflow_assignments_document ON workflow_assignments(document_id);
CREATE INDEX idx_workflow_assignments_assigned_to ON workflow_assignments(assigned_to);
CREATE INDEX idx_attachments_document ON attachments(document_id);
CREATE INDEX idx_comments_document ON comments(document_id);
CREATE INDEX idx_audit_logs_document ON audit_logs(document_id);
CREATE INDEX idx_signature_logs_document ON signature_logs(document_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
