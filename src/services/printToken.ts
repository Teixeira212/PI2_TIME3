


export const printToken = async (token: string): Promise<{ success: boolean; error?: string; }> => {
    try {
        console.log('Token recebido pela função printToken: ', token)
        return { success: true }
    } catch (error: unknown) {
        console.error("Erro ao printar token: ", error);
        return { success: false, error: "Erro desconhecido ao printar token." };
    }
};