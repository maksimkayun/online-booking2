import {NextApiRequest} from 'next';
import {NextApiResponseSocket} from "@/types/socket";
import { Server } from "socket.io";

export const config = {
    api: {
        bodyParser: false,
    },
};

function ioHandler(req: NextApiRequest, res: NextApiResponseSocket) {
    if (res.socket.server.io) {
        res.end();
        return;
    }

    const io = new Server(res.socket.server, {
        path: "/api/socket/io",
        addTrailingSlash: false,
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    res.socket.server.io = io;
    res.end();
}

export default ioHandler;