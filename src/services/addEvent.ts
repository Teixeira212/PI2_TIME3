import { Event } from "../models/Event";
import OracleDB from "oracledb";
import jwt from "jsonwebtoken"

type JwtPayLoad = {
    userId: number
}

[{ "ROLE": "Usuário", "EMAIL": "email@gmail.com" }] 

export const addEvent = async (connection: OracleDB.Connection, event: Event, token: string): Promise<{ success: boolean; error?: string; }> => {
    try {
        const { userId } = jwt.verify(token, process.env.JWT_PASS ?? '') as JwtPayLoad
        console.log("ID recebido no token: ", userId)

        const getUser: any = await connection.execute(
            `SELECT COUNT(*), role FROM accounts WHERE id = :userId GROUP BY role`, [userId]
        )
        const role = getUser.rows[0]['ROLE']
        if (role === 'Moderador') {
            return { success: false, error: 'Moderadores não podem criar eventos.' }
        }
        if (getUser.rows[0]['COUNT(*)'] < 1) {
            return { success: false, error: 'Token Inválido. Faça login novamente.'}
        }

        if (!event.title || !event.description || !event.quota_value || !event.event_date || !event.event_bet_ends) {
            return { success: false, error: "Campos faltando." };
        }
        const eventDate = new Date(event.event_date)
        const eventBetEnds = new Date(event.event_bet_ends)
        const todaysDate = new Date()
        if (eventDate <= todaysDate) {
            return { success: false, error: "O evento deve acontecer em uma data posterior a data atual."}
        }
        if (eventBetEnds <= todaysDate) {
            return { success: false, error: "As apostas devem encerrar em uma data posterior a data atual."}
        }
        if (eventBetEnds >= eventDate) {
            return { success: false, error: "As apostas não podem encerrar depois do evento acontecer."}
        }

        await connection.execute(
            `INSERT INTO events (title, event_description, quota_value, event_date, event_bet_ends, event_status, owner_id) VALUES (:title, :event_description, :quota_value, TO_DATE(:event_date, 'DD/MM/YYYY'), TO_DATE(:event_bet_ends, 'DD/MM/YYYY'), 'Pendente', :userId)`,
            [event.title, event.description, event.quota_value, event.event_date, event.event_bet_ends, userId]
        );

        connection.commit()
        return { success: true, }
    } catch (error: unknown) {
        console.error("Erro ao criar evento: ", error);
        return { success: false, error: "Erro desconhecido ao criar evento" };
    }
};