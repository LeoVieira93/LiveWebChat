import { Link } from 'react-router-dom';
import './Header.scss';
import { Page } from './types';

interface HeaderProps {
    onLogout: () => void;
    currentPage: Page;
    setCurrentPage: React.Dispatch<React.SetStateAction<Page>>;
    username: string;
}

export default function Header({ onLogout, currentPage, setCurrentPage, username }: HeaderProps) {
    return (
        <header className="header">
            <nav className="nav">
                <img
                    src="../public/furia-esports-seeklogo.png"
                    alt="Furia Esports"
                    className="header-logo"
                />
                <Link
                    to="/"
                    className={currentPage === 'home' ? 'active' : ''}
                    onClick={() => setCurrentPage('home')}
                >
                    Home
                </Link>
                <Link
                    to="/noticias"
                    className={currentPage === 'noticias' ? 'active' : ''}
                    onClick={() => setCurrentPage('noticias')}
                >
                    Notícias
                </Link>
                <a
                    href="https://www.furia.gg/"
                    className={currentPage === 'loja' ? 'active' : ''}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setCurrentPage('loja')}
                >
                    Loja
                </a>
            </nav>
            <div className="user-info">
                <span className="username">Olá, {username}</span>
                <button className="logout" onClick={onLogout}>Sair</button>
            </div>
        </header>
    );
}
