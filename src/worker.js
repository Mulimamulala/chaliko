const LABELS = {
    phone: 'Phone',
    vehicle: 'Vehicle',
    pickup_date: 'Pick-Up Date',
    return_date: 'Return Date',
    pickup_location: 'Pick-Up Location',
    dropoff_location: 'Drop-Off Location',
    add_driver: 'Professional Driver Requested',
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
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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

function isTrustedOrigin(request) {
    const siteOrigin = new URL(request.url).origin;
    const origin = request.headers.get('origin');
    if (origin) return origin === siteOrigin;
    const referer = request.headers.get('referer');
    if (referer) {
        try {
            return new URL(referer).origin === siteOrigin;
        } catch {
            return false;
        }
    }
    // No Origin/Referer at all is unusual for a browser form POST; treat as untrusted.
    return false;
}

// --- Mailer limits ----------------------------------------------------------
// The forms are small; anything bigger than this is not a real visitor.
const MAX_BODY_BYTES = 16 * 1024;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_FIELD_LENGTH = 300;
const MAX_LONG_FIELD_LENGTH = 5000; // message / notes
const LONG_FIELDS = new Set(['message', 'notes']);

// Only these subjects can appear in the notification email. Anything else a
// client sends is replaced with the generic label rather than echoed.
const FORM_TYPES = new Set(['Booking Request', 'Contact Message', 'Quick Enquiry (Homepage)']);

// Stricter than "anything@anything.tld": no quotes, angle brackets, commas,
// semicolons or whitespace, so the address can't smuggle extra recipients or
// display names into reply_to.
const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

const MSG_SENT = "Thank you! Your message has been sent - we'll be in touch within 2 hours.";
const MSG_INVALID = 'Oops! There was a problem with your submission. Please complete the form and try again.';
const MSG_FAILED = "Oops! Something went wrong and we couldn't send your message. Please call us instead.";
const MSG_RATE_LIMITED = 'Too many messages in a short time. Please wait a minute and try again, or call us.';

function textResponse(body, status, extraHeaders) {
    return new Response(body, {
        status,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', ...extraHeaders },
    });
}

// Removes characters that have meaning inside an email display name
// ("Name" <addr>) plus control characters, then trims and caps the length.
function safeDisplayName(value) {
    return value
        .replace(/[\u0000-\u001F\u007F"<>,;:\\@()[\]]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, MAX_NAME_LENGTH);
}

// Caps every submitted string so one oversized field can't bloat the email.
function capFields(body) {
    const capped = {};
    for (const [key, value] of Object.entries(body)) {
        if (typeof value !== 'string') continue;
        const max = LONG_FIELDS.has(key) ? MAX_LONG_FIELD_LENGTH : MAX_FIELD_LENGTH;
        capped[key] = value.slice(0, max);
    }
    return capped;
}

async function readBody(request) {
    const declared = Number(request.headers.get('content-length') || 0);
    if (declared > MAX_BODY_BYTES) return { error: 413 };

    // Read as text with a hard cap (content-length can be absent or wrong).
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return { error: 413 };

    const contentType = request.headers.get('content-type') || '';
    try {
        if (contentType.includes('application/json')) {
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { error: 400 };
            return { body: parsed };
        }
        return { body: Object.fromEntries(new URLSearchParams(raw).entries()) };
    } catch {
        return { error: 400 };
    }
}

async function isRateLimited(request, env) {
    // Bound in wrangler.jsonc ("ratelimits"). Absent in plain local dev, in
    // which case the check is skipped rather than blocking every request.
    if (!env.MAILER_LIMITER) return false;
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    try {
        const { success } = await env.MAILER_LIMITER.limit({ key: ip });
        return !success;
    } catch (err) {
        console.error('rate limiter error:', err);
        return false; // fail open: never lose a genuine booking over a limiter fault
    }
}

async function handleMailer(request, env) {
    if (!isTrustedOrigin(request)) {
        return textResponse('Forbidden', 403);
    }

    if (await isRateLimited(request, env)) {
        return textResponse(MSG_RATE_LIMITED, 429, { 'Retry-After': '60' });
    }

    const { body: rawBody, error } = await readBody(request);
    if (error === 413) return textResponse(MSG_INVALID, 413);
    if (error) return textResponse(MSG_INVALID, 400);
    const body = capFields(rawBody);

    // Honeypot: a real visitor never fills this hidden field, only bots do.
    // Reply as if it worked so bots get no signal.
    if (field(body, 'website')) {
        return textResponse(MSG_SENT, 200);
    }

    const name = safeDisplayName(stripTags(field(body, 'full_name') || field(body, 'name')));
    const email = field(body, 'email');
    const requestedType = singleLine(stripTags(field(body, 'form_type')));
    const formType = FORM_TYPES.has(requestedType) ? requestedType : 'Website Message';

    if (!name || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
        return textResponse(MSG_INVALID, 400);
    }

    if (!env.RESEND_API_KEY) {
        console.error('mailer error: RESEND_API_KEY is not set');
        return textResponse(MSG_FAILED, 500);
    }

    const subject = `Chaliko Car Hire - ${formType} from ${name}`;
    const rows = buildDetailRows(body);

    const recipients = (env.NOTIFY_EMAILS || 'chalikocarhire@yahoo.com')
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
                reply_to: `"${name}" <${email}>`,
                subject,
                text: buildTextBody(formType, name, email, rows),
                html: buildHtmlBody(formType, name, email, rows),
            }),
        });

        if (!resendRes.ok) {
            console.error('Resend error:', resendRes.status, await resendRes.text());
            return textResponse(MSG_FAILED, 502);
        }

        return textResponse(MSG_SENT, 200);
    } catch (err) {
        console.error('mailer error:', err);
        return textResponse(MSG_FAILED, 502);
    }
}

const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' https://www.googletagmanager.com https://static.cloudflareinsights.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data:",
        "font-src 'self' data: https://fonts.gstatic.com",
        "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://cloudflareinsights.com",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
    ].join('; '),
};

function withSecurityHeaders(response, request) {
    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
        headers.set(name, value);
    }
    // Static assets (CSS/JS/images/fonts) aren't cache-busted with a hash, so
    // this stays short enough that a deploy is visible to returning visitors
    // within the hour rather than serving stale-until-manual-refresh.
    if (request && new URL(request.url).pathname.startsWith('/assets/')) {
        headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
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
                return withSecurityHeaders(await handleMailer(request, env), request);
            }
            return withSecurityHeaders(textResponse('Method not allowed', 405, { Allow: 'POST' }), request);
        }

        return withSecurityHeaders(await env.ASSETS.fetch(request), request);
    },
};
