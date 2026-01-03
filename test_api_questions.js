const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/events/13/questions',
    method: 'GET',
    headers: {
        // Basic auth header if needed, but endpoint might be semi-public or need token.
        // The route is `getQuestionsByEventController` which is supposedly semi-public in routes?
        // Let's check route definition. 
        // router.get('/events/:eventId/questions', getQuestionsByEventController); -> No verifyToken middleware on this line in previous `question.routes.js` view (Step 340).
    }
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response Body:', data);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
