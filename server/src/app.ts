import express from 'express';
import {Server} from "node:net";
import {createServer} from "node:http";
import {Server as Io} from 'socket.io';

class App {
    public app: express.Application;
    public server: Server
    private socketIo: Io;

    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        // @ts-ignore
        this.socketIo = new Io(this.server, {
            cors: {
                origin: '*',
            }
        });

        this.socketIo.on("connection", (socket) => {
           console.log('User connected', socket.id);

           socket.on('disconnect', (socket) => {
               console.log('User disconnected');
           })

           socket.on('message', (message) => {
               socket.broadcast.emit('message', message);
               console.log('Received message', message);
           })

        })
    }
}

export default App;