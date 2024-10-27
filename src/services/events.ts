import { Request, RequestHandler, Response } from "express";
import { ConnectionHandler } from "../connection";
import OracleDB from "oracledb"

export namespace EventsHandler {
    // ---------- Funções ----------
    async function addNewEvent(connection: OracleDB.Connection, title: string, description: string, quota: number, date_event: string, bet_end: string) {
        // Adicionar novo evento.
        let eventInsert = await connection.execute(
            `INSERT INTO events (event_title, event_description, event_quota, event_date, event_bet_ends, event_status) VALUES (:title, :description, :quota, :date_event, :bet_end, 1)`,
            [title, description, quota, date_event, bet_end]
        )
        console.log(eventInsert)
        await connection.commit()
    }
    
    // ---------- Handlers ----------
    export const addNewEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const { title, description, quota, date_event, bet_end } = req.body;
        if(title && description && quota && date_event && bet_end){
            try {
                await ConnectionHandler.connectAndExecute(connection => addNewEvent(connection, title, description, quota, date_event, bet_end))
                res.status(200).send(`Evento cadastrado! Aguardado aprovação.`)
            } catch(error) {
                res.status(500).send(`ERRO - Falha ao cadastrar evento.`)
            }
        } else {
            res.status(400).send(`ERRO - Parâmetros faltando.`)
        }
    }
}