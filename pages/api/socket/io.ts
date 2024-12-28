import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/types/socket';
import { initSocketServer } from '@/lib/socket-server';

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    try {
        initSocketServer(res);
        res.end();
    } catch (error) {
        console.error('Socket initialization error:', error);
        res.status(500).end();
    }
};

export default ioHandler;