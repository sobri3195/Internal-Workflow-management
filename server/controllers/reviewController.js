const pool = require('../config/database');
const { createAuditLog } = require('../utils/auditLog');
const { notifyReviewer, notifyApprover, notifySubmitter } = require('../utils/notifications');

const reviewDocument = async (req, res) => {
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
    
    if (document.current_reviewer_id !== req.user.id) {
      return res.status(403).json({ error: 'You are not assigned to review this document' });
    }
    
    const validActions = ['approve', 'reject', 'request_changes'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    await client.query(
      `UPDATE workflow_assignments 
       SET completed_at = CURRENT_TIMESTAMP, is_completed = true, action = $1, notes = $2
       WHERE document_id = $3 AND assigned_to = $4 AND is_completed = false`,
      [action, notes, id, req.user.id]
    );
    
    let newStatus = document.status;
    let nextReviewerId = null;
    
    if (action === 'reject') {
      newStatus = 'rejected';
      await notifySubmitter(document.submitter_email, document.title, 'Rejected', notes);
    } else if (action === 'request_changes') {
      newStatus = 'revision';
      await notifySubmitter(document.submitter_email, document.title, 'Revision Requested', notes);
    } else if (action === 'approve') {
      if (document.status === 'review1') {
        const reviewer2Result = await client.query(
          'SELECT id, email FROM users WHERE role = $1 AND is_active = true LIMIT 1',
          ['reviewer2']
        );
        
        if (reviewer2Result.rows.length > 0) {
          newStatus = 'review2';
          nextReviewerId = reviewer2Result.rows[0].id;
          
          await client.query(
            `INSERT INTO workflow_assignments (document_id, stage, assigned_to, deadline)
             VALUES ($1, 'review2', $2, CURRENT_TIMESTAMP + INTERVAL '3 days')`,
            [id, nextReviewerId]
          );
          
          await notifyReviewer(reviewer2Result.rows[0].email, document.title, id);
        } else {
          newStatus = 'approve';
          
          const approverResult = await client.query(
            'SELECT id, email FROM users WHERE role = $1 AND is_active = true LIMIT 1',
            ['approver']
          );
          
          if (approverResult.rows.length > 0) {
            nextReviewerId = approverResult.rows[0].id;
            await notifyApprover(approverResult.rows[0].email, document.title, id);
          }
        }
      } else if (document.status === 'review2') {
        const reviewer3Result = await client.query(
          'SELECT id, email FROM users WHERE role = $1 AND is_active = true LIMIT 1',
          ['reviewer3']
        );
        
        if (reviewer3Result.rows.length > 0) {
          newStatus = 'review3';
          nextReviewerId = reviewer3Result.rows[0].id;
          
          await client.query(
            `INSERT INTO workflow_assignments (document_id, stage, assigned_to, deadline)
             VALUES ($1, 'review3', $2, CURRENT_TIMESTAMP + INTERVAL '3 days')`,
            [id, nextReviewerId]
          );
          
          await notifyReviewer(reviewer3Result.rows[0].email, document.title, id);
        } else {
          newStatus = 'approve';
          
          const approverResult = await client.query(
            'SELECT id, email FROM users WHERE role = $1 AND is_active = true LIMIT 1',
            ['approver']
          );
          
          if (approverResult.rows.length > 0) {
            nextReviewerId = approverResult.rows[0].id;
            await notifyApprover(approverResult.rows[0].email, document.title, id);
          }
        }
      } else if (document.status === 'review3') {
        newStatus = 'approve';
        
        const approverResult = await client.query(
          'SELECT id, email FROM users WHERE role = $1 AND is_active = true LIMIT 1',
          ['approver']
        );
        
        if (approverResult.rows.length > 0) {
          nextReviewerId = approverResult.rows[0].id;
          await notifyApprover(approverResult.rows[0].email, document.title, id);
        }
      }
    }
    
    await client.query(
      `UPDATE documents 
       SET status = $1, current_reviewer_id = $2
       WHERE id = $3`,
      [newStatus, nextReviewerId, id]
    );
    
    await createAuditLog(id, req.user.id, action, newStatus, notes, req);
    
    await client.query('COMMIT');
    
    res.json({ message: `Document ${action}d successfully`, newStatus });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Review document error:', error);
    res.status(500).json({ error: 'Failed to review document' });
  } finally {
    client.release();
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, is_inline, inline_position } = req.body;
    
    const docResult = await pool.query(
      'SELECT status FROM documents WHERE id = $1',
      [id]
    );
    
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const document = docResult.rows[0];
    
    const result = await pool.query(
      `INSERT INTO comments (document_id, user_id, stage, comment, is_inline, inline_position)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, req.user.id, document.status, comment, is_inline || false, inline_position]
    );
    
    await createAuditLog(id, req.user.id, 'comment', document.status, comment, req);
    
    res.status(201).json({ comment: result.rows[0] });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

module.exports = {
  reviewDocument,
  addComment
};
