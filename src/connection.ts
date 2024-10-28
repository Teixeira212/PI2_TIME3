import { Request, RequestHandler, Response } from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv';
dotenv.config()

export namespace ConnectionHandler {
    export async function connectAndExecute(callback: (connection: OracleDB.Connection) => Promise<any>): Promise<any> {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;
        let connection;

        try {
            connection = await OracleDB.getConnection({
                user: process.env.ORACLE_USER,
                password: process.env.ORACLE_PASSWORD,
                connectString: process.env.ORACLE_CONN_STR
            });

            return await callback(connection); // Executa a função passada por parâmetro

        } catch (error) {
            console.error('Erro na operação:', error);
        } finally { // Fecha a conexão
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Erro ao fechar conexão:', closeError);
                }
            }
        }
    }
}