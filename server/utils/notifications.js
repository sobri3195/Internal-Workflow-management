const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendNotification = async (to, subject, html) => {
  try {
    if (!process.env.SMTP_USER) {
      console.log('Email not configured. Notification would be sent to:', to);
      console.log('Subject:', subject);
      return;
    }
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Email error:', error);
  }
};

const notifyReviewer = async (reviewerEmail, documentTitle, documentId) => {
  const subject = 'New Document for Review';
  const html = `
    <h2>New Document Requires Your Review</h2>
    <p>A new document has been submitted and requires your review.</p>
    <p><strong>Document:</strong> ${documentTitle}</p>
    <p><strong>Document ID:</strong> ${documentId}</p>
    <p>Please log in to the workflow management system to review this document.</p>
  `;
  await sendNotification(reviewerEmail, subject, html);
};

const notifyApprover = async (approverEmail, documentTitle, documentId) => {
  const subject = 'Document Requires Approval';
  const html = `
    <h2>Document Requires Your Approval</h2>
    <p>A document has completed all review stages and requires your approval.</p>
    <p><strong>Document:</strong> ${documentTitle}</p>
    <p><strong>Document ID:</strong> ${documentId}</p>
    <p>Please log in to the workflow management system to approve this document.</p>
  `;
  await sendNotification(approverEmail, subject, html);
};

const notifySigner = async (signerEmail, documentTitle, documentId) => {
  const subject = 'Document Ready for Signature';
  const html = `
    <h2>Document Ready for Your Signature</h2>
    <p>A document has been approved and is ready for your signature.</p>
    <p><strong>Document:</strong> ${documentTitle}</p>
    <p><strong>Document ID:</strong> ${documentId}</p>
    <p>Please log in to the workflow management system to sign this document.</p>
  `;
  await sendNotification(signerEmail, subject, html);
};

const notifySubmitter = async (submitterEmail, documentTitle, action, notes) => {
  const subject = `Document ${action}`;
  const html = `
    <h2>Document Status Update</h2>
    <p>Your document has been ${action.toLowerCase()}.</p>
    <p><strong>Document:</strong> ${documentTitle}</p>
    ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
    <p>Please log in to the workflow management system for more details.</p>
  `;
  await sendNotification(submitterEmail, subject, html);
};

const sendDeadlineReminder = async (userEmail, documentTitle, deadline) => {
  const subject = 'Deadline Reminder';
  const html = `
    <h2>Document Review Deadline Approaching</h2>
    <p>This is a reminder that a document review is approaching its deadline.</p>
    <p><strong>Document:</strong> ${documentTitle}</p>
    <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleString()}</p>
    <p>Please log in to the workflow management system to complete your review.</p>
  `;
  await sendNotification(userEmail, subject, html);
};

module.exports = {
  sendNotification,
  notifyReviewer,
  notifyApprover,
  notifySigner,
  notifySubmitter,
  sendDeadlineReminder,
};
