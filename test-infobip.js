const fs = require('fs');
const path = require('path');

// Basic manual .env loader
function loadEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            content.split('\n').forEach(line => {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    process.env[key.trim()] = valueParts.join('=').trim();
                }
            });
        }
    } catch (err) {
        console.error('Error loading .env.local:', err);
    }
}

loadEnv();

async function testInfobipEmail() {
    const API_KEY = process.env.INFOBIP_EMAIL_API_KEY || process.env.INFOBIP_API_KEY;
    const BASE_URL = process.env.INFOBIP_BASE_URL || 'https://api.infobip.com';
    const to = "universityshop845@gmail.com";
    const subject = "Infobip Debug Test";
    const html = "<h1>Test</h1><p>If you see this, Infobip is working.</p>";

    if (!API_KEY) {
        console.error('❌ API Key missing');
        return;
    }

    console.log('Sending to:', to);
    console.log('Base URL:', BASE_URL);

    try {
        const url = `${BASE_URL}/email/3/send`;

        // Use manual boundary/body construction if FormData is tricky in Node
        // But let's try fetch + FormData first as it's modern Node
        const formData = new FormData();
        formData.append('from', 'University Shop <universityshop845@gmail.com>');
        formData.append('to', to);
        formData.append('subject', subject);
        formData.append('html', html);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `App ${API_KEY}`,
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Success:', JSON.stringify(data, null, 2));
        } else {
            console.error('❌ Failed Status:', response.status);
            console.error('❌ Failed Data:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('❌ System Error:', err);
    }
}

testInfobipEmail();
