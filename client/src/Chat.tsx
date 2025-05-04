import './Chat.scss';
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface ChatProps {
    username: string;
    room: string;
}

export default function Chat({ username, room }: ChatProps) {
    const socketRef = useRef<Socket | null>(null);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState<{ author: string; text: string }[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        socketRef.current = io('http://localhost:3333');

        socketRef.current.on('connect_error', (error) => {
            console.error('Erro de conexão com o servidor:', error);
        });

        const savedChat = localStorage.getItem(`chatHistory-${room}`);
        if (savedChat) {
            setChat(JSON.parse(savedChat));
        }

        socketRef.current.emit('setUsername', username);
        socketRef.current.emit('joinRoom', room);

        socketRef.current.on('message', (message: { author: string; text: string }) => {
            setChat(prev => {
                const updated = [...prev, message];
                localStorage.setItem(`chatHistory-${room}`, JSON.stringify(updated));
                return updated;
            });
        });

        socketRef.current.on('users', (users: string[]) => {
            setOnlineUsers(users);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [username, room]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat]);

    const sendMessage = () => {
        if (message.trim()) {
            const newMessage = { author: username, text: message };
            socketRef.current?.emit('message', newMessage);
            setMessage('');
        }
    };

    return (
        <div className="chat-wrapper">
            <h1 className="chat-title">Chat - Olá, {username}!</h1>
            <div className="chat-users">
                {onlineUsers.length === 1
                    ? '1 usuário online'
                    : `${onlineUsers.length} usuários online`}
            </div>

            <div className="chat-messages">
                {chat.map((message, i) => (
                    <div
                        key={i}
                        className={`message ${message.author === username ? 'sent' : 'received'}`}
                    >
                        {/* Exibe "Você" para as mensagens enviadas por você */}
                        {message.author !== username && <strong>{message.author}: </strong>}
                        {message.author === username ? 'Você: ' : null}
                        {message.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite sua mensagem"
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>Enviar</button>
            </div>
        </div>
    );
}
