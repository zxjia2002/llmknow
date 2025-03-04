// 导入CozeAPI SDK
import { CozeAPI, RoleType, COZE_COM_BASE_URL, ChatStatus } from '@coze/api';

// 配置参数
const PAT_TOKEN = 'pat_p9y8XCOFiaJoAVe6ha7FtnJEm0mnT70UFoTu2OkSg7VRdyGGo42DhA0nmDMvPUyN';
const BOT_ID = '7477424686516174865';

console.log('===== Coze API 测试 =====');
console.log(`使用Bot ID: ${BOT_ID}`);
console.log(`使用Token: ${PAT_TOKEN.substring(0, 10)}...`);

// 测试直接URL和Coze API常量两种方式
const tests = [
  {
    name: '测试1: 使用直接URL',
    client: new CozeAPI({
      token: PAT_TOKEN,
      baseURL: 'https://api.coze.com',
      debug: true, // 开启调试模式，查看详细请求信息
    })
  },
  {
    name: '测试2: 使用COZE_COM_BASE_URL常量',
    client: new CozeAPI({
      token: PAT_TOKEN,
      baseURL: COZE_COM_BASE_URL,
      debug: true,
    })
  }
];

// 运行测试
async function runTests() {
  for (const test of tests) {
    console.log(`\n开始 ${test.name}`);
    
    try {
      console.log('发送请求...');
      const startTime = Date.now();
      
      // 使用简单的消息进行测试
      const response = await test.client.chat.createAndPoll({
        bot_id: BOT_ID,
        additional_messages: [{
          role: RoleType.User,
          content: 'Hello! Can you respond with a simple greeting?',
          content_type: 'text',
        }],
      });
      
      const duration = Date.now() - startTime;
      console.log(`请求完成，耗时: ${duration}ms`);
      
      if (response.chat.status === ChatStatus.COMPLETED) {
        console.log('测试成功! 响应状态: COMPLETED');
        console.log('消息内容:');
        
        for (const item of response.messages) {
          console.log(`[${item.role}]: ${item.content.substring(0, 100)}${item.content.length > 100 ? '...' : ''}`);
        }
        
        if (response.chat.usage) {
          console.log('使用情况:', response.chat.usage);
        }
      } else {
        console.log(`响应状态: ${response.chat.status}`);
        console.log('响应数据:', JSON.stringify(response, null, 2).substring(0, 500) + '...');
      }
    } catch (error) {
      console.error(`测试失败: ${error.message}`);
      if (error.response) {
        console.error('响应状态:', error.response.status);
        console.error('响应头:', error.response.headers);
        console.error('响应体:', error.response.data);
      } else if (error.request) {
        console.error('请求已发送但未收到响应');
        console.error(error.request);
      } else {
        console.error('错误详情:', error);
      }
    }
  }
}

// 执行测试
console.log('开始API测试...');
runTests().catch(error => {
  console.error('测试过程中发生错误:', error);
}).finally(() => {
  console.log('\n===== 测试完成 =====');
}); 