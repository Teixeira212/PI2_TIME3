import OracleDB from "oracledb";

export const getEvents = async (connection: OracleDB.Connection): Promise<{ success: boolean; data?: any[]; error?: string; }> => {
    try {
        const result = await connection.execute(
            `SELECT * FROM events WHERE event_status = 'Aprovado'`,
            [],
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        return { success: true, data: result.rows }
    } catch (error: unknown) {
        console.error("Erro ao pegar eventos: ", error);
        return { success: false, error: "Erro desconhecido ao pegar eventos." };
    }
};