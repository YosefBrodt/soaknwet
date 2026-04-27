// Vercel serverless function — receives contact form submissions
// from contact.html and sends a formatted SMS to each configured
// recipient via Twilio.
//
// Required env vars (set in Vercel → Project → Settings → Environment Variables):
//   TWILIO_ACCOUNT_SID   — from Twilio console
//   TWILIO_AUTH_TOKEN    — from Twilio console
//   TWILIO_FROM_NUMBER   — your Twilio number in E.164 format, e.g. +16135551234
//   RECIPIENT_PHONE      — comma-separated list of E.164 numbers to alert.
//                          First one is primary (Pierre). Add Yosef's cell too
//                          so every lead also hits the agency in real time.
//                          Example: "+16135550123,+15145550456"
//
// See SETUP.md at the repo root for the full step-by-step.

const twilio = require('twilio');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vercel parses JSON automatically when Content-Type is application/json,
  // but fall back to manual parse if something upstream forwards the raw string.
  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (err) {
      console.error('Body parse failed:', err && err.message);
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  // Honeypot — bots fill every field. Real users never see the hidden input.
  if (body.website) {
    console.warn('Honeypot triggered, dropping submission. IP:', req.headers['x-forwarded-for'] || 'unknown');
    return res.status(200).json({ ok: true });
  }

  const pick = (key) => (typeof body[key] === 'string' ? body[key].trim() : '');
  const name = pick('name');
  const phone = pick('phone');
  const email = pick('email');
  const service = pick('service');
  const location = pick('location');
  const timing = pick('timing');
  const volume = pick('volume');
  const message = pick('message');

  if (!name || !phone || !service) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Phone must contain at least 10 digits. Catches "asdf" and bot junk.
  if ((phone.match(/\d/g) || []).length < 10) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  // Real water-delivery customers don't paste links. SEO spam bots always do.
  if (/https?:\/\/|www\./i.test(message) || /https?:\/\/|www\./i.test(name)) {
    console.warn('Link spam dropped. IP:', req.headers['x-forwarded-for'] || 'unknown');
    return res.status(200).json({ ok: true });
  }

  // Length caps. Anything past these is junk, not a lead.
  if (name.length > 120 || phone.length > 40 || email.length > 200 || message.length > 2000) {
    return res.status(400).json({ error: 'Field too long' });
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const toRaw = process.env.RECIPIENT_PHONE;

  if (!sid || !token || !from || !toRaw) {
    console.error('Missing Twilio env vars', {
      hasSid: !!sid,
      hasToken: !!token,
      hasFrom: !!from,
      hasTo: !!toRaw,
    });
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const recipients = toRaw
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    console.error('RECIPIENT_PHONE is set but empty after parsing');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const smsBody = formatSmsBody({ name, phone, email, service, location, timing, volume, message });

  const client = twilio(sid, token);

  const results = await Promise.allSettled(
    recipients.map((to) =>
      client.messages.create({
        body: smsBody,
        from,
        to,
      })
    )
  );

  const failures = results
    .map((r, i) => ({ r, to: recipients[i] }))
    .filter(({ r }) => r.status === 'rejected');

  if (failures.length === recipients.length) {
    // Every recipient failed — surface an error so the form shows the fallback-call alert.
    failures.forEach(({ r, to }) => {
      console.error('Twilio send failed for', to, r.reason && r.reason.message ? r.reason.message : r.reason);
    });
    return res.status(500).json({ error: 'Failed to send notification' });
  }

  if (failures.length > 0) {
    // Some recipients failed — Pierre still got it, log the rest and return ok.
    failures.forEach(({ r, to }) => {
      console.warn('Twilio send failed for', to, r.reason && r.reason.message ? r.reason.message : r.reason);
    });
  }

  return res.status(200).json({ ok: true });
};

// ---------- formatting helpers ----------

function formatSmsBody({ name, phone, email, service, location, timing, volume, message }) {
  const prettyPhone = formatPhone(phone);
  const header = `🚰 Soak N Wet lead — ${name} ${prettyPhone}`;

  const summaryParts = [service, location, timing].filter(Boolean);
  const summary = summaryParts.join(' · ');

  const lines = [header];
  if (summary) lines.push(summary);

  const details = [];
  if (volume) details.push(`Volume: ${volume}`);
  if (email) details.push(`Email: ${email}`);
  if (details.length) {
    lines.push('');
    lines.push(...details);
  }

  if (message) {
    lines.push('');
    lines.push(`"${message}"`);
  }

  lines.push('');
  lines.push(`Submitted ${nowInToronto()} ET`);

  return lines.join('\n');
}

function formatPhone(raw) {
  const digits = (raw || '').replace(/[^\d]/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return raw.trim();
}

function nowInToronto() {
  // Example output: "Wed Apr 22, 6:42 PM"
  try {
    return new Date().toLocaleString('en-CA', {
      timeZone: 'America/Toronto',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (err) {
    return new Date().toISOString();
  }
}

// Exported for smoke tests. Keeps the module interface stable.
module.exports.formatSmsBody = formatSmsBody;
module.exports.formatPhone = formatPhone;
