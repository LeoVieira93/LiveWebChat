import { useState } from 'react';
import Login from './Login';
import Header from './Header';
import Chat from './Chat';
import { Page } from './types';

export default function App() {
    const [username, setUsername] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [cs2ShowStream, setCs2ShowStream] = useState(false);
    const [kingsShowStream, setKingsShowStream] = useState(false);

    const handleLogout = () => {
        setUsername(null);
        localStorage.removeItem('chatHistory');
    };

    return (
        <>
            {username ? (
                <>
                    <Header
                        onLogout={handleLogout}
                        currentPage={currentPage}
                        setCurrentPage={(page) => {
                            setCurrentPage(page);
                            setCs2ShowStream(false);
                            setKingsShowStream(false);
                        }}
                    />
                    {currentPage === 'home' && (
                        <div className="home-cards">
                            <div className="card clickable" onClick={() => setCurrentPage('cs2')}>
                                <h2>🎮 Counter Strike 2</h2>
                                <p>
                                    Vivencie batalhas intensas com gráficos atualizados e uma jogabilidade refinada. CS2 é a nova era do competitivo!
                                </p>
                            </div>
                            <div className="card clickable" onClick={() => setCurrentPage('kings-league')}>
                                <h2>🏆 Kings League</h2>
                                <p>
                                    O futebol reinventado por lendas. Disputas emocionantes e regras únicas que transformam o jogo!
                                </p>
                            </div>
                        </div>
                    )}

                    {currentPage === 'cs2' && (
                        <div className="page-content cs2-page">
                            <h1>Counter Strike 2</h1>

                            <nav className="cs2-nav">
                                <a
                                    href="https://www.hltv.org/team/8297/furia#tab-eventsBox"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    🏆 Competições
                                </a>
                                <a
                                    href="#transmissao"
                                    onClick={() => setCs2ShowStream(true)}
                                >
                                    📺 Transmissão
                                </a>
                            </nav>

                            {cs2ShowStream && (
                                <section id="transmissao" className="cs2-section">
                                    <h2>Transmissão ao Vivo</h2>
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
                                            <Chat username={username!} />
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    )}

                    {currentPage === 'kings-league' && (
                        <div className="page-content">
                            <h1>Kings League</h1>

                            <nav className="cs2-nav">
                                <a
                                    href="https://kingsleague.pro/pt/brazil/classificacao"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    🏆 Classificação
                                </a>
                                <a
                                    href="#transmissao"
                                    onClick={() => setKingsShowStream(true)}
                                >
                                    📺 Transmissão
                                </a>
                            </nav>

                            {kingsShowStream && (
                                <section id="transmissao" className="cs2-section">
                                    <h2>Transmissão ao Vivo</h2>
                                    <div className="stream-chat-wrapper">
                                        <div className="video-player">
                                            <iframe
                                                width="560"
                                                height="315"
                                                src="https://www.youtube.com/embed/mhPbU8x1j0s?si=8KA1QIlrHdq5zvHT"
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                referrerPolicy="strict-origin-when-cross-origin"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                        <div className="chat-wrapper">
                                            <Chat username={username!} />
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    )}

                    {currentPage === 'noticias' && <div style={{ padding: '1rem' }}>📰 Notícias em breve!</div>}
                    {currentPage === 'loja' && <div style={{ padding: '1rem' }}>🛍️ Loja em construção!</div>}
                </>
            ) : (
                <Login onLogin={setUsername} />
            )}
        </>
    );
}
