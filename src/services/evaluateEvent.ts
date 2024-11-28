import { ConnectionHandler } from '../database/connection';
import { auth } from '../microServices/tokenAuth';
import { EvaluateInfo } from "../models/EvaluateInfo";
import OracleDB from "oracledb";

export const evaluateEvent = async (connection: OracleDB.Connection, evaluateInfo: EvaluateInfo, token: string): Promise<{ success: boolean; error?: string; }> => {
    try {
        let authResult = await ConnectionHandler.connectAndExecute(connection => auth(connection, token))
        if (!authResult.success) {
            return { success: false, error: authResult.error }
        }
        const userId = authResult.userId;
        const isMod = authResult.isMod;
        if (!isMod) {
            return { success: false, error: "Área restrita para moderadores." }
        }
        const event_id = evaluateInfo.event_id
        const avaliation = evaluateInfo.avaliation
        const motive = evaluateInfo.motive
        if (!event_id || !avaliation) {
            return { success: false, error: "Campos faltando." }
        }
        if (avaliation == 'Reprovado' && !motive) {
            return { success: false, error: "Insira o motivo da reprovação do evento." };
        }

        const formatDate = (date: Date): string => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const actualDate = formatDate(new Date())
        console.log(actualDate)

        if (avaliation == 'Aprovado') {
            await connection.execute(
                `UPDATE events SET event_status = 'Aprovado', event_bet_starts = TO_DATE(:actualDate, 'DD/MM/YYYY') WHERE id = :event_id`,
                [actualDate, event_id]
            )
        }
        
        if (avaliation == 'Reprovado') {
            await connection.execute(
                `UPDATE events SET event_status = 'Reprovado' WHERE id = :event_id`,
                [event_id]
            )
        }


        connection.commit()
        return { success: true }
    } catch (error: unknown) {
        console.error("Erro ao criar evento: ", error);
        return { success: false, error: "Erro desconhecido ao criar evento." };
    }
};