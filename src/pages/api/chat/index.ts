import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "../../../types/chat";

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (req.method === "POST") {
    if (req.body.message) {
      const { message, roomName } = req.body;
      res.socket.server.io.emit(roomName, message);
    } else if (req.body.offer) {
      const { offer, roomName } = req.body;
      res.socket.server.io.emit(roomName + "offer", offer);
    } else if (req.body.answer) {
      const { answer, roomName } = req.body;
      res.socket.server.io.emit(roomName + "answer", answer);
    }

    res.status(201).json("굿");
  }
};
