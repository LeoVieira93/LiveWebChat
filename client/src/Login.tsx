import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.scss';

interface LoginProps {
    onLogin: (username: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const navigate = useNavigate();

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
                        src="../public/furia-no-name-esports-seeklogo.png"
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
            </div>
        </div>
    );
}
