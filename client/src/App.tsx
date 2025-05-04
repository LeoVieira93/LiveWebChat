import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

import Login from './Login';
import Header from './Header';
import Chat from './Chat';
import { Page } from './types.ts';
import './App.scss';

function Home() {
    return (
        <div className="home-cards">
            <Link to="/cs2">
                <div className="card clickable">
                    <div className="card-content">
                        <div className="card-images">
                            <img src="/CS2.png" alt="Counter Strike 2" className="card-image" />
                            <img src="/furia-no-name-esports-seeklogo.png" alt="Furia Esports" className="card-image" />
                        </div>
                        <h2>Counter Strike 2</h2>
                    </div>
                </div>
            </Link>
            <Link to="/kings-league">
                <div className="card clickable">
                    <div className="card-content">
                        <div className="card-images">
                            <img src="/KingsLeague.png" alt="Kings League" className="card-image" />
                            <img src="/FuriaKings.png" alt="Furia Kings" className="card-image" />
                        </div>
                        <h2>Kings League Brasil</h2>
                    </div>
                </div>
            </Link>
        </div>
    );
}

function CS2() {
    return (
        <div className="page-content cs2-page">
            <h2>Counter Strike 2</h2>
            <div className="home-cards">
                <a href="https://www.hltv.org/team/8297/furia#tab-eventsBox" target="_blank" rel="noopener noreferrer">
                    <div className="card clickable">
                        <div className="card-content">
                            <div className="card-images">
                                <img src="/CS2.png" alt="Competições" className="card-image" />
                                <img src="/furia-no-name-esports-seeklogo.png" alt="Competições" className="card-image" />
                            </div>
                            <h2>Competições</h2>
                        </div>
                    </div>
                </a>
                <Link to="/cs2/transmissao">
                    <div className="card clickable">
                        <div className="card-content">
                            <div className="card-images">
                                <img src="/CS2.png" alt="Transmissão" className="card-image" />
                                <img src="/furia-no-name-esports-seeklogo.png" alt="Transmissão" className="card-image" />
                            </div>
                            <h2>Transmissão</h2>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

function KingsLeague() {
    return (
        <div className="page-content">
            <h2>Kings League Brasil</h2>
            <div className="home-cards">
                <a href="https://kingsleague.pro/pt/brazil/classificacao" target="_blank" rel="noopener noreferrer">
                    <div className="card clickable">
                        <div className="card-content">
                            <div className="card-images">
                                <img src="/KingsLeague.png" alt="Classificação" className="card-image" />
                                <img src="/FuriaKings.png" alt="Classificação" className="card-image" />
                            </div>
                            <h2>Classificação</h2>
                        </div>
                    </div>
                </a>
                <Link to="/kings-league/transmissao">
                    <div className="card clickable">
                        <div className="card-content">
                            <div className="card-images">
                                <img src="/KingsLeague.png" alt="Transmissão" className="card-image" />
                                <img src="/FuriaKings.png" alt="Transmissão" className="card-image" />
                            </div>
                            <h2>Transmissão</h2>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

function CS2Transmissao({ username }: { username: string }) {
    return (
        <div className="transmissao-page">
            <div className="stream-chat-wrapper">
                <div className="video-player">
                    <iframe
                        src="https://www.youtube.com/embed/mUgxBJvkYhw?si=SZqFz4cXXqZbLAHV"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                </div>
                <div className="chat-wrapper">
                    <Chat username={username} room="cs2" />
                </div>
            </div>
        </div>
    );
}

function KingsLeagueTransmissao({ username }: { username: string }) {
    return (
        <div className="transmissao-page">
            <div className="stream-chat-wrapper">
                <div className="video-player">
                    <iframe
                        src="https://www.youtube.com/embed/mhPbU8x1j0s?si=8KA1QIlrHdq5zvHT"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                </div>
                <div className="chat-wrapper">
                    <Chat username={username} room="kings-league" />
                </div>
            </div>
        </div>
    );
}

export default function App() {
    const [username, setUsername] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (username && !socketRef.current) {
            socketRef.current = io('http://localhost:3333');

            socketRef.current.emit('setUsername', username);

            socketRef.current.on('connect_error', (error) => {
                console.error('Conexão com o servidor falhou', error);
            });
        }

        return () => {
            socketRef.current?.disconnect();
        };
    }, [username]);

    if (!username) return <Login onLogin={setUsername} />;

    return (
        <Router>
            <Header
                onLogout={() => {
                    setUsername(null);
                    localStorage.removeItem('chatHistory');
                    socketRef.current?.disconnect();
                    socketRef.current = null;
                }}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cs2" element={<CS2 />} />
                <Route path="/kings-league" element={<KingsLeague />} />
                <Route path="/cs2/transmissao" element={<CS2Transmissao username={username} />} />
                <Route path="/kings-league/transmissao" element={<KingsLeagueTransmissao username={username} />} />
                <Route path="/noticias" element={<div style={{ padding: '1rem' }}>📰 Notícias em breve!</div>} />
                <Route path="/loja" element={<div style={{ padding: '1rem' }}>🛍️ Loja em construção!</div>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}
