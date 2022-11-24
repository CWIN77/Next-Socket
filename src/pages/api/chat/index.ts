import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "../../../types/chat";

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (req.method === "POST") {
    const { message, roomName } = req.body;
    res.socket.server.io.emit(roomName, message);

    res.status(201).json(message);
  }
};
