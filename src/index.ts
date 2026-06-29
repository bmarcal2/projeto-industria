import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import usuarioRotas from './routes/usuarioRotas';
import produtoRotas from './routes/produtoRotas';

const app = express();
app.use(express.json());

// Vincula as rotas
app.use('/api', usuarioRotas);
app.use('/api', produtoRotas);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});