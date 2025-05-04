import './Header.scss';
import { Page } from './types';

interface HeaderProps {
    onLogout: () => void;
    currentPage: Page;
    setCurrentPage: React.Dispatch<React.SetStateAction<Page>>;
}

export default function Header({ onLogout, currentPage, setCurrentPage }: HeaderProps) {
    return (
        <header className="header">
            <nav className="nav">
                <button
                    className={currentPage === 'home' ? 'active' : ''}
                    onClick={() => setCurrentPage('home')}
                >
                    Home
                </button>
                <button
                    className={currentPage === 'noticias' ? 'active' : ''}
                    onClick={() => setCurrentPage('noticias')}
                >
                    Notícias
                </button>
                <button
                    className={currentPage === 'loja' ? 'active' : ''}
                    onClick={() => setCurrentPage('loja')}
                >
                    Loja
                </button>
            </nav>
            <button className="logout" onClick={onLogout}>Sair</button>
        </header>
    );
}
