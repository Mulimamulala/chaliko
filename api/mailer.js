const nodemailer = require('nodemailer');

// Human-readable labels for the fields our forms may send.
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

const RECIPIENT = 'mulimam16@gmail.com';

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

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(403).send('There was a problem with your submission, please try again.');
        return;
    }

    const body = req.body || {};

    const name = singleLine(stripTags(field(body, 'full_name') || field(body, 'name')));
    const email = field(body, 'email');
    const formType = stripTags(field(body, 'form_type')) || 'Website Message';

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !emailPattern.test(email)) {
        res.status(400).send('Oops! There was a problem with your submission. Please complete the form and try again.');
        return;
    }

    const subject = `Chaliko Car Hire - ${formType} from ${name}`;

    let emailContent = `Form: ${formType}\n`;
    emailContent += `Name: ${name}\n`;
    emailContent += `Email: ${email}\n`;

    for (const [key, label] of Object.entries(LABELS)) {
        const raw = body[key];
        if (raw !== undefined && raw !== null && String(raw).trim() !== '') {
            const value = singleLine(stripTags(String(raw).trim()));
            emailContent += `${label}: ${value}\n`;
        }
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    try {
        await transporter.sendMail({
            from: `Chaliko Website <${process.env.GMAIL_USER}>`,
            to: RECIPIENT,
            replyTo: `${name} <${email}>`,
            subject,
            text: emailContent,
        });
        res.status(200).send("Thank you! Your message has been sent - we'll be in touch within 2 hours.");
    } catch (err) {
        console.error('mailer error:', err);
        res.status(500).send("Oops! Something went wrong and we couldn't send your message. Please call us instead.");
    }
};
