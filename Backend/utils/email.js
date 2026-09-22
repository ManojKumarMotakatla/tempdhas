// ============================================================
// DHAS — Backend/utils/email.js
// Sends transactional emails via Brevo (Sendinblue) REST API.
// No extra npm package required — uses native fetch (Node 18+).
//
// Required env vars on Render:
//   BREVO_API_KEY       = xkeysib-...
//   BREVO_SENDER_EMAIL  = verified sender address
//   BREVO_SENDER_NAME   = DHAS Health  (optional)
//   FRONTEND_URL        = https://tempdhas.onrender.com
// ============================================================

async function sendPasswordResetEmail({ toEmail, toName, resetLink, role }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "DHAS Health";

  if (!apiKey || !senderEmail) {
    console.error("Brevo: BREVO_API_KEY or BREVO_SENDER_EMAIL missing in environment.");
    return { success: false, error: "Email service not configured" };
  }

  const htmlContent = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;">
      <div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
        <h2 style="color:#0f766e;margin:0 0 12px;font-size:22px;">Reset your DHAS password</h2>
        <p style="color:#334155;font-size:15px;line-height:1.5;margin:0 0 8px;">
          Hi ${toName || "there"},
        </p>
        <p style="color:#334155;font-size:15px;line-height:1.5;margin:0 0 24px;">
          We received a request to reset the password for your DHAS
          <strong>${role}</strong> account (<strong>${toEmail}</strong>).
        </p>
        <p style="margin:0 0 28px;text-align:center;">
          <a href="${resetLink}"
             style="background:#0f766e;color:#ffffff;padding:14px 28px;border-radius:8px;
                    text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0 0 8px;">
          This link expires in <strong>30 minutes</strong> and can be used only once.
        </p>
        <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0;">
          If you did not request this, you can safely ignore this email — your password will not change.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">
          DHAS — Digital Health Assistant System<br>
          <a href="${process.env.FRONTEND_URL || "https://tempdhas.onrender.com"}"
             style="color:#0f766e;text-decoration:none;">${process.env.FRONTEND_URL || "https://tempdhas.onrender.com"}</a>
        </p>
      </div>
    </div>
  `;

  const body = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail, name: toName || "User" }],
    subject: "Reset your DHAS password",
    htmlContent
  };

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify(body)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Brevo API error:", res.status, JSON.stringify(data));
      return { success: false, error: data.message || `HTTP ${res.status}` };
    }

    console.log("Brevo email sent OK — messageId:", data.messageId || "(none)");
    return { success: true, messageId: data.messageId };
  } catch (err) {
    console.error("Brevo fetch error:", err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendPasswordResetEmail };