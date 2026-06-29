import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

router.get('/produtos', async (req: Request, res: Response) => {
    try {
        const produtos = await prisma.estoque.findMany();
        res.status(200).json(produtos);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao carregar os itens do estoque." });
    }
});

router.post('/produtos', async (req: Request, res: Response) => {
    const { nome, descricao, quantidade, preco } = req.body;
    try {
        const novoProduto = await prisma.estoque.create({
            data: { 
                nome, 
                descricao, 
                quantidade: Number(quantidade), 
                preco: Number(preco) 
            }
        });
        res.status(201).json({ mensagem: "Produto adicionado ao estoque!", novoProduto });
    } catch (erro) {
        res.status(400).json({ erro: "Erro ao registrar produto no estoque." });
    }
});

router.post('/movimentacoes', async (req: Request, res: Response) => {
    const { tipo, quantidade, valor, estoqueId, usuarioId } = req.body;

    if (!tipo || !quantidade || !valor || !estoqueId || !usuarioId) {
        return res.status(400).json({ erro: "Todos os campos estruturais (tipo, quantidade, valor, estoqueId, usuarioId) são obrigatórios." });
    }

    try {
        const produto = await prisma.estoque.findUnique({ where: { id: Number(estoqueId) } });
        if (!produto) return res.status(404).json({ erro: "Item de estoque não encontrado." });

        let quantidadeCalculada = produto.quantidade;

        if (tipo === "ENTRADA") {
            quantidadeCalculada += Number(quantidade);
        } else if (tipo === "SAIDA") {
            if (produto.quantidade < quantidade) {
                return res.status(400).json({ erro: "Saldo insuficiente em estoque para concluir esta saída." });
            }
            quantidadeCalculada -= Number(quantidade);
        } else {
            return res.status(400).json({ erro: "Tipo de movimentação inválido. Use ENTRADA ou SAIDA." });
        }

        const [novaMovimentacao, estoqueAtualizado] = await prisma.$transaction([
            prisma.movimentacao.create({
                data: { 
                    tipo, 
                    quantidade: Number(quantidade), 
                    valor: Number(valor), 
                    estoqueId: Number(estoqueId), 
                    usuarioId: Number(usuarioId) 
                }
            }),
            prisma.estoque.update({
                where: { id: Number(estoqueId) },
                data: { quantidade: quantidadeCalculada }
            })
        ]);

        if (quantidadeCalculada <= 10) {
            console.log("\x1b[31m%s\x1b[0m", `⚠️ [ALERTA DE ESTOQUE] O item "${produto.nome}" está operando com nível crítico! Restam apenas ${quantidadeCalculada} unidades.`);
        }

        res.status(201).json({
            mensagem: `Movimentação de ${tipo} concluída com sucesso!`,
            estoqueAtualizado
        });

    } catch (erro) {
        res.status(500).json({ erro: "Falha ao registrar movimentação nas tabelas locais do banco." });
    }
});

export default router;