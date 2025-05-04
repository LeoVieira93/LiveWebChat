import App from './app';

const app = new App();

app.server.listen(3333, () => {
    console.log('🚀 Server listening on http://localhost:3333');
});
