"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client"; // Connect to WebSocket server

import axios from "./../axios/axiosInstance";

const socket = io("http://localhost:4000", { transports: ["websocket"] });

function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socketConnectionStatus, setSocketConnectionStatus] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [typingIndicators, setTypingIndicators] = useState({});
  const [chatHistory, setChatHistory] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const token = localStorage.getItem("accessToken");

  socket.on("connect", () => {
    setSocketConnectionStatus(true);
  });

  socket.on("disconnect", () => {
    setSocketConnectionStatus(false);
  });

  // Add a listener for typingIndicator event
  socket.on("typingIndicator", handleTypingIndicator);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get("auth/details");
      setUser(response.data);
      setSelectedUser(response.data);

      // Call fetchChatHistory after setting selectedUser
      fetchChatHistory(response.data.userId);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Fetch list of users
  const fetchUsers = async () => {
    try {
      const response = await axios.get("auth/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchChatHistory = async (defaultUserId) => {
    try {
      const receierId = selectedUser?.id || defaultUserId;
      const senderId = user?.userId || defaultUserId;
      const response = await axios.get(`messages/${senderId}/${receierId}`);
      setChatHistory(response.data);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const saveMessageToBackend = async (message) => {
    try {
      const response = await axios.post("messages", message);
      if (response.status === 201) {
        console.error("Failed to save message to backend");
      }
    } catch (error) {
      alert("Message is not sent to the backend");
      console.error("Error saving message to backend:", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  // Get user status
  const getUserStatus = (userId) => {
    return onlineUsers.some((onlineUser) => onlineUser.userId === userId)
      ? "Online"
      : "Offline";
  };

  // Get user status color
  const getUserStatusColor = (status) => {
    return status === "Online" ? "bg-green-500" : "bg-red-500";
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const message = {
      sender: user.userId,
      receiver: selectedUser.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    socket.emit("sendMessage", message); // Send message via WebSocket
    await saveMessageToBackend(message); // Save message to backend

    setNewMessage("");
  };

  // Update handleTyping and handleStopTyping functions
  const handleTyping = () => {
    socket.emit("typing", {
      sender: user.userId,
      receiver: selectedUser.id,
      typing: true,
    });
  };

  const handleStopTyping = () => {
    setTimeout(() => {
      socket.emit("stopTyping", {
        sender: user.userId,
        receiver: selectedUser.id,
        typing: false,
      });
    }, 2000); // 1000 milliseconds = 1 second
  };

  // Handle typing indicator
  function handleTypingIndicator(data) {
    setTypingIndicators(data);
  }

  //Handle Online Users
  const handleOnlineUsers = (onlineUsers) => {
    setOnlineUsers(onlineUsers);
  };

  // Handle receiving messages
  const handleReceiveMessage = (message) => {
    setChatHistory((prevChatHistory) => [...prevChatHistory, message]);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.push("/");
  };

  const handleUserClick = (userId) => {
    setSelectedUser(userId);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Fetch user details using token from local storage
    if (!token) {
      router.push("/");
      return;
    }
    fetchUserDetails();
  }, [token, router]);

  useEffect(() => {
    if (!user || !selectedUser) return;
    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [user, selectedUser]);

  socket.on("GetOnlineUser", handleOnlineUsers);

  useEffect(() => {
    const onlineUser = { socketId: socket.id, userId: user?.userId };
    if (user && socketConnectionStatus) {
      console.log("Window opened");
      socket.emit("userOnline", onlineUser); // Emitting as 'userOnline'
    }
  }, [user, socketConnectionStatus]);

  useEffect(() => {
    if (selectedUser) {
      fetchChatHistory();
    }
  }, [selectedUser]);

  return (
    <div className="flex flex-row h-screen">
      <div className="w-1/4 bg-gray-200 p-4">
        <h2 className="text-xl font-bold mb-4 bg-blue-800 text-center text-white">
          Welcome {user?.username}
        </h2>
        <h2 className="text-xl font-bold mb-4">Users</h2>
        <ul>
          {users.map((mappedUser) => (
            <li
              key={mappedUser.id}
              onClick={() => handleUserClick(mappedUser)}
              className={`cursor-pointer p-2 ${
                selectedUser && selectedUser?.id === mappedUser?.id
                  ? "bg-blue-100"
                  : ""
              }`}
            >
              <>
                {mappedUser?.username}{" "}
                {mappedUser?.id === user?.userId ? (
                  <div className="inline"> - me </div>
                ) : (
                  ""
                )}
                <div
                  className={`w-3 h-3 rounded-full inline-block mr-2 ${getUserStatusColor(
                    getUserStatus(mappedUser.id)
                  )}`}
                ></div>
                {typingIndicators?.sender == mappedUser?.id &&
                  typingIndicators?.receiver == user?.userId &&
                  typingIndicators.typing && (
                    <div className="inline"> Typing...</div>
                  )}
              </>
            </li>
          ))}
        </ul>
      </div>
      {/* Chat Window */}
      <div className="flex-1 bg-white p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Chat with {selectedUser ? selectedUser?.username : ""}
          </h2>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
        <div className="flex flex-col space-y-2 h-[50%] border-red-500 overflow-scroll">
          {chatHistory.map((message) => (
            <div
              key={message._id}
              className={`p-2 rounded ${
                message.sender === user.userId
                  ? "bg-blue-100 self-end"
                  : "bg-gray-100"
              }`}
            >
              <p>{message.content}</p>
              <span className="text-xs text-gray-500">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          {typingIndicators?.sender == selectedUser?.id &&
            typingIndicators.typing && (
              <div>{selectedUser?.username} is typing...</div>
            )}
          <input
            type="text"
            className="w-full border rounded p-2"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyUp={handleStopTyping}
          />

          <button
            onClick={handleSendMessage}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
