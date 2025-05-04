import './Chat.scss';
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface ChatProps {
    username: string;
}

export default function Chat({ username }: ChatProps) {
    const socketRef = useRef<Socket | null>(null);

    const [message, setMessage] = useState('');
    const [chat, setChat] = useState<{ author: string; text: string }[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        socketRef.current = io('http://localhost:3333');

        const savedChat = localStorage.getItem('chatHistory');
        if (savedChat) {
            setChat(JSON.parse(savedChat));
        }

        socketRef.current.emit('setUsername', username);

        socketRef.current.on('message', (message: { author: string; text: string }) => {
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
    }, [username]);

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

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setMessage((prevMessage) => prevMessage + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    return (
        <div className="chat-container">
            <h1 className="chat-title">Chat - Olá, {username}!</h1>

            <div className="chat-users">
                {onlineUsers.length === 1
                    ? '1 usuário online'
                    : `${onlineUsers.length} usuários online`}
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
                <button
                    className="emoji-button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                    😊
                </button>
                {showEmojiPicker && (
                    <div className="emoji-picker">
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                )}
            </div>
        </div>
    );
}
