// Simple test script for Coze API
import fetch from 'node-fetch';

const BOT_ID = '7477424686516174865';
const API_KEY = 'pat_p9y8XCOFiaJoAVe6ha7FtnJEm0mnT70UFoTu2OkSg7VRdyGGo42DhA0nmDMvPUyN';

async function testCozeAPI() {
  console.log('Testing connection to Coze API...');
  
  try {
    // Simple request to test the connection
    const response = await fetch('https://www.coze.com/open/api/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        bot_id: BOT_ID,
        messages: [
          {
            role: 'user',
            content: 'Hello, can you respond with a simple greeting?',
            content_type: 'text',
          }
        ],
      }),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('HTTP error:', response.status, errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices.length > 0) {
      console.log('\nSuccess! Received response:');
      console.log(data.choices[0].message.content);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testCozeAPI().then(() => console.log('Test complete')).catch(console.error); 