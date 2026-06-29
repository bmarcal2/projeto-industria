import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

router.get('/usuarios', async (req: Request, res: Response) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: { id: true, nome: true, email: true, cargo: true }
        });
        res.status(200).json(usuarios);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar usuários." });
    }
});

router.post('/usuarios', async (req: Request, res: Response) => {
    const { nome, email, senha, cargo } = req.body;
    const cargosValidos = ['ADMINISTRADOR', 'OPERADOR_DE_ESTOQUE', 'FINANCEIRO'];

    if (!cargo || !cargosValidos.includes(cargo)) {
        return res.status(400).json({ erro: "Cargo inválido. Use: ADMINISTRADOR, OPERADOR_DE_ESTOQUE ou FINANCEIRO." });
    }

    try {
        const novoUsuario = await prisma.usuario.create({
            data: { nome, email, senha, cargo }
        });
        res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!", dados: novoUsuario });
    } catch (erro) {
        res.status(400).json({ erro: "Erro ao cadastrar. Verifique se o e-mail já existe." });
    }
});

export default router;