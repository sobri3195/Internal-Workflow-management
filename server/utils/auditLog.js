const pool = require('../config/database');

const createAuditLog = async (documentId, userId, action, stage, details, req) => {
  try {
    const ipAddress = req?.ip || req?.connection?.remoteAddress || null;
    const userAgent = req?.headers['user-agent'] || null;
    
    await pool.query(
      `INSERT INTO audit_logs (document_id, user_id, action, stage, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [documentId, userId, action, stage, details, ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

module.exports = { createAuditLog };
