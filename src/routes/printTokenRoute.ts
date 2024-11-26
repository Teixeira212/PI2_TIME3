import { printToken } from '../services/printToken';
import express from 'express';

const router = express.Router();

router.post('/printToken', async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.split(' ')[1]
    if(!token) {
        res.status(400).json({ error: 'Token não fornecido' })
        return;
    }

    try {
        let result = await printToken(token)
        console.log(result)
        if (result.success) {
            res.status(201).json({
                message: `Token printado com sucesso.`
            });
        } else {
            res.status(400).json({ error: result.error })
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Erro desconhecido.' });
        }
    }
});

export default router;