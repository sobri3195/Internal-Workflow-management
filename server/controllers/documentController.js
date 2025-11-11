const pool = require('../config/database');
const { createAuditLog } = require('../utils/auditLog');
const { notifyReviewer, notifyApprover, notifySigner, notifySubmitter } = require('../utils/notifications');

const createDocument = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { title, document_type, unit_kerja, description, valid_date } = req.body;
    const submitterId = req.user.id;
    
    const result = await client.query(
      `INSERT INTO documents (title, document_type, unit_kerja, description, valid_date, submitter_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft')
       RETURNING *`,
      [title, document_type, unit_kerja, description, valid_date, submitterId]
    );
    
    const document = result.rows[0];
    
    await createAuditLog(document.id, submitterId, 'submit', 'draft', 'Document created as draft', req);
    
    await client.query('COMMIT');
    
    res.status(201).json({ document });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Failed to create document' });
  } finally {
    client.release();
  }
};

const updateDocument = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { title, document_type, unit_kerja, description, valid_date } = req.body;
    
    const docResult = await client.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );
    
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const document = docResult.rows[0];
    
    if (document.submitter_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this document' });
    }
    
    if (document.status !== 'draft' && document.status !== 'revision') {
      return res.status(400).json({ error: 'Can only update documents in draft or revision status' });
    }
    
    const result = await client.query(
      `UPDATE documents 
       SET title = $1, document_type = $2, unit_kerja = $3, description = $4, valid_date = $5
       WHERE id = $6
       RETURNING *`,
      [title, document_type, unit_kerja, description, valid_date, id]
    );
    
    await createAuditLog(id, req.user.id, 'submit', document.status, 'Document updated', req);
    
    await client.query('COMMIT');
    
    res.json({ document: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Failed to update document' });
  } finally {
    client.release();
  }
};

const submitDocument = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    const docResult = await client.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );
    
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const document = docResult.rows[0];
    
    if (document.submitter_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to submit this document' });
    }
    
    if (document.status !== 'draft' && document.status !== 'revision') {
      return res.status(400).json({ error: 'Can only submit documents in draft or revision status' });
    }
    
    const documentNumber = `DOC-${new Date().getFullYear()}-${String(id).padStart(6, '0')}`;
    
    const reviewerResult = await client.query(
      'SELECT id, email FROM users WHERE role = $1 AND is_active = true LIMIT 1',
      ['reviewer1']
    );
    
    if (reviewerResult.rows.length === 0) {
      return res.status(400).json({ error: 'No reviewer available' });
    }
    
    const reviewer = reviewerResult.rows[0];
    
    await client.query(
      `UPDATE documents 
       SET status = 'review1', document_number = $1, submitted_at = CURRENT_TIMESTAMP, current_reviewer_id = $2
       WHERE id = $3`,
      [documentNumber, reviewer.id, id]
    );
    
    await client.query(
      `INSERT INTO workflow_assignments (document_id, stage, assigned_to, deadline)
       VALUES ($1, 'review1', $2, CURRENT_TIMESTAMP + INTERVAL '3 days')`,
      [id, reviewer.id]
    );
    
    await createAuditLog(id, req.user.id, 'submit', 'review1', 'Document submitted for review', req);
    
    await notifyReviewer(reviewer.email, document.title, id);
    
    await client.query('COMMIT');
    
    res.json({ message: 'Document submitted successfully', documentNumber });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Submit document error:', error);
    res.status(500).json({ error: 'Failed to submit document' });
  } finally {
    client.release();
  }
};

const getDocuments = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT d.*, 
             u.full_name as submitter_name,
             r.full_name as reviewer_name,
             COUNT(*) OVER() as total_count
      FROM documents d
      LEFT JOIN users u ON d.submitter_id = u.id
      LEFT JOIN users r ON d.current_reviewer_id = r.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (req.user.role === 'submitter') {
      query += ` AND d.submitter_id = $${paramCount}`;
      params.push(req.user.id);
      paramCount++;
    } else if (req.user.role !== 'admin') {
      query += ` AND (d.current_reviewer_id = $${paramCount} OR d.status = 'archived')`;
      params.push(req.user.id);
      paramCount++;
    }
    
    if (status) {
      query += ` AND d.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    if (search) {
      query += ` AND (d.title ILIKE $${paramCount} OR d.document_number ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    
    query += ` ORDER BY d.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    
    res.json({
      documents: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
};

const getDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT d.*, 
              u.full_name as submitter_name, u.email as submitter_email, u.unit_kerja as submitter_unit,
              r.full_name as reviewer_name
       FROM documents d
       LEFT JOIN users u ON d.submitter_id = u.id
       LEFT JOIN users r ON d.current_reviewer_id = r.id
       WHERE d.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const document = result.rows[0];
    
    const attachmentsResult = await pool.query(
      `SELECT a.*, u.full_name as uploaded_by_name
       FROM attachments a
       LEFT JOIN users u ON a.uploaded_by = u.id
       WHERE a.document_id = $1
       ORDER BY a.version DESC, a.uploaded_at DESC`,
      [id]
    );
    
    const commentsResult = await pool.query(
      `SELECT c.*, u.full_name as user_name, u.role as user_role
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.document_id = $1
       ORDER BY c.created_at DESC`,
      [id]
    );
    
    const auditResult = await pool.query(
      `SELECT a.*, u.full_name as user_name, u.role as user_role
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.document_id = $1
       ORDER BY a.created_at DESC`,
      [id]
    );
    
    const workflowResult = await pool.query(
      `SELECT w.*, u.full_name as assigned_to_name
       FROM workflow_assignments w
       LEFT JOIN users u ON w.assigned_to = u.id
       WHERE w.document_id = $1
       ORDER BY w.assigned_at DESC`,
      [id]
    );
    
    res.json({
      document,
      attachments: attachmentsResult.rows,
      comments: commentsResult.rows,
      audit: auditResult.rows,
      workflow: workflowResult.rows
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to get document' });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const docResult = await pool.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );
    
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const document = docResult.rows[0];
    
    if (document.submitter_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this document' });
    }
    
    if (document.status !== 'draft') {
      return res.status(400).json({ error: 'Can only delete documents in draft status' });
    }
    
    await pool.query('DELETE FROM documents WHERE id = $1', [id]);
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

module.exports = {
  createDocument,
  updateDocument,
  submitDocument,
  getDocuments,
  getDocument,
  deleteDocument
};
