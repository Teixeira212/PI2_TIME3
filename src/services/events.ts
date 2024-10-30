import { Request, RequestHandler, Response } from "express";
import { ConnectionHandler } from "../connection";
import OracleDB from "oracledb"

export namespace EventsHandler {
    // ---------- Funções ----------
    async function addNewEvent(connection: OracleDB.Connection, title: string, description: string, quota: number, date_event: string, bet_end: string) {
        let eventInsert = await connection.execute(
            `INSERT INTO events (event_title, event_description, event_quota, event_date, event_bet_ends, event_status) VALUES (:title, :description, :quota, :date_event, :bet_end, 1)`,
            [title, description, quota, date_event, bet_end]
        )
        console.log(eventInsert)
        await connection.commit()
    }

    // APRIMORAR PRINT DOS EVENTOS
    async function getEvents(connection: OracleDB.Connection, categorie: string, content: number) {
        if(categorie === 'todas'){
            var selectedEvents = await connection.execute(
                `select * from events` // 
            )
        } else {
            var selectedEvents = await connection.execute(
                `select * from events where ${categorie} = :content`, 
                [content]
            )
        }
        console.log(selectedEvents)
        return selectedEvents
    }

    async function deleteEvent(connection: OracleDB.Connection, title: string) {
        await connection.execute(
            `update events set event_status = 4 where event_title = :title`,
            [title]
        )
        connection.commit()
    }
    
    // ---------- Handlers ----------
    export const addNewEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const { title, description, quota, date_event, bet_end } = req.body;
        if(title && description && quota && date_event && bet_end){
            try {
                await ConnectionHandler.connectAndExecute(connection => addNewEvent(connection, title, description, quota, date_event, bet_end))
                res.status(200).send(`Evento cadastrado! Aguardado aprovação.`)
            } catch(error) {
                res.status(500).send(`ERRO - Falha ao cadastrar evento.\n${error}`)
            }
        } else {
            res.status(400).send(`ERRO - Parâmetros faltando.`)
        }
    }

    export const getEventsHandler: RequestHandler = async (req: Request, res: Response) => {
        const { categorie, content } = req.body
        if(categorie && content){
            try {
                let foundEvents = await ConnectionHandler.connectAndExecute(connection => getEvents(connection, categorie, content))
                res.status(200).send(`Eventos encontrados: \n${JSON.stringify(foundEvents)}`)
            } catch(error) {
                res.status(500).send(`ERRO - Falha ao pesquisar eventos.\n${error}`)
            }
        } else {
            res.status(400).send(`ERRO - Parâmetros faltando.`)
        }
    }

    export const deleteEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const { title } = req.body
        if( title ) {
            try {
                await ConnectionHandler.connectAndExecute(connection => deleteEvent(connection, title))
                res.status(200).send(`Evento deletado.`)
            } catch(error) {
                res.status(500).send(`ERRO - Falha ao deletar evento.\n${error}`)
            }
        } else {
            res.status(400).send(`ERRO - Parâmetros faltando.`)
        }
    }
}