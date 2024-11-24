import { Request, RequestHandler, Response } from "express"
import { ConnectionHandler } from "./database/connection"
import OracleDB from "oracledb"

export namespace testHandler {
    async function userTest(connection: OracleDB.Connection) {
        let query = await connection.execute(
            `CREATE TABLE IF NOT EXISTS teste (
                id NUMBER PRIMARY KEY, 
                teste VARCHAR2(30)
            )`, [], { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        )
        console.log(query)
    }

    export const userTestHandler: RequestHandler = async (req: Request, res: Response) => {
        await ConnectionHandler.connectAndExecute(connection => userTest(connection))
        res.status(200).send(`Cadastro realizado com sucesso.`)
    }
}