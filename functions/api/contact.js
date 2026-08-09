// Cloudflare Pages Function — deployed automatically alongside the static
// Astro build (Pages picks up /functions at the repo root; no Astro config
// or adapter needed). Replaces the old Tally iframe: this is the only thing
// standing between the contact form and CEO@AexMeridian.com actually
// receiving a lead, so failures are reported back to the browser rather
// than swallowed.
//
// Requires one Cloudflare Pages secret to actually send mail:
//   RESEND_API_KEY — a Resend (resend.com) API key. Free tier is plenty
//   for this volume. Until it's set, this function still validates input
//   and returns a clear error instead of a silent 500, so the front end's
//   fallback messaging has something real to react to.
//
// Requires aexmeridian.com to be verified as a sending domain in Resend
// (SPF/DKIM/DMARC records) before this address will actually send —
// until then, Resend will reject mail from it.
const FROM_ADDRESS = 'Aex Meridian Website <noreply@aexmeridian.com>';
const TO_ADDRESS = 'CEO@AexMeridian.com';

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
  ));

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
  }

  // Honeypot — a field real visitors never see or fill (hidden off-screen
  // in the form below). Bots that fill every field trip this instead of
  // being silently accepted or loudly rejected.
  if (body.company) {
    return Response.json({ ok: true });
  }

  const businessName = String(body.businessName ?? '').trim();
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const website = String(body.website ?? '').trim();
  const message = String(body.message ?? '').trim();

  const errors = {};
  if (!businessName) errors.businessName = 'Business name is required.';
  if (!name) errors.name = 'Your name is required.';
  if (!email) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, error: 'Please fix the highlighted fields.', fields: errors }, { status: 422 });
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    // Not configured yet — tell the truth rather than pretend it sent.
    return Response.json(
      { ok: false, error: 'Form is not fully configured yet. Please email us directly for now.' },
      { status: 503 }
    );
  }

  const lines = [
    `Business: ${businessName}`,
    `Name: ${name}`,
    `Email: ${email}`,
    phone && `Phone: ${phone}`,
    website && `Website: ${website}`,
    '',
    message || '(no message provided)',
  ].filter(Boolean);

  const htmlLines = [
    `<p><strong>Business:</strong> ${escapeHtml(businessName)}</p>`,
    `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
    phone && `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>`,
    website && `<p><strong>Website:</strong> ${escapeHtml(website)}</p>`,
    `<p><strong>Message:</strong><br>${escapeHtml(message || '(no message provided)').replace(/\n/g, '<br>')}</p>`,
  ].filter(Boolean);

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [TO_ADDRESS],
        reply_to: email,
        subject: `New inquiry from ${businessName} (via AexMeridian.com)`,
        text: lines.join('\n'),
        html: htmlLines.join('\n'),
      }),
    });

    if (!resendResponse.ok) {
      const detail = await resendResponse.text().catch(() => '');
      console.error('Resend send failed', resendResponse.status, detail);
      return Response.json({ ok: false, error: 'Could not send your message. Please email us directly.' }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Resend request threw', err);
    return Response.json({ ok: false, error: 'Could not send your message. Please email us directly.' }, { status: 502 });
  }
}
