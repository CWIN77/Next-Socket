import { useState, useRef, useEffect, useCallback } from "react";
import { connect, Socket } from "socket.io-client";
import axios from "axios";

interface IMessage {
  user: string;
  message: string;
}

export default function Chat() {
  const [sendMessage, setSendMessage] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket>();

  useEffect((): any => {
    const socket = connect("http://localhost:8080", {
      path: "/api/chat/socketio",
    });
    setSocket(socket);

    socket.on("connect", () => {
      console.log("SOCKET CONNECTED!", socket.id);
      setConnected(true);
    });

    if (socket) return () => socket.disconnect();
  }, []);

  const enterRoom = () => {
    socket?.on(roomName, (message: IMessage) => {
      console.log(message);
    });
  }

  const submitSendMessage = async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (sendMessage && roomName !== "") {
      const message: IMessage = {
        user: username,
        message: sendMessage,
      };

      await axios.post("/api/chat", { message, roomName });
      setSendMessage("");
    }
  };

  return (
    <div>
      <input value={roomName} placeholder="방이름" type={"text"} onChange={(e) => { setRoomName(e.target.value) }} />
      <button onClick={enterRoom}>방참가</button>
      <input value={sendMessage} placeholder="이름" type={"text"} onChange={(e) => { setSendMessage(e.target.value) }} />
      <input value={username} placeholder="텍스트" type={"text"} onChange={(e) => { setUsername(e.target.value) }} />
      <button onClick={submitSendMessage}>전송</button>
      {/* <button onClick={joinRoom}>전송</button> */}
    </div>
  );
};
