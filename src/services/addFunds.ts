import { ConnectionHandler } from '../database/connection';
import { Wallet } from '../models/Wallet';
import { auth } from '../microServices/tokenAuth';
import OracleDB from "oracledb";

export const addFunds = async (connection: OracleDB.Connection, wallet: Wallet, token: string): Promise<{ success: boolean; error?: string; }> => {
    try {
        console.log("Entrou na função addFunds")
        let authResult = await ConnectionHandler.connectAndExecute(connection => auth(connection, token))
        if (!authResult.success) {
            return { success: false, error: authResult.error }
        }
        const userId = authResult.userId;
        const isMod = authResult.isMod;
        if (isMod) {
            return { success: false, error: "Não é possível adicionar fundos como Moderador" }
        }
        console.log("Passou o auth")
        const amount = wallet.balance
        if (!amount) {
            return { success: false, error: "Campos faltando." };
        }
        console.log("Passou verificação de Campo")
        const amountCents = amount * 100
        console.log("Passou o amountCents")
        const getBalance: any = await connection.execute(
            `SELECT balance, id FROM wallets WHERE owner_id = :userId`,
            [userId],
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        )
        const walletId = getBalance.rows[0]['ID']
        const actualBalance = getBalance.rows[0]['BALANCE'] 
        const newBalance = actualBalance + amountCents
        console.log("Novo saldo", newBalance)
        await connection.execute(
            `UPDATE wallets SET balance = :newBalance WHERE owner_id = :userId`,
            [newBalance, userId]
        );
        console.log("Adicionou saldo")
        await connection.execute(
            `INSERT INTO wallet_history (transaction_type, amount, wallet_id) VALUES ('Depósito', :amountCents, :walletId)`,
            [amountCents, walletId]
        )
        connection.commit()
        return { success: true }
    } catch (error: unknown) {
        console.error("Erro ao depositar fundos: ", error);
        return { success: false, error: "Erro desconhecido ao depositar fundos" };
    }
};