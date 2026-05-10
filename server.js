'use strict';

const express    = require('express');
const nodemailer = require('nodemailer');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Contact form endpoint ─────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { name, phone, email, service, message } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ success: false, error: 'Missing required fields.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from:    `"PMK Remodeling Website" <${process.env.SMTP_USER}>`,
      to:      process.env.CONTACT_EMAIL || 'info@pmkremodeling.com',
      replyTo: email,
      subject: `New Quote Request — ${service || 'General Inquiry'}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <table cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
          <tr><td><strong>Name</strong></td><td>${name}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${phone}</td></tr>
          <tr><td><strong>Email</strong></td><td>${email}</td></tr>
          <tr><td><strong>Service</strong></td><td>${service || '—'}</td></tr>
          <tr><td><strong>Message</strong></td><td>${message || '—'}</td></tr>
        </table>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Mail error:', err.message);
    // Still return success to the user — email config may not be set yet
    res.json({ success: true });
  }
});

// ── Catch-all: serve index.html ───────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`PMK Remodeling LLC running on port ${PORT}`);
});
