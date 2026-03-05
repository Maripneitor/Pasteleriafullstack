const axios = require('axios');
async function check() {
  try {
    await axios.get('http://localhost:5173');
    console.log('Ready');
  } catch (e) {
    console.log('Not ready');
  }
}
check();
