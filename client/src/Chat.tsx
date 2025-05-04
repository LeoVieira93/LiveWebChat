import './Chat.scss';
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

export default function Chat() {
    const socketRef = useRef<Socket | null>(null);

    const [username, setUsername] = useState('');
    const [hasJoined, setHasJoined] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState<{ author: string; text: string }[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        socketRef.current = io('http://localhost:3333');

        const savedChat = localStorage.getItem('chatHistory');
        if (savedChat) {
            setChat(JSON.parse(savedChat));
        }

        socketRef.current.on('message', (message: { author: string; text: string }) => {
            console.log('Mensagem recebida do servidor:', message);
            setChat(prev => {
                const updated = [...prev, message];
                localStorage.setItem('chatHistory', JSON.stringify(updated));
                return updated;
            });
        });

        socketRef.current.on('users', (users: string[]) => {
            setOnlineUsers(users);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat]);

    const joinChat = () => {
        if (username.trim()) {
            socketRef.current?.emit('setUsername', username);
            setHasJoined(true);
        }
    };

    const sendMessage = () => {
        if (message.trim()) {
            const newMessage = { author: username, text: message };
            socketRef.current?.emit('message', newMessage);
            setMessage('');
        }
    };

    if (!hasJoined) {
        return (
            <div className="join-container">
                <div className="join-box">
                    <h2 className="join-title">Digite seu nome para entrar</h2>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="join-input"
                        placeholder="Seu nome"
                        onKeyDown={(e) => e.key === 'Enter' && joinChat()}
                    />
                    <button onClick={joinChat} className="join-button">
                        Entrar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-container">
            <h1 className="chat-title">Chat</h1>

            <div className="chat-users">
                Usuários online: {onlineUsers.length === 1 ? '1 usuário online' : `${onlineUsers.length} usuários online`}
            </div>

            <div className="chat-box">
                {chat.map((message, i) => (
                    <div
                        key={i}
                        className={`chat-message ${message.author === username ? 'sent' : 'received'}`}
                    >
                        {message.author !== username && <strong>{message.author}: </strong>}
                        {message.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-wrapper">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="chat-input"
                    placeholder="Digite sua mensagem"
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage} className="chat-button">
                    Enviar
                </button>
            </div>
        </div>
    );
}
