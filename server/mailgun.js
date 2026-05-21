const config = require('config');

function getMailgunMessagesUrl() {
    const baseUrl = (config.get('mailgunBaseURL') || 'https://api.mailgun.net').replace(/\/+$/, '');
    const domain = config.get('mailgunDomain');

    if (!domain) {
        throw new Error('Mailgun domain is not configured');
    }

    if (baseUrl.endsWith('/v3')) {
        return `${baseUrl}/${domain}/messages`;
    }

    return `${baseUrl}/v3/${domain}/messages`;
}

function getMailgunAuthorization() {
    const apiKey = config.get('mailgunAPIKey');

    if (!apiKey) {
        throw new Error('Mailgun API key is not configured');
    }

    return `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`;
}

async function sendMail(mailOptions) {
    const formData = new FormData();

    Object.entries(mailOptions).forEach(([key, value]) => {
        if (typeof value !== 'undefined' && value !== null) {
            formData.append(key, String(value));
        }
    });

    const response = await fetch(getMailgunMessagesUrl(), {
        method: 'POST',
        headers: {
            Authorization: getMailgunAuthorization(),
        },
        body: formData,
    });
    const responseText = await response.text();

    let payload = {};
    if (responseText) {
        try {
            payload = JSON.parse(responseText);
        } catch (error) {
            payload = { message: responseText };
        }
    }

    if (!response.ok) {
        const message = payload.message || response.statusText || 'Mailgun request failed';
        const mailgunError = new Error(message);
        mailgunError.status = response.status;
        mailgunError.payload = payload;
        throw mailgunError;
    }

    return payload;
}

module.exports = {
    sendMail,
};
