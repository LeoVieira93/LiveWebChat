import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Login.scss';

interface LoginProps {
    onLogin: (username: string) => void;
}

interface DecodedToken {
    username: string;
    id: string;
    exp: number;
    iat: number;
}

export default function Login({ onLogin }: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                localStorage.setItem('token', token);
                onLogin(decoded.username);
                navigate('/chat');
            } catch (err) {
                console.error('Token JWT inválido:', err);
                setErrorMessage('Erro ao processar login com Google.');
            }
        }
    }, [location.search]);

    const handleSubmit = async () => {
        if (!username.trim() || !password.trim()) {
            setErrorMessage('Usuário e senha são obrigatórios');
            return;
        }

        try {
            const response = await fetch('http://localhost:3333/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.error || 'Erro ao fazer login.');
                return;
            }

            localStorage.setItem('token', data.token);
            onLogin(username);
            navigate('/chat');
        } catch (err) {
            console.error('Erro ao fazer login:', err);
            setErrorMessage('Erro de conexão com o servidor.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <img
                        src="/furia-no-name-esports-seeklogo.png"
                        alt="Furia Esports"
                        className="login-logo"
                    />
                    <h2 className="login-title">Furia's Fan Lounge</h2>
                </div>

                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="login-input"
                    placeholder="Usuário"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                    placeholder="Senha"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />

                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <button onClick={handleSubmit} className="login-button">
                    Entrar
                </button>

                <button
                    className="login-button secondary-button"
                    onClick={() => navigate('/register')}
                >
                    Criar Conta
                </button>

                <button
                    className="login-button google-button"
                    onClick={() => window.location.href = 'http://localhost:3333/auth/google'}
                >
                    Entrar com Google
                </button>
            </div>
        </div>
    );
}
