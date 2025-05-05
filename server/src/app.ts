import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server as Io } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateToken } from './authMiddleware';

const JWT_SECRET = 'seu_segredo_jwt';

class App {
    public app: express.Application;
    public server;
    private io!: Io;

    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.io = new Io(this.server, {
            cors: {
                origin: "http://localhost:5173",
                methods: ["GET", "POST"],
                credentials: true,
            }
        });

        this.middleware();
        this.routes();
        this.sockets();
        this.connectDatabase();
    }

    private middleware() {
        this.app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
        this.app.use(bodyParser.json());

        // Socket.IO middleware de autenticação
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Token não fornecido'));

            jwt.verify(token, JWT_SECRET, (err:jwt.VerifyErrors | null, decoded: jwt.JwtPayload | string | undefined) => {
                if (err || !decoded || typeof decoded === 'string') return next(new Error('Token inválido'));
                socket.data.username = (decoded as jwt.JwtPayload).username;
                next();
            });
        });
    }

    private connectDatabase() {
        mongoose.connect('mongodb://localhost:27017/chatdb')
            .then(() => console.log('🟢 MongoDB conectado'))
            .catch((err) => console.error('❌ Erro MongoDB:', err));
    }

    private routes() {
        const userSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            fullName: { type: String, required: true },
            cpf: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
        });

        const User = mongoose.model('User', userSchema);

        this.app.post('/api/register', async (req: Request, res: Response) => {
            const { username, password, fullName, cpf, email, phone } = req.body;

            if (!username || !password || !fullName || !cpf || !email || !phone) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
            }

            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(409).json({ error: 'Usuário já existe.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ username, password: hashedPassword, fullName, cpf, email, phone });
            await newUser.save();

            return res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
        });

        this.app.post('/api/login', async (req: Request, res: Response) => {
            const { username, password } = req.body;

            const user = await User.findOne({ username });
            if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) return res.status(401).json({ error: 'Senha incorreta.' });

            const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).json({ token });
        });

        this.app.get('/api/perfil', authenticateToken, async (req: Request, res: Response) => {
            try {
                const userId = (req.user as any).id;
                const user = await User.findById(userId).select('-password');
                if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
                res.json(user);
            } catch (err) {
                res.status(500).json({ error: 'Erro ao buscar perfil' });
            }
        });
    }

    private sockets() {
        this.io.on("connection", (socket) => {
            console.log('🔌 Conectado:', socket.id, '| Usuário:', socket.data.username);

            socket.on('setUsername', (username) => {
                socket.data.username = username;
                console.log(`✅ Nome de usuário definido: ${username}`);
            });

            socket.on('joinRoom', (room: string) => {
                socket.join(room);
                const username = socket.data.username ?? 'Usuário Desconhecido';
                console.log(`🚪 ${username} entrou na sala: ${room}`);

                this.io.to(room).emit('users', this.getOnlineUsers(room));
            });

            socket.on('message', (data: { author: string, text: string }) => {
                const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
                rooms.forEach(room => {
                    this.io.to(room).emit('message', data);
                    console.log(`💬 Mensagem para a sala ${room}:`, data);
                });
            });

            socket.on('disconnect', () => {
                const username = socket.data.username ?? socket.id;
                console.log(`❌ Desconectado: ${username}`);
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