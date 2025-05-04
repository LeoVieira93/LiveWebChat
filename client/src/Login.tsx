import { useState } from 'react';

interface LoginProps {
    onLogin: (username: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleSubmit = () => {
        if (!username.trim() || !password.trim()) {
            setErrorMessage('Usuário e senha são obrigatórios');
            return;
        }

        if (username === 'admin' && password === '1234') {
            onLogin(username);
        } else {
            setErrorMessage('Credenciais inválidas.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2 className="login-title">Bem-vindo ao Chat!</h2>
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
            </div>
        </div>
    );
}

