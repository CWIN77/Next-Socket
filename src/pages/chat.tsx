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
  // let peerConnection: RTCPeerConnection | null = null;
  // const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  const getUserMedia = async () => {
    const myStream = await navigator.mediaDevices.getUserMedia(
      {
        audio: true,
        video: true
      }
    );
    const video: any = document.getElementById("video");
    video.srcObject = myStream;
    return myStream;
  }

  useEffect((): any => {
    getUserMedia();

    const socket = connect("http://localhost:4000", {
      path: "/api/chat/socketio",
    });
    setSocket(socket);

    socket.on("connect", () => {
      console.log("SOCKET CONNECTED!", socket.id);
      setConnected(true);
    });

    if (socket) return () => socket.disconnect();
  }, [])


  const handleIce = (data: any) => {
    console.log("candidate를 받음");
    console.log(data);
  }

  const enterRoom = async () => {
    const peerConnection = new RTCPeerConnection();
    const myStream = await getUserMedia()
    myStream.getTracks().forEach(track => peerConnection.addTrack(track, myStream))
    peerConnection.addEventListener('icecandidate', (data) => {
      console.log(data);
    });

    await axios.post("/api/chat", { message: "새 사용자가 들어옴", roomName });
    const offer = await peerConnection?.createOffer();
    if (offer) {
      peerConnection?.setLocalDescription(offer);
      await axios.post("/api/chat", { offer, roomName });
      console.log("offer 전달");
    }
    socket?.on(roomName, (message: IMessage) => {
      console.log(message);
    });

    socket?.on(roomName + "offer", async (offer) => {
      console.log("offer 받음");
      peerConnection?.setRemoteDescription(offer);
      const answer = await peerConnection?.createAnswer();
      peerConnection?.setLocalDescription(answer);
      await axios.post("/api/chat", { answer, roomName });
      console.log("answer 전달");
    });

    socket?.on(roomName + "answer", async (answer) => {
      if (!peerConnection.remoteDescription) {
        console.log("answer 받음");
        peerConnection?.setRemoteDescription(answer);
      }
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
      <br />
      <input value={sendMessage} placeholder="이름" type={"text"} onChange={(e) => { setSendMessage(e.target.value) }} />
      <input value={username} placeholder="텍스트" type={"text"} onChange={(e) => { setUsername(e.target.value) }} />
      <button onClick={submitSendMessage}>전송</button>

      <video id="video" autoPlay playsInline width="400" height="400" />
    </div>
  );
};
