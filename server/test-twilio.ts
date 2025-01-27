import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  status: string;
  timestamp: Date;
  to?: string;
  from?: string;
  twilioSid?: string;
}

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
    if (!process.env.TEST_PHONE_NUMBER) {
      throw new Error('TEST_PHONE_NUMBER not set in environment variables');
    }

    const messageData = {
      to: process.env.TEST_PHONE_NUMBER,
      content: '🧪 Test message from DockOS at ' + new Date().toLocaleString()
    };
    
    const sendMessage = await axios.post<Message>(`${API_URL}/api/messages`, messageData);
    console.log('✅ Message Sent:', {
      id: sendMessage.data.id,
      status: sendMessage.data.status,
      content: sendMessage.data.content,
      twilioSid: sendMessage.data.twilioSid
    });
    console.log('------------------------\n');

    // Test 3: Get Messages
    console.log('Test 3: Get Messages');
    const messages = await axios.get<Message[]>(`${API_URL}/api/messages`);
    console.log('✅ Retrieved Messages:', messages.data.length);
    const lastMessage = messages.data[messages.data.length - 1];
    console.log('Last Message:', {
      id: lastMessage.id,
      direction: lastMessage.direction,
      status: lastMessage.status,
      content: lastMessage.content,
      timestamp: new Date(lastMessage.timestamp).toLocaleString()
    });
    console.log('------------------------\n');

    console.log('✨ All tests completed successfully!');
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Test Failed:', error.response?.data || error.message);
      console.error('Status:', error.response?.status);
      console.error('Details:', error.response?.data?.details || 'No additional details');
    } else {
      console.error('❌ Test Failed:', error);
    }
    process.exit(1);
  }
}

testTwilioIntegration();
