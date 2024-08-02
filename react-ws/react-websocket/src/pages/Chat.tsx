import { useEffect, useState } from 'react';

const Chat: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<{ from: string; message: string }[]>([]);
  const [message, setMessage] = useState<string>("");

  // State for user information
  const [userEmail, setUserEmail] = useState<string>("");
  const [groupName, setGroupName] = useState<string>("");
  const [groupId, setGroupId] = useState<string>("");

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    socket.onopen = () => {
      console.log('WebSocket connected');
      setSocket(socket);

      // Optionally, handle automatic registration
      if (userEmail && groupName && groupId) {
        socket.send(JSON.stringify({ type: 'register', email: userEmail, group: groupName, groupId }));
      }
    };
  
    socket.onmessage = (message) => {
      const parsedMessage = JSON.parse(message.data);
      console.log('received message', parsedMessage);
      setMessages((prevMessages) => {
        console.log('Updating messages:', [...prevMessages, { from: parsedMessage.from, message: parsedMessage.message }]);
        return [...prevMessages, { from: parsedMessage.from, message: parsedMessage.message }];
      });
    };
  
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  
    return () => {
      socket.close();
    };
  }, [userEmail, groupName, groupId]);

  const sendMessage = () => {
    if (socket && message) {
      // Send message with the current user context
      socket.send(JSON.stringify({ type: 'message', message }));
      setMessage(""); // Clear the message input after sending
    }
  };

  const handleRegistration = () => {
    if (socket && userEmail && groupName && groupId) {
      socket.send(JSON.stringify({ type: 'register', email: userEmail, group: groupName, groupId }));
    }
  };

  if (!socket) {
    return <div> ... connecting to server </div>;
  }

  return (
    <>
      <div>
        <input
          type="email"
          placeholder="Your Email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Group ID"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        />
        <button onClick={handleRegistration}>Register</button>
      </div>
      <div>
        <input
          type="text"
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send Message</button>
      </div>
      <div>
        <h3>User Information</h3>
        <p>Email: {userEmail}</p>
        <p>Group Name: {groupName}</p>
        <p>Group ID: {groupId}</p>
      </div>
      <div>
        <h3>Chat</h3>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.from}: </strong>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default Chat;
