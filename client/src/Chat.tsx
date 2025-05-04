import './Chat.scss';
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io('http://localhost:3333');

export default function Chat() {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        socket.on('message', (message: string) => {
            setChat((prev) => [...prev, message]);
        });
    }, []);

    const sendMessage = () => {
        if (message.trim() === '') return;
        socket.emit('message', message);
        setChat((prev) => [...prev, `Você: ${message}`]);
        setMessage('');
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat]);

    return (
        <div className="chat-container">
            <div className="chat-box">
                {chat.map((message, i) => (
                    <div key={i} className="chat-message">
                        {message}
                    </div>
                ))}
                <div ref={messagesEndRef}></div>
            </div>
            <div className="chat-input-wrapper">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="chat-input"
                    placeholder="Digite uma mensagem"
                />
                <button
                    onClick={sendMessage}
                    className="chat-button"
                >
                    Enviar
                </button>
            </div>
        </div>
    );
}
