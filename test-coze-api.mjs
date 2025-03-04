// Simple test script for Coze API
import fetch from 'node-fetch';

const BOT_ID = '7477424686516174865';
const API_KEY = 'pat_p9y8XCOFiaJoAVe6ha7FtnJEm0mnT70UFoTu2OkSg7VRdyGGo42DhA0nmDMvPUyN';

// 根据Coze API文档(https://www.coze.com/open/docs/developer_guides/chat_v3)尝试正确的API URL
const API_URLS = [
  'https://api.coze.com/open/api/chat/v3',
  'https://api.coze.cn/open/api/chat/v3'
];

async function testCozeAPI() {
  console.log('Testing connection to Coze API...');
  console.log('Using Bot ID:', BOT_ID);
  console.log('Using API Key:', API_KEY.substring(0, 10) + '...');
  
  for (const API_URL of API_URLS) {
    console.log('\n\n=========================================');
    console.log(`Testing URL: ${API_URL}`);
    console.log('=========================================');
    
    try {
      // Simple request to test the connection
      console.log('Making request to:', API_URL);
      
      const response = await fetch(API_URL, {
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
          stream: false
        }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Get the raw response text
      const responseText = await response.text();
      console.log('\nRaw response text (first 500 chars):', responseText.substring(0, 500));
      
      if (!response.ok) {
        console.error('HTTP error:', response.status);
        continue;
      }
      
      // Try to parse as JSON if it looks like JSON
      if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
        try {
          const data = JSON.parse(responseText);
          console.log('Response data:', JSON.stringify(data, null, 2));
          
          if (data.choices && data.choices.length > 0) {
            console.log('\nSuccess! Received response:');
            console.log(data.choices[0].message.content);
            return; // Exit on success
          } else if (data.messages && data.messages.length > 0) {
            console.log('\nSuccess! Received response messages:');
            const assistantMessages = data.messages.filter(m => m.role === 'assistant');
            if (assistantMessages.length > 0) {
              console.log(assistantMessages[assistantMessages.length - 1].content);
            } else {
              console.log(data.messages);
            }
            return; // Exit on success
          }
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  console.log("\nNone of the API URLs worked. Please check your API key and Bot ID.");
}

// Also test using the @coze/api SDK directly
async function testCozeSDK() {
  try {
    console.log('\n\n=========================================');
    console.log('Testing @coze/api SDK');
    console.log('=========================================');
    
    // Dynamic import to handle ESM
    const { CozeAPI, RoleType, COZE_COM_BASE_URL, COZE_CN_BASE_URL } = await import('@coze/api');
    
    // Try both .com and .cn URLs
    const baseURLs = [COZE_COM_BASE_URL, COZE_CN_BASE_URL];
    
    for (const baseURL of baseURLs) {
      console.log(`\nTrying with baseURL: ${baseURL}`);
      
      const client = new CozeAPI({
        token: API_KEY,
        baseURL: baseURL,
        debug: true,
      });
      
      console.log('SDK client created, sending request...');
      
      try {
        const response = await client.chat.createAndPoll({
          bot_id: BOT_ID,
          additional_messages: [{
            role: RoleType.User,
            content: 'Hello, can you respond with a simple greeting?',
            content_type: 'text',
          }],
        });
        
        console.log('SDK response received:', response);
        
        if (response.messages && response.messages.length > 0) {
          const assistantMessages = response.messages.filter(m => m.role === RoleType.Assistant);
          if (assistantMessages.length > 0) {
            const lastMessage = assistantMessages[assistantMessages.length - 1];
            console.log('\nSuccess! Received response from SDK:');
            console.log(lastMessage.content);
            return; // Successful, exit
          }
        }
      } catch (clientError) {
        console.error(`SDK Error with ${baseURL}:`, clientError);
      }
    }
  } catch (error) {
    console.error('SDK Error:', error);
  }
}

// Run the tests
(async () => {
  await testCozeAPI();
  await testCozeSDK();
  console.log('Test complete');
})().catch(console.error); 