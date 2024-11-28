import { ConnectionHandler } from '../database/connection';
import { evaluateEvent } from '../services/evaluateEvent';
import { EvaluateInfo } from '../models/EvaluateInfo';
import express from 'express';

const router = express.Router();

router.post('/evaluateEvent', async (req, res) => {
    const evaluateInfo: EvaluateInfo = req.body;
    const { authorization } = req.headers
    const token = authorization?.split(' ')[1]
    if(!token) {
        res.status(400).json({ error: 'Token não fornecido' })
        return;
    }
    console.log(evaluateInfo)

    try {
        let result = await ConnectionHandler.connectAndExecute(connection => evaluateEvent(connection, evaluateInfo, token))
        if (result.success && result.data) {
            res.status(201).json({
                message: `Evento avaliado com sucesso.`
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