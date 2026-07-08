/**
 * Enquiry submission - Vercel serverless function.
 * Replaces the undeployed Python backend route (/api/v1/enquiry/submit).
 * Sends a team notification + client auto-response via Resend.
 * Requires RESEND_API_KEY in the Vercel project environment.
 */
const RESEND_API_URL = 'https://api.resend.com/emails';
const SENDER_EMAIL = 'Altera Terra <enquire@alteraterra.vip>';
const TEAM_EMAIL = 'enquire@alteraterra.vip';

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const BLOCKED_DOMAINS = ['example.com', 'test.com', 'fake.com', 'mailinator.com'];

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function sendEmail(apiKey, payload) {
  const resp = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await resp.json().catch(() => ({}));
  if (resp.ok) return { success: true, id: data.id };
  console.error('EMAIL_SEND_FAILED', resp.status, JSON.stringify(data));
  return { success: false };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const body = req.body || {};
  const fullName = String(body.full_name || '').trim();
  const emailRaw = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').trim();
  const areaOfInterest = String(body.area_of_interest || '').trim();
  const message = String(body.message || '').trim();

  if (!fullName || !emailRaw || !areaOfInterest || !message) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  const domain = emailRaw.split('@')[1] || '';
  if (!EMAIL_RE.test(emailRaw) || emailRaw.includes('..') || BLOCKED_DOMAINS.includes(domain)) {
    return res.status(400).json({ success: false, message: 'Invalid email address' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('ENQUIRY_BLOCKED: RESEND_API_KEY not configured');
    return res.status(200).json({
      success: false,
      message:
        'We were unable to process your enquiry at this time. Please try again or contact us directly at enquire@alteraterra.vip.',
    });
  }

  console.log(`ENQUIRY_RECEIVED: name='${fullName}', email='${emailRaw}', interest='${areaOfInterest}'`);

  // ponytail: no DB save - the team email plus the BCC copy on the auto-response is the record.
  const teamHtml = `
    <div style="font-family: Georgia, serif; color: #333; max-width: 600px; margin: 0 auto; padding: 30px;">
      <h2 style="color: #D4885A; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; font-size: 14px;">New Consultation Request</h2>
      <hr style="border: none; border-top: 1px solid #D4885A; opacity: 0.3; margin: 20px 0;" />
      <p><strong>Name:</strong> ${esc(fullName)}</p>
      <p><strong>Email:</strong> ${esc(emailRaw)}</p>
      <p><strong>Phone:</strong> ${esc(phone || 'Not provided')}</p>
      <p><strong>Area of Interest:</strong> ${esc(areaOfInterest)}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap; line-height: 1.8;">${esc(message)}</p>
      <hr style="border: none; border-top: 1px solid #D4885A; opacity: 0.3; margin: 30px 0;" />
      <p style="font-size: 12px; color: #999;">This enquiry was submitted via the Altera Terra website.</p>
    </div>`;

  const clientHtml = `
    <div style="font-family: Georgia, serif; color: #333; max-width: 600px; margin: 0 auto; padding: 40px 30px;">
      <p style="line-height: 1.9; font-size: 15px;">Dear Visionary,</p>
      <p style="line-height: 1.9; font-size: 15px;">Your message has been received, and with it, the first note of a possible journey.</p>
      <p style="line-height: 1.9; font-size: 15px;">At Altera Terra, we do not see enquiries as transactions, but as the early expression of something more singular: a desire, a perspective, a world waiting to be shaped with nuance and intention.</p>
      <p style="line-height: 1.9; font-size: 15px;">Please allow us a little time to return to you with the consideration your message deserves.</p>
      <p style="line-height: 1.9; font-size: 15px;">We will be in touch shortly.</p>
      <br />
      <p style="line-height: 1.9; font-size: 15px;">Yours faithfully,</p>
      <p style="line-height: 1.9; font-size: 15px; color: #D4885A; letter-spacing: 1px;">Altera Terra</p>
    </div>`;

  const [team, client] = await Promise.all([
    sendEmail(apiKey, {
      from: SENDER_EMAIL,
      to: [TEAM_EMAIL],
      reply_to: emailRaw,
      subject: 'New Consultation Request - Altera Terra',
      html: teamHtml,
    }),
    sendEmail(apiKey, {
      from: SENDER_EMAIL,
      to: [emailRaw],
      reply_to: TEAM_EMAIL,
      bcc: [TEAM_EMAIL],
      subject: 'Your enquiry has been received - Altera Terra',
      html: clientHtml,
    }),
  ]);

  if (team.success && client.success) {
    console.log(`ENQUIRY_COMPLETE: team=${team.id}, client=${client.id}`);
    return res.status(200).json({ success: true, message: null });
  }

  console.error(`ENQUIRY_PARTIAL_FAILURE: team=${team.success}, client=${client.success}`);
  return res.status(200).json({
    success: false,
    message:
      'We encountered an issue sending confirmation emails. Please try again or contact us directly at enquire@alteraterra.vip.',
  });
}
