import {NextApiRequest} from 'next';
import { initSocketServer } from '@/lib/socket-server';
import {NextApiResponseSocket} from "@/types/socket";

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseSocket) => {
    try {
        initSocketServer(res);
        res.end();
    } catch (error) {
        console.error('Socket initialization error:', error);
        res.status(500).end();
    }
};

export default ioHandler;