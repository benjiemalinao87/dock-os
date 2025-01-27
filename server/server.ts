import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import twilio from 'twilio';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Message interface
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

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// In-memory message store
const messages: Message[] = [];

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'healthy', message: 'DockOS API is running' });
});

// Send message endpoint
app.post('/api/messages', async (req, res) => {
  try {
    const { to, content } = req.body;
    
    // Format phone number to E.164
    const formattedPhone = to.startsWith('+') ? to : '+' + to.replace(/\D/g, '');
    
    // Create message object
    const message: Message = {
      id: uuidv4(),
      direction: 'outbound',
      content,
      status: 'queued',
      timestamp: new Date(),
      to: formattedPhone
    };
    
    // Send via Twilio
    const twilioMessage = await twilioClient.messages.create({
      body: content,
      to: formattedPhone,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    
    // Update message with Twilio SID
    message.twilioSid = twilioMessage.sid;
    message.status = 'sent';
    
    // Store message
    messages.push(message);
    
    res.json(message);
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error.message 
    });
  }
});

// Twilio webhook for incoming messages
app.post('/api/webhooks/twilio/incoming', (req, res) => {
  try {
    const { From, Body, MessageSid } = req.body;
    
    // Create message object
    const message: Message = {
      id: uuidv4(),
      direction: 'inbound',
      content: Body,
      status: 'received',
      timestamp: new Date(),
      from: From,
      twilioSid: MessageSid
    };
    
    // Store message
    messages.push(message);
    
    // Send TwiML response
    res.type('text/xml').send(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
    );
  } catch (error: any) {
    console.error('Error processing incoming message:', error);
    res.status(500).json({ 
      error: 'Error processing message',
      details: error.message 
    });
  }
});

// Get messages endpoint
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Webhook URL: https://dock-os-production.up.railway.app/api/webhooks/twilio/incoming`);
});
