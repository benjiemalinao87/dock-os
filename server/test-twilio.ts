import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'https://dock-os-production.up.railway.app';

async function testTwilioIntegration() {
  try {
    console.log('🚀 Starting Twilio Integration Test...\n');

    // Test 1: Health Check
    console.log('Test 1: Health Check');
    const healthCheck = await axios.get(`${API_URL}/`);
    console.log('✅ Health Check Response:', healthCheck.data);
    console.log('------------------------\n');

    // Test 2: Send Message
    console.log('Test 2: Send Message');
    const messageData = {
      to: process.env.TEST_PHONE_NUMBER, // Add this to your .env
      content: '🧪 Test message from DockOS at ' + new Date().toLocaleString()
    };
    
    const sendMessage = await axios.post(`${API_URL}/api/messages`, messageData);
    console.log('✅ Message Sent:', sendMessage.data);
    console.log('------------------------\n');

    // Test 3: Get Messages
    console.log('Test 3: Get Messages');
    const messages = await axios.get(`${API_URL}/api/messages`);
    console.log('✅ Retrieved Messages:', messages.data.length);
    console.log('Last Message:', messages.data[messages.data.length - 1]);
    console.log('------------------------\n');

    console.log('✨ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
  }
}

testTwilioIntegration();
