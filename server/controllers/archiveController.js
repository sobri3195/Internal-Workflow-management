const pool = require('../config/database');

const getArchivedDocuments = async (req, res) => {
  try {
    const { search, document_type, start_date, end_date, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT d.*, 
             u.full_name as submitter_name,
             COUNT(*) OVER() as total_count
      FROM documents d
      LEFT JOIN users u ON d.submitter_id = u.id
      WHERE d.status = 'archived'
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (search) {
      query += ` AND (d.title ILIKE $${paramCount} OR d.document_number ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    
    if (document_type) {
      query += ` AND d.document_type = $${paramCount}`;
      params.push(document_type);
      paramCount++;
    }
    
    if (start_date) {
      query += ` AND d.archived_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }
    
    if (end_date) {
      query += ` AND d.archived_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }
    
    query += ` ORDER BY d.archived_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
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
    console.error('Get archived documents error:', error);
    res.status(500).json({ error: 'Failed to get archived documents' });
  }
};

const getArchivedDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT d.*, 
              u.full_name as submitter_name, u.email as submitter_email, u.unit_kerja as submitter_unit
       FROM documents d
       LEFT JOIN users u ON d.submitter_id = u.id
       WHERE d.id = $1 AND d.status = 'archived'`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Archived document not found' });
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
    
    const signaturesResult = await pool.query(
      `SELECT sl.*, u.full_name as signer_name
       FROM signature_logs sl
       LEFT JOIN users u ON sl.signer_id = u.id
       WHERE sl.document_id = $1
       ORDER BY sl.sequence_order`,
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
    
    res.json({
      document,
      attachments: attachmentsResult.rows,
      signatures: signaturesResult.rows,
      audit: auditResult.rows
    });
  } catch (error) {
    console.error('Get archived document error:', error);
    res.status(500).json({ error: 'Failed to get archived document' });
  }
};

const getArchiveStatistics = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_archived,
        COUNT(DISTINCT document_type) as document_types_count,
        COUNT(CASE WHEN archived_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as archived_last_month,
        COUNT(CASE WHEN retention_date < CURRENT_DATE THEN 1 END) as expired_retention
      FROM documents
      WHERE status = 'archived'
    `);
    
    const typeStats = await pool.query(`
      SELECT document_type, COUNT(*) as count
      FROM documents
      WHERE status = 'archived'
      GROUP BY document_type
      ORDER BY count DESC
    `);
    
    res.json({
      statistics: stats.rows[0],
      documentTypes: typeStats.rows
    });
  } catch (error) {
    console.error('Get archive statistics error:', error);
    res.status(500).json({ error: 'Failed to get archive statistics' });
  }
};

module.exports = {
  getArchivedDocuments,
  getArchivedDocument,
  getArchiveStatistics
};
