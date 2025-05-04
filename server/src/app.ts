// app.ts
import express from 'express';
import { createServer } from 'http';
import { Server as Io } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';

class App {
    public app: express.Application;
    public server;
    private io: Io;

    constructor() {
        this.app = express();
        this.server = createServer(this.app);

        this.app.use(cors());
        this.app.use(bodyParser.json());

        this.io = new Io(this.server, {
            cors: {
                origin: '*',
            }
        });

        this.io.on("connection", (socket) => {
            console.log('🔌 New connection:', socket.id);

            socket.on('setUsername', (username) => {
                socket.data.username = username;
                console.log(`✅ Username set: ${username}`);
            });

            socket.on('joinRoom', (room: string) => {
                socket.join(room);
                console.log(`🚪 ${socket.data.username} joined room: ${room}`);

                // Atualiza usuários online na sala
                this.io.to(room).emit('users', this.getOnlineUsers(room));
            });

            socket.on('message', (data: { author: string, text: string }) => {
                const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
                rooms.forEach(room => {
                    this.io.to(room).emit('message', data);
                    console.log(`💬 Message sent to room ${room}:`, data);
                });
            });

            socket.on('disconnect', () => {
                console.log(`❌ Disconnected: ${socket.data.username || socket.id}`);
                // Emit update for all rooms the socket was in
                socket.rooms.forEach(room => {
                    this.io.to(room).emit('users', this.getOnlineUsers(room));
                });
            });
        });
    }

    private getOnlineUsers(room: string): string[] {
        const users: string[] = [];
        const clients = this.io.sockets.adapter.rooms.get(room);
        if (clients) {
            for (const socketId of clients) {
                const socket = this.io.sockets.sockets.get(socketId);
                if (socket?.data.username) {
                    users.push(socket.data.username);
                }
            }
        }
        return users;
    }
}

export default App;
