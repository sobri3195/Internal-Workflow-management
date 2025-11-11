const pool = require('../config/database');
const { createAuditLog } = require('../utils/auditLog');
const { notifySigner, notifySubmitter } = require('../utils/notifications');

const approveDocument = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { action, notes } = req.body;
    
    const docResult = await client.query(
      `SELECT d.*, u.email as submitter_email
       FROM documents d
       LEFT JOIN users u ON d.submitter_id = u.id
       WHERE d.id = $1`,
      [id]
    );
    
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const document = docResult.rows[0];
    
    if (req.user.role !== 'approver' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only approvers can approve documents' });
    }
    
    if (document.status !== 'approve') {
      return res.status(400).json({ error: 'Document is not ready for approval' });
    }
    
    const validActions = ['approve', 'reject'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    let newStatus = document.status;
    
    if (action === 'reject') {
      newStatus = 'rejected';
      await notifySubmitter(document.submitter_email, document.title, 'Rejected', notes);
    } else if (action === 'approve') {
      newStatus = 'sign';
      
      await client.query(
        `UPDATE documents 
         SET approved_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [id]
      );
      
      const signerResult = await client.query(
        'SELECT id, email FROM users WHERE role = $1 AND is_active = true',
        ['signer']
      );
      
      if (signerResult.rows.length > 0) {
        for (let i = 0; i < signerResult.rows.length; i++) {
          const signer = signerResult.rows[i];
          
          await client.query(
            `INSERT INTO signature_logs (document_id, signer_id, signature_status, is_sequential, sequence_order)
             VALUES ($1, $2, 'pending', true, $3)`,
            [id, signer.id, i + 1]
          );
          
          if (i === 0) {
            await notifySigner(signer.email, document.title, id);
          }
        }
      }
    }
    
    await client.query(
      `UPDATE documents 
       SET status = $1
       WHERE id = $2`,
      [newStatus, id]
    );
    
    await createAuditLog(id, req.user.id, action, newStatus, notes, req);
    
    await client.query('COMMIT');
    
    res.json({ message: `Document ${action}d successfully`, newStatus });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Approve document error:', error);
    res.status(500).json({ error: 'Failed to approve document' });
  } finally {
    client.release();
  }
};

module.exports = {
  approveDocument
};
