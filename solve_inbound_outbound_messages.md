# Inbound/Outbound Message Handling Documentation

## Overview
This document details the implementation of bidirectional messaging in the MacOS Dash application, specifically focusing on how messages are sent, received, and displayed in the UI.

## Core Components

### 1. Types Definition (`src/types/chat.ts`)
```typescript
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  direction: 'inbound' | 'outbound';  // Critical for UI rendering
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    thumbnailUrl?: string;
  };
}
```

### 2. Server Implementation (`server/server.ts`)

#### Outbound Messages (Sending)
```typescript
app.post('/messages', async (req, res) => {
  // 1. Receive request with 'to' and 'content'
  const { to, content } = req.body;
  
  // 2. Format phone number to E.164
  let formattedPhone = to.startsWith('+') ? to : '+' + to.replace(/\D/g, '');
  
  // 3. Create message object
  const message = {
    id: uuidv4(),
    conversationId: contact.id,
    direction: 'outbound',  // Mark as outbound
    content,
    status: 'queued'
  };
  
  // 4. Send via Twilio
  if (twilioClient) {
    const twilioMessage = await twilioClient.messages.create({
      body: content,
      to: formattedPhone,
      from: twilioConfig.phoneNumber
    });
  }
  
  // 5. Store and return message
  messages.push(message);
  return res.json(message);
});
```

#### Inbound Messages (Receiving)
```typescript
app.post('/webhooks/twilio/incoming', (req, res) => {
  // 1. Extract message details from Twilio webhook
  const { From, Body, MessageSid } = req.body;
  
  // 2. Create message object
  const message = {
    id: uuidv4(),
    conversationId: contact.id,
    direction: 'inbound',  // Mark as inbound
    content: Body,
    status: 'received'
  };
  
  // 3. Store message
  messages.push(message);
  res.sendStatus(200);
});
```

### 3. Frontend Service (`src/services/chatService.ts`)

#### Message Handling
```typescript
export const chatService = {
  async sendMessage(messageData: SendMessageRequest): Promise<Message> {
    const response = await axios.post(`${API_URL}/messages`, {
      to: conversation.contact.phone,
      content: messageData.content
    });
    
    return {
      ...response.data,
      direction: 'outbound'  // Ensure outbound direction
    };
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await axios.get(`${API_URL}/messages/${conversationId}`);
    return response.data.map(msg => ({
      ...msg,
      direction: msg.direction  // Preserve server-set direction
    }));
  }
};
```

### 4. UI Components (`src/components/chat/VirtualizedMessages.tsx`)

#### Message Bubble Component
```typescript
const MessageBubble = ({ message, isOutbound }: { message: Message; isOutbound: boolean }) => {
  const bubbleColor = useColorModeValue(
    isOutbound ? 'blue.500' : 'gray.200',
    isOutbound ? 'blue.500' : 'gray.600'
  );
  
  return (
    <Box
      display="flex"
      justifyContent={isOutbound ? 'flex-end' : 'flex-start'}
      mb={2}
      px={4}
    >
      <Box
        maxW="70%"
        bg={bubbleColor}
        borderRadius="20px"
        borderTopRightRadius={isOutbound ? '4px' : '20px'}
        borderTopLeftRadius={isOutbound ? '20px' : '4px'}
      >
        <Text>{message.content}</Text>
      </Box>
    </Box>
  );
};
```

## Message Flow

1. **Sending a Message**
   - User enters message in ChatInput
   - ChatArea calls chatService.sendMessage()
   - Server receives POST /messages
   - Server creates message with direction='outbound'
   - Server sends via Twilio
   - UI updates to show message on right side

2. **Receiving a Message**
   - Contact sends SMS to Twilio number
   - Twilio calls webhook /webhooks/twilio/incoming
   - Server creates message with direction='inbound'
   - Frontend polls getMessages()
   - UI updates to show message on left side

## Critical Dependencies

1. **Twilio Configuration**
   - Account SID
   - Auth Token
   - Phone Number
   - Webhook URL (for incoming messages)

2. **Environment Variables**
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_phone_number
   NGROK_URL=your_ngrok_url
   ```

## Testing

1. **Outbound Messages**
   ```typescript
   // Test sending a message
   const response = await axios.post('http://localhost:8000/messages', {
     to: '+1234567890',
     content: 'Test message'
   });
   expect(response.data.direction).toBe('outbound');
   ```

2. **Inbound Messages**
   ```typescript
   // Simulate Twilio webhook
   const response = await axios.post('http://localhost:8000/webhooks/twilio/incoming', {
     From: '+1234567890',
     Body: 'Test reply',
     MessageSid: 'test123'
   });
   expect(response.status).toBe(200);
   ```

## Security Considerations

1. **Webhook Validation**
   - Validate Twilio requests using X-Twilio-Signature
   - Ensure HTTPS for production webhooks

2. **Phone Number Formatting**
   - Always format to E.164 standard
   - Validate phone numbers before sending

## Troubleshooting

1. **Messages not appearing**
   - Check server logs for message direction
   - Verify message polling is active
   - Check Twilio webhook configuration

2. **Wrong message direction**
   - Verify server is setting correct direction
   - Check message mapping in chatService
   - Inspect message object in browser console

## Future Improvements

1. **Real-time Updates**
   - Implement WebSocket for instant updates
   - Replace polling with socket events

2. **Message Status**
   - Add read receipts
   - Implement typing indicators
   - Add message delivery confirmations

## Related Files

1. **Frontend**
   - src/types/chat.ts
   - src/services/chatService.ts
   - src/components/chat/VirtualizedMessages.tsx
   - src/components/chat/ChatArea.tsx
   - src/components/chat/ChatInput.tsx

2. **Backend**
   - server/server.ts
   - server/types/index.ts
   - server/services/twilio.ts

## Maintainer Notes

- The direction field is critical for UI rendering
- Always preserve message direction when mapping data
- Test both send and receive flows after UI changes
- Monitor Twilio webhook errors in production
