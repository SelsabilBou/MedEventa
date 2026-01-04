const http = require('http');

const data = JSON.stringify({
    rating: 5,
    comment: "Great event, loved the AI session!"
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/events/13/feedback',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        // Using a fake token or assuming middleware handles it. 
        // Since I don't have a valid valid token handy in text, I expect 401 or 403, NOT 404.
        // 404 means route not found (my goal to fix). 401 means route exists but I need auth.
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
