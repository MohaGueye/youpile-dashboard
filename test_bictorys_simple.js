const https = require('https');
const fs = require('fs');

// Simple env loader
const envContent = fs.readFileSync('./.env.local', 'utf8');
const secretKey = envContent.match(/BICTORYS_SECRET_KEY=(.*)/)[1].trim();

console.log('Testing Bictorys API with key starting with:', secretKey.substring(0, 15) + '...');

const options = {
  hostname: 'api.bictorys.com',
  port: 443,
  path: '/v1/charges',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${secretKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Success! Bictorys API is reachable.');
      console.log('Balances:', data);
    } else {
      console.error(`❌ Error from Bictorys API (Status ${res.statusCode}):`, data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Network error:', error.message);
});

req.end();
