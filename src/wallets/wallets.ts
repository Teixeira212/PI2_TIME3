import { Request, RequestHandler, Response } from "express";
import { ConnectionHandler } from "../database/connection";
import OracleDB from "oracledb";
import { JwtPayload } from 'jsonwebtoken'

export namespace WalletsHandler {
    // ---------- Funções ----------
    async function addFunds(connection: OracleDB.Connection, req: Request, name: string, card_number:string, expiry: string, cvv: number, amount: number) {
        const email = (req.user as JwtPayload)?.email
        await connection.execute(
            `UPDATE wallets SET balance = balance + :amount WHERE wallet_id = (
                SELECT wallet FROM accounts WHERE email = :email
            )`,
            [ amount, email ]
        )

        await connection.commit()
    }

    async function withdrawFunds(connection: OracleDB.Connection, req: Request, amount: number) {
        const email = (req.user as JwtPayload)?.email
        await connection.execute(
            `UPDATE wallets SET balance = balance - :amount WHERE wallet_id = (
                SELECT wallet FROM accounts WHERE email = :email
            )`,
            [ amount, email ]
        )

        await connection.commit()
    }

    // ---------- Handlers ----------
    export const addFundsHandler: RequestHandler = async (req: Request, res: Response) => {
        const { name, card_number, expiry, cvv, amount } = req.body
        if(name && card_number && expiry && cvv && amount) {
            try {
                await ConnectionHandler.connectAndExecute(connection => (addFunds(connection, req, name, card_number, expiry, cvv, amount)))
                res.status(200).send(`Fundos adicionados com sucesso!`)
            } catch(error) {
                res.status(500).send(`ERRO - Falha ao adicionar fundos.\n${error}`)
            }
        }
    }

    export const withdrawFundsHandler: RequestHandler = async (req: Request, res: Response) => {
        const { amount } = req.body
        if(amount) {
            try {
                await ConnectionHandler.connectAndExecute(connection => (withdrawFunds(connection, req, amount)))
                res.status(200).send(`Fundos sacados com sucesso!`)
            } catch(error) {
                res.status(500).send(`ERRO - Falha ao sacar fundos.\n${error}`)
            }
        }
    }
}   