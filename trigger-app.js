const http = require('http');

const data = JSON.stringify({
    action: 'send',
    email: 'universityshop845@gmail.com',
    channel: 'email',
    name: 'Debug User'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/otp',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
