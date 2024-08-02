import { useEffect, useState } from 'react';
import './App.css';

interface Message {
  from: string;
  message: string;
}

const App: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [group, setGroup] = useState<string>("");
  const [groupId, setGroupId] = useState<string>("");

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    socket.onopen = () => {
      console.log('connected');
      setSocket(socket);
    };
    socket.onmessage = (message) => {
      const parsedMessage = JSON.parse(message.data);
      if (parsedMessage.type === 'system') {
        console.log(parsedMessage.message);
      } else {
        console.log('received message', parsedMessage);
        setMessages((prevMessages) => [...prevMessages, { from: parsedMessage.from, message: parsedMessage.message }]);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const registerUser = () => {
    if (socket && email && group && groupId) {
      socket.send(JSON.stringify({ type: 'register', email, group, groupId }));
      alert('user registered to web socket server')
    }
  };

  const sendMessage = () => {
    if (socket && message) {
      socket.send(JSON.stringify({ type: 'message', message }));
      setMessage(""); // Clear the message input after sending
    }
  };

  if (!socket) {
    return <div> ... connecting to server </div>;
  }

  return (
    <div className="container">
      <div className="registration">
        <h2>Register</h2>
        <input
          type="email"
          placeholder="Your Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Group Name"
          onChange={(e) => setGroup(e.target.value)}
        />
        <input
          type="text"
          placeholder="Group ID"
          onChange={(e) => setGroupId(e.target.value)}
        />
        <button onClick={registerUser}>Register</button>
      </div>
      <div className="chat">
        <h2>Chat</h2>
        <input
          type="text"
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send Message</button>
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index}>
              <strong>{msg.from}: </strong>
              <span>{msg.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
