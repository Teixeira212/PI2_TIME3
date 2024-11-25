import { Request, RequestHandler, Response } from "express";
import { ConnectionHandler } from "../database/connection";
import OracleDB from "oracledb"

export namespace ModeratorHandler {
    // ---------- Funções ----------
    async function evaluateNewEvent(connection: OracleDB.Connection, id_event: number, evaluation: string) {
        let aux = evaluation === 'Aprovado' ? 2 : 4;
        await connection.execute(
            `update events set event_status = :evaluation where event_id = :id_event`,
            [aux, id_event]
        )
        if (aux === 2){
            await connection.execute(
                `update events set event_bet_starts = SYSDATE where event_id = :id_event`,
                [id_event]
            )
        }
        
        await connection.commit()
    }

    async function finishEvent(connection: OracleDB.Connection, id_event: number, result: string) {
        let aux = result === 'Sim' ? 1 : 2
        await connection.execute(
            `update events set event_result = :result where event_id = :id_event`,
            [aux, id_event]
        )
        // const queryResult = await connection.execute<{ QUOTAS_AMOUNTS: number, WALLET_ID: number }>(
        //     `SELECT quotas_amounts, wallet_id FROM bets WHERE event_id = :id_event`,
        //     [id_event]
        // ) 
        // const queryResult_event = await connection.execute<{ EVENT_QUOTA: number }>(
        //     `select event_quota from events where event_id = :id_event`,
        //     [id_event]
        // )
        // const quotasAmountsList: number[] | undefined = queryResult.rows?.map(row => row?.QUOTAS_AMOUNTS);
        // const walletIdList: number[] | undefined = queryResult.rows?.map(row => row?.WALLET_ID);
        // const quotasValue = queryResult_event.rows?.map(row => row?.EVENT_QUOTA);
        // console.log(quotasAmountsList)
        // console.log(walletIdList)
        // console.log(quotasValue)
        // if (quotasAmountsList && quotasValue && quotasValue.length > 0) { 
        //     const totalQuotas = quotasAmountsList.reduce((acc, amount) => acc + amount, 0);
        //     const totalValue = totalQuotas * quotasValue[0]; 
        //     console.log(`Total de cotas: ${totalQuotas}`); 
        //     console.log(`Valor total: ${totalValue}`); 
        // } else { 
        //     console.log("Não foram encontrados valores de QUOTAS_AMOUNTS ou EVENT_QUOTA."); 
        // }
        // await connection.execute(
        //     `update wallets set balance = balance + `
        // )
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
            res.status(500).send(`ERRO - Falha ao avaliar evento.\n${error}`)
        }
    }

    export const finishEventHandler: RequestHandler = async (req: Request, res: Response) => {
        const { id_event, result } = req.body
        if(id_event && result) {
            await ConnectionHandler.connectAndExecute(connection => finishEvent(connection, id_event, result))
            res.status(200).send(`Evento Finalizado!`)
        } else {
            res.status(400).send(`ERRO - Parâmetros Faltando.`)
        }
    }

};