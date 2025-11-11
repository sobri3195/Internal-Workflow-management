const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function seed() {
  try {
    console.log('Starting database seeding...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await pool.query(`
      INSERT INTO users (username, email, password, full_name, role, unit_kerja) VALUES
      ('admin', 'admin@company.com', $1, 'Administrator', 'admin', 'IT Department'),
      ('submitter1', 'submitter1@company.com', $1, 'John Doe', 'submitter', 'Finance Department'),
      ('reviewer1', 'reviewer1@company.com', $1, 'Jane Smith', 'reviewer1', 'Legal Department'),
      ('reviewer2', 'reviewer2@company.com', $1, 'Bob Johnson', 'reviewer2', 'Compliance Department'),
      ('reviewer3', 'reviewer3@company.com', $1, 'Alice Williams', 'reviewer3', 'Quality Assurance'),
      ('approver1', 'approver1@company.com', $1, 'Charlie Brown', 'approver', 'Management'),
      ('signer1', 'signer1@company.com', $1, 'David Lee', 'signer', 'Executive Office')
      ON CONFLICT (username) DO NOTHING
    `, [hashedPassword]);
    
    console.log('Database seeding completed successfully!');
    console.log('Default users created with password: password123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
