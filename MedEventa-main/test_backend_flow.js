const axios = require('axios');

async function run() {
    const email = `test_${Date.now()}@example.com`;
    const password = 'Password123!';

    try {
        // 1. Register
        console.log('Registering user...');
        await axios.post('http://localhost:3000/api/auth/register', {
            nom: 'Test',
            prenom: 'User',
            email: email,
            mot_de_passe: password,
            role: 'PARTICIPANT'
        });
        console.log('Registered.');

        // 2. Login
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: email,
            mot_de_passe: password
        });
        const token = loginRes.data.token;
        console.log('Logged in. Token length:', token.length);

        // 3. Register for an event (assuming event ID 1 exists)
        console.log('Registering for event 1...');
        // We need permission 'register_event' ? No, participants can register.
        // The route is POST /api/inscriptions/register/:eventId
        await axios.post('http://localhost:3000/api/inscriptions/register/1', {
            profil: 'PARTICIPANT',
            nom: 'Test',
            prenom: 'User',
            email: email
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Registered for event 1.');

        // 4. Fetch my registrations
        console.log('Fetching my registrations...');
        const myRegRes = await axios.get('http://localhost:3000/api/inscriptions/my-registrations', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('My Registrations:', JSON.stringify(myRegRes.data, null, 2));

    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}

run();
