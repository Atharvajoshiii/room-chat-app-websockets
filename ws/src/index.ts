import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';

const app = express();
const httpServer = app.listen(8080);

const wss = new WebSocketServer({ server: httpServer });

// Define the shape of the messages
interface Message {
  type: 'register' | 'message';
  email?: string;
  group?: string;
  groupId?: string;
  to?: string;
  message?: string;
}

// Store active connections with group information
interface ClientInfo {
  email: string;
  group: string;
  groupId: string;
  ws: WebSocket;
}

// Store messages by groupId
const groupMessages: Record<string, { from: string, message: string }[]> = {};

const clients: Map<string, ClientInfo> = new Map();

wss.on('connection', function connection(ws: WebSocket) {
  let clientInfo: ClientInfo;

  ws.on('error', console.error);

  // Handle incoming messages
  ws.on('message', function message(data, isBinary: boolean) {
    try {
      const parsedData: Message = JSON.parse(data.toString());

      if (parsedData.type === 'register' && parsedData.email && parsedData.group && parsedData.groupId) {
        // Register user connection
        clientInfo = {
          email: parsedData.email,
          group: parsedData.group,
          groupId: parsedData.groupId,
          ws: ws,
        };
        clients.set(parsedData.email, clientInfo);

        // Send all previous messages to the newly registered user
        const messages = groupMessages[parsedData.groupId] || [];
        messages.forEach(msg => {
          ws.send(JSON.stringify({ from: msg.from, message: msg.message }));
        });

        ws.send(JSON.stringify({ type: 'system', message: 'Registered successfully' }));
      } else if (parsedData.type === 'message' && parsedData.message && clientInfo) {
        // Store message
        const groupId = clientInfo.groupId;
        if (!groupMessages[groupId]) {
          groupMessages[groupId] = [];
        }
        groupMessages[groupId].push({ from: clientInfo.email, message: parsedData.message });

        // Route message to users in the same group
        clients.forEach((client) => {
          if (client.groupId === groupId && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
              from: clientInfo.email,
              message: parsedData.message,
            }), { binary: isBinary });
          }
        });
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  // Handle connection close
  ws.on('close', () => {
    if (clientInfo) {
      clients.delete(clientInfo.email);
    }
  });
});
