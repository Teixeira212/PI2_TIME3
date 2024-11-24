import { Request, RequestHandler, Response } from "express";
import { ConnectionHandler } from "../database/connection";
import OracleDB from "oracledb"
import { JwtPayload } from 'jsonwebtoken'

export namespace EventsHandler {
    // ---------- Funções ----------
    async function addNewEvent(connection: OracleDB.Connection, title: string, description: string, quota: number, date_event: string, bet_end: string) {
        let eventInsert = await connection.execute(
            `INSERT INTO events (event_title, event_description, event_quota, event_date, event_bet_ends, event_status) VALUES (:title, :description, :quota, :date_event, :bet_end, 1)`,
            [title, description, quota, date_event, bet_end]
        )
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

    async function betOnEvent(connection: OracleDB.Connection, event_title: string, email: string, quotas_amount: number, bet_guess: string): Promise<boolean> {
        try {
            if (typeof quotas_amount !== 'number' || quotas_amount <= 0) {
                console.log(`Quotas_amount inválido.`);
                return false;
            }
            const aux = bet_guess === 'Sim' ? 1 : 2;
            const query = `
                SELECT e.event_id, e.event_quota, a.wallet, w.balance
                FROM events e
                JOIN accounts a ON a.email = :email
                JOIN wallets w ON w.wallet_id = a.wallet
                WHERE e.event_title = :event_title
            `;
            const result = await connection.execute<{
                EVENT_ID: number; EVENT_QUOTA: number; WALLET: number; BALANCE: number;
            }> (query, [email, event_title]);
    
            const { EVENT_ID: eventId, EVENT_QUOTA: eventQuota, WALLET: walletId, BALANCE: walletBalance } = result.rows?.[0] || {};
    
            if (!eventId || walletId === undefined || walletBalance === undefined || eventQuota === undefined) {
                console.error("Erro: Dados de evento ou carteira não encontrados.");
                return false;
            }
    
            console.log(`EVENT ID: ${eventId}, EVENT QUOTA: ${eventQuota}, WALLET ID: ${walletId}, WALLET BALANCE: ${walletBalance}`);
    
            const eventBet = quotas_amount * eventQuota;
            if (walletBalance < eventBet) {
                console.log(`Saldo insuficiente.`);
                return false;
            }
            await connection.execute(
                `INSERT INTO bets (event_id, wallet_id, quotas_amounts, bet_guess) VALUES (:event_id, :wallet_id, :quotas_amount, :bet_guess)`,
                [eventId, walletId, quotas_amount, aux]
            );
    
            await connection.execute(
                `UPDATE wallets SET balance = balance - :eventBet WHERE wallet_id = :walletId`,
                [eventBet, walletId]
            );
    
            await connection.commit();
            console.log(`Aposta realizada com sucesso para o usuário ${email}.`);
            return true;
    
        } catch (error) {
            console.error(`Erro ao executar a operação de aposta: ${error}`);
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(`Erro ao fazer rollback: ${rollbackError}`);
            }
            return false;
        }
    }
    async function searchEvent(connection: OracleDB.Connection) {
        
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
        const { event_title, quotas_amount, bet_guess } = req.body;
        const email = (req.user as JwtPayload)?.email;
        console.log(`Usuário autenticado: ${email}`);
    
        if (!event_title || !quotas_amount || !bet_guess) {
            res.status(400).send(`ERRO - Parâmetros faltando.`);
            return;
        }
        try {
            const betSuccess = await ConnectionHandler.connectAndExecute(connection => betOnEvent(connection, event_title, email, quotas_amount, bet_guess));
    
            if (betSuccess) {
                res.status(200).send(`Aposta concluída com sucesso.`);
            } else {
                res.status(500).send(`ERRO - Falha ao realizar aposta. Verifique o saldo ou os detalhes da aposta.`);
            }
        } catch (error) {
            console.error(`Erro no handler de aposta: ${error}`);
            res.status(500).send(`ERRO - Ocorreu um problema interno.`);
        }
    };
}