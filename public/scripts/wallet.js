function logout() {
    localStorage.clear();
}

// --------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async function () {
    await loadWallet();
});

async function loadWallet() {
    try {
        const token = localStorage.getItem('authToken')
        if (!token) {
            console.error('Token de autenticação não encontrado.');
            return;
        }

        const response = await fetch("http://localhost:3000/account/getWallet", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const walletInfo = await response.json();
        const wallet = walletInfo.wallet
        const walletBalanceCents = wallet[0]['BALANCE']
        const walletBalance = walletBalanceCents / 100
        const walletHistory = walletInfo.walletHistory

        if (response.ok) {
            const balanceElement = document.getElementById('ShowBalance');
            balanceElement.textContent = walletBalance.toFixed(2) || "INDISPONÍVEL";
            walletHistory.forEach(history => showWalletHistory(history));
        } else {
            console.error('Erro ao carregar eventos', walletHistory.error);
        }
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString); // Converte a string em objeto Date
    const day = String(date.getDate()).padStart(2, '0'); // Adiciona zero à esquerda, se necessário
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses são base 0
    const year = date.getFullYear(); // Obtém o ano completo

    return `${day}/${month}/${year}`; // Retorna no formato dd/mm/yyyy
}

function showWalletHistory(history) {
    const table = document.getElementById('walletHistory').getElementsByTagName('tbody')[0];
    console.log('HISTORICO RECEBIDO:', history)
    const row = table.insertRow();

    const cellId = row.insertCell(0);
    const cellType = row.insertCell(1);
    const cellAmount = row.insertCell(2);
    const amountCents = history['AMOUNT']
    const amount = amountCents / 100;


    cellId.textContent = history['ID'];
    cellType.textContent = history['TRANSACTION_TYPE'];
    cellAmount.textContent = `R$${amount.toFixed(2)}`;
}