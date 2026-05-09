const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config({ path: './.env.local' });

async function testBictorys() {
    const secretKey = process.env.BICTORYS_SECRET_KEY;
    console.log('Testing Bictorys API with key starting with:', secretKey.substring(0, 15) + '...');

    try {
        const response = await fetch('https://api.bictorys.com/v1/balances', {
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (response.ok) {
            console.log('✅ Success! Bictorys API is reachable.');
            console.log('Balances:', JSON.stringify(data, null, 2));
        } else {
            console.error('❌ Error from Bictorys API:', data);
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

testBictorys();
