const LABELS = {
    phone: 'Phone',
    vehicle: 'Vehicle',
    pickup_date: 'Pick-Up Date',
    return_date: 'Return Date',
    pickup_location: 'Pick-Up Location',
    dropoff_location: 'Drop-Off Location',
    add_driver: 'Professional Driver Requested',
    licence_no: "Driver's Licence No.",
    payment_method: 'Payment Method',
    subject: 'Subject',
    car: 'Car',
    notes: 'Notes',
    message: 'Message',
};

function field(body, key) {
    const value = body[key];
    return typeof value === 'string' ? value.trim() : '';
}

function stripTags(value) {
    return value.replace(/<[^>]*>/g, '');
}

function singleLine(value) {
    return value.replace(/[\r\n]+/g, ' ');
}

function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function buildDetailRows(body) {
    const rows = [];
    for (const [key, label] of Object.entries(LABELS)) {
        const raw = body[key];
        if (raw !== undefined && raw !== null && String(raw).trim() !== '') {
            rows.push([label, singleLine(stripTags(String(raw).trim()))]);
        }
    }
    return rows;
}

function buildTextBody(formType, name, email, rows) {
    let text = `Form: ${formType}\n`;
    text += `Name: ${name}\n`;
    text += `Email: ${email}\n`;
    for (const [label, value] of rows) {
        text += `${label}: ${value}\n`;
    }
    return text;
}

function buildHtmlBody(formType, name, email, rows) {
    const detailRows = rows
        .map(
            ([label, value]) => `
            <tr>
                <td style="padding:8px 12px;color:#6b7280;font-size:14px;white-space:nowrap;">${escapeHtml(label)}</td>
                <td style="padding:8px 12px;color:#111827;font-size:14px;">${escapeHtml(value)}</td>
            </tr>`
        )
        .join('');

    return `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;">
        <div style="background:#111827;padding:20px 24px;border-radius:8px 8px 0 0;">
            <span style="color:#fff;font-size:18px;font-weight:600;">Chaliko Car Hire</span>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
            <p style="margin:0 0 16px;font-size:16px;color:#111827;">
                New <strong>${escapeHtml(formType)}</strong> from <strong>${escapeHtml(name)}</strong>
            </p>
            <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:6px;overflow:hidden;">
                <tr>
                    <td style="padding:8px 12px;color:#6b7280;font-size:14px;white-space:nowrap;">Email</td>
                    <td style="padding:8px 12px;color:#111827;font-size:14px;">${escapeHtml(email)}</td>
                </tr>
                ${detailRows}
            </table>
            <p style="margin:20px 0 0;font-size:13px;color:#9ca3af;">
                Reply to this email to respond directly to ${escapeHtml(name)}.
            </p>
        </div>
    </div>`;
}

async function handleMailer(request, env) {
    const contentType = request.headers.get('content-type') || '';
    let body = {};
    if (contentType.includes('application/json')) {
        body = await request.json();
    } else {
        const formData = await request.formData();
        body = Object.fromEntries(formData.entries());
    }

    const name = singleLine(stripTags(field(body, 'full_name') || field(body, 'name')));
    const email = field(body, 'email');
    const formType = stripTags(field(body, 'form_type')) || 'Website Message';

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !emailPattern.test(email)) {
        return new Response('Oops! There was a problem with your submission. Please complete the form and try again.', { status: 400 });
    }

    const subject = `Chaliko Car Hire - ${formType} from ${name}`;
    const rows = buildDetailRows(body);

    const recipients = (env.NOTIFY_EMAILS || 'mulimamulala4@gmail.com')
        .split(',')
        .map((addr) => addr.trim())
        .filter(Boolean);
    const from = env.NOTIFY_FROM || 'Chaliko Website <onboarding@resend.dev>';

    try {
        const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from,
                to: recipients,
                reply_to: `${name} <${email}>`,
                subject,
                text: buildTextBody(formType, name, email, rows),
                html: buildHtmlBody(formType, name, email, rows),
            }),
        });

        if (!resendRes.ok) {
            console.error('Resend error:', await resendRes.text());
            return new Response("Oops! Something went wrong and we couldn't send your message. Please call us instead.", { status: 500 });
        }

        return new Response("Thank you! Your message has been sent - we'll be in touch within 2 hours.", { status: 200 });
    } catch (err) {
        console.error('mailer error:', err);
        return new Response("Oops! Something went wrong and we couldn't send your message. Please call us instead.", { status: 500 });
    }
}

const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data:",
        "font-src 'self' data: https://fonts.gstatic.com",
        "connect-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
    ].join('; '),
};

function withSecurityHeaders(response) {
    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
        headers.set(name, value);
    }
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (url.pathname === '/api/mailer') {
            if (request.method === 'POST') {
                return withSecurityHeaders(await handleMailer(request, env));
            }
            return withSecurityHeaders(new Response('Method not allowed', { status: 405 }));
        }

        return withSecurityHeaders(await env.ASSETS.fetch(request));
    },
};
