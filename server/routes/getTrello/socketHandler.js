const { Server } = require('socket.io');
let io;

const socketHandler = {
    init: (server)=>{
        io = new Server(server, {
            cors: {
                origin: 'https://stonereact-client.vercel.app/'
            }
        });

        io.on('connection', (socket)=>{
            console.log('一位使用者已連線:', socket.id);
        });

        return io;
    },

    getIO: ()=>{
        if(!io){
            throw new Error("Socket.io 未初始化！");
        }

        return io;
    }
}

module.exports = socketHandler;