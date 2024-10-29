import { Request, RequestHandler, Response } from "express";
import { ConnectionHandler } from "../connection";
import OracleDB from "oracledb"
import { Jwt, JwtPayload } from "jsonwebtoken";

export namespace ModeratorHandler {
    // ---------- Funções -----------
    async function evaluateNewEvent(connection: OracleDB.Connection, id_event: number, evaluation: string) {
        let aux = evaluation === 'Aprovado' ? 2 : 4;
        await connection.execute(
            `update events set event_status = :evaluation where event_id = :id_event`,
            [aux, id_event]
        )

        await connection.commit()
    }

    // ---------- Handlers ----------
    export const evaluateNewEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const { id_event, evaluation } = req.body

        if(!id_event || !evaluation) {
            res.status(400).send(`ERRO - Parâmetros Faltando.`)
            return
        }

        try {
            await ConnectionHandler.connectAndExecute(connection => evaluateNewEvent(connection, id_event, evaluation))
            res.status(200).send(`Evento Avaliado!`)
        } catch(error) {
            res.status(500).send(`ERRO - ${error}`)
        }
    }

};