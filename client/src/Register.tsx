import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Importar hook
import './Register.scss';

interface RegisterProps {
    onRegisterSuccess: (username: string) => void;
}

export default function Register({ onRegisterSuccess }: RegisterProps) {
    const navigate = useNavigate(); // ✅ Inicializar hook
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        cpf: '',
        email: '',
        phone: '',
    });

    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('http://localhost:3333/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.error || 'Erro ao registrar usuário.');
                return;
            }

            onRegisterSuccess(formData.username);
        } catch (error) {
            console.error(error);
            setErrorMessage('Erro ao conectar com o servidor.');
        }
    };

    const handleBack = () => {
        navigate('/'); // ✅ Volta para a tela de login
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Cadastro</h2>
                <input type="text" name="username" placeholder="Usuário" onChange={handleChange} className="login-input" />
                <input type="password" name="password" placeholder="Senha" onChange={handleChange} className="login-input" />
                <input type="text" name="fullName" placeholder="Nome completo" onChange={handleChange} className="login-input" />
                <input type="text" name="cpf" placeholder="CPF" onChange={handleChange} className="login-input" />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} className="login-input" />
                <input type="text" name="phone" placeholder="Telefone" onChange={handleChange} className="login-input" />
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <div className="button-group">
                    <button onClick={handleSubmit} className="login-button">Cadastrar</button>
                    <button onClick={handleBack} className="login-button">Voltar</button>
                </div>
            </div>
        </div>
    );
}
