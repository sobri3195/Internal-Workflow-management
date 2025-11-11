const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

const uploadAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const docResult = await pool.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );
    
    if (docResult.rows.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const document = docResult.rows[0];
    
    if (document.is_locked) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Document is locked and cannot be modified' });
    }
    
    const versionResult = await pool.query(
      'SELECT COALESCE(MAX(version), 0) + 1 as next_version FROM attachments WHERE document_id = $1',
      [id]
    );
    
    const version = versionResult.rows[0].next_version;
    
    const result = await pool.query(
      `INSERT INTO attachments (document_id, filename, original_filename, file_path, file_size, mime_type, version, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        id,
        req.file.filename,
        req.file.originalname,
        req.file.path,
        req.file.size,
        req.file.mimetype,
        version,
        req.user.id
      ]
    );
    
    res.status(201).json({ attachment: result.rows[0] });
  } catch (error) {
    console.error('Upload attachment error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload attachment' });
  }
};

const downloadAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM attachments WHERE id = $1',
      [attachmentId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    
    const attachment = result.rows[0];
    
    if (!fs.existsSync(attachment.file_path)) {
      return res.status(404).json({ error: 'File not found on server' });
    }
    
    res.download(attachment.file_path, attachment.original_filename);
  } catch (error) {
    console.error('Download attachment error:', error);
    res.status(500).json({ error: 'Failed to download attachment' });
  }
};

const deleteAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    
    const result = await pool.query(
      `SELECT a.*, d.is_locked, d.submitter_id
       FROM attachments a
       LEFT JOIN documents d ON a.document_id = d.id
       WHERE a.id = $1`,
      [attachmentId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    
    const attachment = result.rows[0];
    
    if (attachment.is_locked) {
      return res.status(400).json({ error: 'Document is locked and attachments cannot be deleted' });
    }
    
    if (attachment.submitter_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this attachment' });
    }
    
    await pool.query('DELETE FROM attachments WHERE id = $1', [attachmentId]);
    
    if (fs.existsSync(attachment.file_path)) {
      fs.unlinkSync(attachment.file_path);
    }
    
    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
};

module.exports = {
  uploadAttachment,
  downloadAttachment,
  deleteAttachment
};
