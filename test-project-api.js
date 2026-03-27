const http = require('http');

function makeRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        ...headers
      }
    };
    
    const req = http.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          resolve(data);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
  });
}

async function testProjectAPI() {
  try {
    // Test with Scratch 3.0 editor-like request (no accept header)
    console.log('Testing without Accept header...');
    const data1 = await makeRequest('http://localhost:5000/api/scratch/projects/69c509cd34d8391245385123');
    console.log('Response without Accept header:', data1);
    console.log('Is it a valid Scratch 3.0 project?', typeof data1 === 'object' && data1.meta && data1.targets);
    
    // Test with API request (with accept header)
    console.log('\nTesting with Accept: application/json...');
    const data2 = await makeRequest('http://localhost:5000/api/scratch/projects/69c509cd34d8391245385123', {
      'Accept': 'application/json'
    });
    console.log('Response with Accept: application/json:', data2);
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testProjectAPI();