import { Request, RequestHandler, Response, NextFunction } from "express";
import { ConnectionHandler } from "../connection";
import OracleDB from "oracledb";
import jwt from 'jsonwebtoken'

export namespace AccountsHandler {
    // ---------- Funções ----------
    async function signUp(connection: OracleDB.Connection, username: string, email: string, password: string, birthdate: string) {
        await connection.execute(
            `INSERT INTO accounts (username, email, password, birthdate) VALUES (:username, :email, :password, :birthdate)`,
            [username, email, password, birthdate]
        )
        await connection.commit()
    }

    async function login(connection: OracleDB.Connection, email: string, password: string): Promise<boolean> {
        let accounts = await connection.execute(
            `SELECT * FROM accounts WHERE email = :email AND password = :password`,
            [email, password]
        )
        if(accounts.rows && accounts.rows.length > 0) {
            console.log(accounts.rows);
            return true;
        } else {
            console.log(`Usuário não encontrado.`)
            return false;
        }
    }

    function generateToken(email: string): string {
        const secret = process.env.JWT_SECRET || 'defaultSecret';
        return jwt.sign({ email }, secret, { expiresIn: '24h' });
    }

    // ---------- Handlers ----------
    export const signUpHandler: RequestHandler = async (req: Request, res: Response) => {
        const { username, email, password, birthdate } = req.body
        if (username && email && password && birthdate) {
            await ConnectionHandler.connectAndExecute(connection => signUp(connection, username, email, password, birthdate))
            res.status(200).send(`Cadastro realizado com sucesso.`)
        } else {
            res.status(400).send('ERRO - Parâmetros faltando.')
        }
    }

    export const loginHandler: RequestHandler = async (req: Request, res: Response) => {
        const { email, password } = req.body
        if(email && password) {
            try {
                const loginSuccess = await ConnectionHandler.connectAndExecute(connection => login(connection, email, password));
                console.log(`Sucesso no login: ${loginSuccess}`)
                if (loginSuccess) {
                    const token = generateToken(email);
                    res.status(200).send(`Login realizado com sucesso. Token de sessão: ${token}`);
                } else {
                    res.status(401).send(`ERRO - Credenciais inválidas.`);
                }
            } catch (error) {
                res.status(500).send(`ERRO - Falha ao realizar login.`);
            }
        } else {
            res.status(400).send(`ERRO - Parâmetros faltando.`)
        }
    }

    export const authHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers['authorization'];
        
        if (!token) {
            res.status(401).send('Acesso negado. Token não fornecido.')
            return
        }
    
        try {
            const secret = process.env.JWT_SECRET || 'defaultSecret';
            const decoded = jwt.verify(token, secret);
            
            req.user = decoded;  // Adiciona o usuário decodificado à requisição
            next();
    
        } catch (error) {
            res.status(403).send('Token inválido.');
            return
        }
    }
}
