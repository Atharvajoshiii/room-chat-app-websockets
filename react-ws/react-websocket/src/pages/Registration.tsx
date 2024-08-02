import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Registration: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [group, setGroup] = useState<string>("");
  const [groupId, setGroupId] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const navigate = useNavigate();

  const registerUser = () => {
    if (email && group && groupId) {
      // Connect to WebSocket
      const socket = new WebSocket('ws://localhost:8080');
      socket.onopen = () => {
        console.log('WebSocket connected');
        setSocket(socket);
        
        // Send registration message to the server
        socket.send(JSON.stringify({ type: 'register', email, group, groupId }));

        // Show success alert and navigate to chat room
        alert('Registered successfully!');
        navigate('/chat');
      };

      socket.onmessage = (message) => {
        const parsedMessage = JSON.parse(message.data);
        if (parsedMessage.type === 'system') {
          console.log(parsedMessage.message);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        socket.close();
      };
    }
  };

  return (
    <div>
      <h2>Registration</h2>
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
  );
}

export default Registration;
