"use client";
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const ChatPage = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:4000/auth/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchData();

    // Connect to WebSocket server
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleUserClick = async (userId) => {
    setSelectedUser(userId);
    try {
      const response = await fetch(`http://localhost:4000/messages/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = () => {
    if (!socket) return;
    if (!newMessage.trim()) return;

    socket.emit("sendMessage", {
      receiver: selectedUser,
      content: newMessage,
    });

    setNewMessage("");
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [socket]);

  return (
    <div className="flex">
      <div className="w-1/4">
        <h2>Users</h2>
        <ul>
          {users?.map((user) => (
            <li key={user.id} onClick={() => handleUserClick(user.id)}>
              {user.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-3/4">
        <h2>Messages</h2>
        <div>
          {messages?.map((message) => (
            <div key={message.id}>
              <p>
                {message.sender}: {message.content}
              </p>
            </div>
          ))}
        </div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatPage;
