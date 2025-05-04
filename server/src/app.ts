import express from 'express';
import { createServer, Server } from 'http';
import { Server as Io } from 'socket.io';

class App {
    public app: express.Application;
    public server: Server;
    private socketIo: Io;

    constructor() {
        this.app = express();
        this.server = createServer(this.app);

        this.socketIo = new Io(this.server, {
            cors: {
                origin: '*',
            }
        });

        this.socketIo.on("connection", (socket) => {
            console.log('User connected:', socket.id);

            socket.on('setUsername', (username) => {
                socket.data.username = username;
                this.socketIo.emit("users", this.getOnlineUsers());
                console.log(`User ${username} connected`);
            });

            socket.on('disconnect', () => {
                console.log(`User ${socket.data.username || socket.id} disconnected`);
                this.socketIo.emit("users", this.getOnlineUsers());
            });

            socket.on('message', (data: { author: string, text: string }) => {
                console.log('Message received from client:', data);
                this.socketIo.emit('message', data);
            });
        });
    }

    private getOnlineUsers() {
        return Array.from(this.socketIo.sockets.sockets.values())
            .map((s) => s.data.username)
            .filter(Boolean);
    }
}


export default App;
