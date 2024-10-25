import {Request, RequestHandler, Response} from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv'; 
dotenv.config();

export namespace AccountsHandler {
    
    export type UserAccount = {
        id: number | undefined;
        completeName:string;
        email:string;
        password:string | undefined;
    };

    async function login() {

        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;

        // passo 1 - conectar-se ao oracle. 
        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let accouts = await connection.execute(
            'SELECT * FROM ACCOUNTS'
        );

        await connection.close();

        console.log(accouts.rows)
    }

    export const loginHandler: RequestHandler = 
        async (req: Request, res: Response) => {
            await login();
            res.statusCode = 200;
            res.send('Login realizado... confira...');
        }
}
