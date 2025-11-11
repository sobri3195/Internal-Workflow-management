const pool = require('../config/database');
const { createAuditLog } = require('../utils/auditLog');
const { notifySigner } = require('../utils/notifications');

const signDocument = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { signature_type, certificate_info, signature_data } = req.body;
    
    const docResult = await client.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );
    
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const document = docResult.rows[0];
    
    if (req.user.role !== 'signer' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only signers can sign documents' });
    }
    
    if (document.status !== 'sign') {
      return res.status(400).json({ error: 'Document is not ready for signature' });
    }
    
    const signatureResult = await client.query(
      `SELECT * FROM signature_logs 
       WHERE document_id = $1 AND signer_id = $2 AND signature_status = 'pending'`,
      [id, req.user.id]
    );
    
    if (signatureResult.rows.length === 0) {
      return res.status(400).json({ error: 'No pending signature found for this user' });
    }
    
    const signature = signatureResult.rows[0];
    
    if (signature.is_sequential) {
      const previousSignatureResult = await client.query(
        `SELECT * FROM signature_logs 
         WHERE document_id = $1 AND sequence_order < $2 AND signature_status != 'signed'`,
        [id, signature.sequence_order]
      );
      
      if (previousSignatureResult.rows.length > 0) {
        return res.status(400).json({ error: 'Previous signatures must be completed first' });
      }
    }
    
    await client.query(
      `UPDATE signature_logs 
       SET signature_status = 'signed', 
           signature_type = $1,
           certificate_info = $2,
           signature_data = $3,
           signed_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [signature_type, certificate_info, signature_data, signature.id]
    );
    
    const pendingSignaturesResult = await client.query(
      `SELECT * FROM signature_logs 
       WHERE document_id = $1 AND signature_status = 'pending'`,
      [id]
    );
    
    if (pendingSignaturesResult.rows.length === 0) {
      await client.query(
        `UPDATE documents 
         SET status = 'archived', 
             signed_at = CURRENT_TIMESTAMP,
             archived_at = CURRENT_TIMESTAMP,
             is_locked = true,
             retention_date = CURRENT_TIMESTAMP + INTERVAL '${process.env.RETENTION_YEARS || 7} years'
         WHERE id = $1`,
        [id]
      );
      
      await createAuditLog(id, req.user.id, 'archive', 'archived', 'All signatures completed, document archived', req);
    } else {
      if (signature.is_sequential) {
        const nextSignatureResult = await client.query(
          `SELECT sl.*, u.email 
           FROM signature_logs sl
           LEFT JOIN users u ON sl.signer_id = u.id
           WHERE sl.document_id = $1 AND sl.sequence_order = $2`,
          [id, signature.sequence_order + 1]
        );
        
        if (nextSignatureResult.rows.length > 0) {
          const nextSigner = nextSignatureResult.rows[0];
          await notifySigner(nextSigner.email, document.title, id);
        }
      }
    }
    
    await createAuditLog(id, req.user.id, 'sign', document.status, 'Document signed', req);
    
    await client.query('COMMIT');
    
    res.json({ message: 'Document signed successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Sign document error:', error);
    res.status(500).json({ error: 'Failed to sign document' });
  } finally {
    client.release();
  }
};

const getSignatureStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT sl.*, u.full_name as signer_name, u.email as signer_email
       FROM signature_logs sl
       LEFT JOIN users u ON sl.signer_id = u.id
       WHERE sl.document_id = $1
       ORDER BY sl.sequence_order`,
      [id]
    );
    
    res.json({ signatures: result.rows });
  } catch (error) {
    console.error('Get signature status error:', error);
    res.status(500).json({ error: 'Failed to get signature status' });
  }
};

module.exports = {
  signDocument,
  getSignatureStatus
};
