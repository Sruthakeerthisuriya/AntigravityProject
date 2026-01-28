const axios = require('axios');
async function test() {
    try {
        const res = await axios.get('http://localhost:3000/');
        console.log('Root response:', res.data);
    } catch (e) {
        console.log('Root Error:', e.message);
    }
}
test();
