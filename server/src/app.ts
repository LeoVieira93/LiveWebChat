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

        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Token não fornecido'));

            jwt.verify(token, JWT_SECRET, (err: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | string | undefined) => {
                if (err || !decoded || typeof decoded === 'string') return next(new Error('Token inválido'));
                socket.data.username = (decoded as jwt.JwtPayload).username;
                next();
            });
        });
    }

    private async connectDatabase() {
        try {
            await mongoose.connect('mongodb://localhost:27017/chatdb');
            console.log('🟢 MongoDB conectado');
            await this.seedUsers();
        } catch (err) {
            console.error('❌ Erro MongoDB:', err);
        }
    }

    private async seedUsers() {
        const userSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            fullName: { type: String, required: true },
            cpf: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
        });

        const User = mongoose.models.User || mongoose.model('User', userSchema);

        const users = [
            {
                username: 'LeoVieira',
                password: '12345',
                fullName: 'Leonardo Vieira',
                cpf: '000.000.000-00',
                email: 'leonardo@email.com',
                phone: '(11) 99999-0000'
            },
            {
                username: 'Tety',
                password: '12345',
                fullName: 'Kethrin Weiss',
                cpf: '111.111.111-11',
                email: 'tety@email.com',
                phone: '(21) 98888-1111'
            },
            {
                username: 'admin',
                password: '12345',
                fullName: 'Administrador',
                cpf: '222.222.222-22',
                email: 'admin@email.com',
                phone: '(31) 97777-2222'
            }
        ];

        for (const u of users) {
            const exists = await User.findOne({ username: u.username });
            if (!exists) {
                const hashed = await bcrypt.hash(u.password, 10);
                await User.create({ ...u, password: hashed });
                console.log(`✅ Usuário "${u.username}" criado.`);
            } else {
                console.log(`ℹ️ Usuário "${u.username}" já existe.`);
            }
        }
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
