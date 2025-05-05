# 💬 Realtime Chat App

Aplicação de chat em tempo real com autenticação JWT e login via Google, desenvolvida com TypeScript, Express, MongoDB, Socket.IO e Next.js.

## 🚀 Tecnologias Utilizadas

- **Frontend:** Next.js, TypeScript, SCSS
- **Backend:** Node.js, Express, Socket.IO
- **Banco de Dados:** MongoDB
- **Autenticação:** JWT + Google OAuth 2.0
- **Outros:** Mongoose, Passport, Bcrypt

## 🔐 Funcionalidades

- Cadastro de usuários
- Login com usuário/senha ou Google
- Comunicação em tempo real via WebSocket
- Salas de chat com contador de usuários online
- Rota protegida com token JWT
- Usuários iniciais pré-cadastrados

## 🧪 Usuários de Teste

| Username   | Senha  |
|------------|--------|
| LeoVieira  | 12345  |
| Tety       | 12345  |
| admin      | 12345  |

---

## ⚙️ Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo
```

### 2. Variáveis de ambiente

#### Backend - `.env`

Crie o arquivo `.env` no diretório `/backend` com:

```
JWT_SECRET=uma_chave_secreta_segura
GOOGLE_CLIENT_ID=sua_google_client_id
GOOGLE_CLIENT_SECRET=sua_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

> ⚠️ **Nunca suba esse arquivo para o GitHub!** Use um `.gitignore` para protegê-lo.

### 3. Instalação

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

### 4. Executando a aplicação

- **Inicie o MongoDB localmente** (por exemplo, com `mongod`)
- **Backend:**

```bash
cd backend
npm run dev
```

- **Frontend:**

```bash
cd ../frontend
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173) no navegador.

---

## 📁 Estrutura

```
.
├── backend/
│   ├── app.ts
│   ├── authMiddleware.ts
│   ├── .env
│   └── ...
├── frontend/
│   ├── pages/
│   ├── styles/
│   ├── .env.local
│   └── ...
```

---

## 🛠️ Futuras melhorias

- Armazenamento de mensagens em banco de dados
- Listagem de salas dinâmicas
- Avatares e perfis de usuário
- Tema escuro/claro

---

## 📄 Licença

Este projeto é open-source sob a licença [MIT](LICENSE).

