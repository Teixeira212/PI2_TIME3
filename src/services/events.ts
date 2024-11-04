import { Request, RequestHandler, Response } from "express";
import { ConnectionHandler } from "../connection";
import OracleDB from "oracledb"
import { JwtPayload } from 'jsonwebtoken'

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

    async function betOnEvent(connection: OracleDB.Connection, event_title: string, email: string, quotas_amount: number, bet_guess: string) {
        let aux = bet_guess === 'Sim' ? 1 : 2
        const eventResultRaw = await connection.execute<{ EVENT_ID: number, EVENT_QUOTA: number }>(
            `select event_id, event_quota from events where event_title = :event_title`, [ event_title ]
        ) 
        const eventId = eventResultRaw.rows?.[0]?.EVENT_ID;
        const eventQuota = eventResultRaw.rows?.[0]?.EVENT_QUOTA;
        console.log(`EVENT ID: ${eventId}`)
        console.log(`EVENT QUOTA: ${eventQuota}`)
        if (!eventId) {
            console.error("Erro: Nenhum ID de evento encontrado para o título fornecido.");
            return;
        }
        const walletIdRaw = await connection.execute<{ WALLET: number }>(
            `select wallet from accounts where email = :email`, [ email ]
        )
        const walletId = walletIdRaw.rows?.[0]?.WALLET
        console.log(`WALLET ID: ${walletId}`)
        const walletBalanceRaw = await connection.execute<{ BALANCE: number }>(
            `select balance from wallets where wallet_id = :wallet`, [walletId]
        )
        const walletBalance = walletBalanceRaw.rows?.[0]?.BALANCE
        console.log(`WALLET BALANCE: ${walletBalance}`)
        if(walletBalance && eventQuota){
            var eventBet = quotas_amount * eventQuota
            if(walletBalance < eventBet) {
                console.log(`Saldo insuficiente.`)
                return false
            }
        } else {
            console.log(`walletBalance ou eventQuota = UNDEFINED`)
            return false
        }
        await connection.execute(
          `insert into bets (event_id, wallet_id, quotas_amounts, bet_guess) values (:event_id, :wallet_id, :quotas_amount, :bet_guess)`,
          [ eventId, walletId, quotas_amount, aux ]
        )
        await connection.execute(
            `UPDATE wallets SET balance = balance - :eventBet WHERE wallet_id = :walletId`,
            [ eventBet, walletId ]
        )
        await connection.commit()
        return true
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

    export const betOnEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const { event_title, quotas_amount, bet_guess } = req.body
        const email = (req.user as JwtPayload)?.email
        console.log(email)
        if( event_title && quotas_amount && bet_guess ) {
            let betSucess = await ConnectionHandler.connectAndExecute(connection => betOnEvent(connection, event_title, email, quotas_amount, bet_guess))
            if(betSucess) {
                res.status(200).send(`Aposta concluida.`)
            } else {
                res.status(500).send(`ERRO - Falha ao realizar aposta.`)
            }
        } else {
            res.status(400).send(`ERRO - Parâmetros faltando.`)
        }
    }
}