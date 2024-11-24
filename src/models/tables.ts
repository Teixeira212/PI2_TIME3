interface Accounts {
    id: number,
    username: string,
    email: string,
    password: string,
    birthdate: string,
    wallet_id: number
}

interface Events {
    id: number,
    title: string,
    description: string,
    quota: number,
    event_date: string,
    bet_starts?: string,
    bet_ends: string,
    status: string,
    result: string
}

interface Wallets {
    id: number,
    balance: number
}

interface WalletsHistory {
    id: number,
    amount: number,
    wallet_id: number,
    date: string,
    type: string
}

interface Bets {
    id: number,
    event_id: number,
    wallet_id: number,
    quotas: number,
    guess: string
}