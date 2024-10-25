import {Request, RequestHandler, Response} from "express";
import OracleDB from "oracledb";
import dotenv from 'dotenv'; 
dotenv.config();

export namespace AccountsHandler {

    async function connection() {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;
 
        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        });

        let accounts = await connection.execute(
            'SELECT * FROM ACCOUNTS'
        );
        await connection.close();

        console.log(accounts.rows)
    }

    async function signUp(username: string, email: string, password: string) {
        OracleDB.outFormat = OracleDB.OUT_FORMAT_OBJECT;
        let connection = await OracleDB.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONN_STR
        })

        await connection.execute(
            `INSERT INTO accounts (username, email, password) VALUES (:username, :email, :password)`,
            [username, email, password]
        )
        await connection.commit()
        await connection.close()
    }

    export const signUpHandler: RequestHandler =
        async (req: Request, res: Response) => {
            const { username, email, password } = req.body
            if(username && email && password) {
                await signUp(username, email, password)
                res.statusCode = 200
                res.send(`Cadastro realizado com sucesso`)
            } else {
                res.statusCode = 400
                res.send('Parâmetros faltando.')
            }
        }

    export const connectionHandler: RequestHandler = 
        async (req: Request, res: Response) => {
            await connection();
            res.statusCode = 200;
            res.send('Conexão realizada com sucesso!');
        }
}
