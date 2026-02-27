const axios = require('axios');

async function testFetch() {
  try {
    const res = await axios.get('http://localhost:5001/api/cases');
    console.log('Cases:', res.data);
    
    const stats = await axios.get('http://localhost:5001/api/admin/analytics');
    console.log('Stats:', stats.data);
  } catch (err) {
    console.error('Fetch Failed:', err.message);
    if (err.response) {
       console.error('Status:', err.response.status);
       console.error('Data:', err.response.data);
    }
  }
}

testFetch();
