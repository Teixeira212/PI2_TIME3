import OracleDB from 'oracledb';
import { ConnectionHandler } from "./connection";

async function initializeDatabase(connection: OracleDB.Connection) {
    try {
        await connection.execute(
            `CREATE TABLE accounts (
                id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY NOT NULL,
                username VARCHAR2(255) NOT NULL,
                email VARCHAR2(255) UNIQUE NOT NULL,
                password VARCHAR2(255) NOT NULL,
                birthdate DATE NOT NULL, 
                role VARCHAR2(255) NOT NULL
            )`);
        await connection.execute(
            `CREATE TABLE events (
                id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                title VARCHAR2(255) NOT NULL,
                event_description VARCHAR2(255) NOT NULL,
                quota_value NUMBER(10,2) NOT NULL,
                event_date DATE,
                event_bet_starts DATE, 
                event_bet_ends DATE,
                event_status VARCHAR2(255) NOT NULL, 
                owner_id NUMBER NOT NULL,
                result VARCHAR2(255),
                FOREIGN KEY (owner_id) REFERENCES accounts(id)
            )`);
        await connection.execute(
            `CREATE TABLE wallets (
                id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                balance NUMBER(10) NOT NULL,
                owner_id NUMBER NOT NULL,
                FOREIGN KEY (owner_id) REFERENCES accounts(id)
            )`);
        await connection.execute(
            `CREATE TABLE wallet_history (
                id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                transaction_type VARCHAR2(255) NOT NULL,
                amount NUMBER(10) NOT NULL,
                wallet_id NUMBER NOT NULL,
                FOREIGN KEY (wallet_id) REFERENCES wallets(id)
            )`);
        await connection.execute(
            `CREATE TABLE bets (
                id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                quotas_amount NUMBER NOT NULL,
                bet_amount NUMBER(10) NOT NULL,
                guess VARCHAR2(255) NOT NULL,
                event_id NUMBER NOT NULL,
                owner_id NUMBER NOT NULL,
                FOREIGN KEY (event_id) REFERENCES events(id),
                FOREIGN KEY (owner_id) REFERENCES accounts(id)
            )`);

        console.log('Banco de dados inicializado com sucesso.');
    } catch (error) {
        console.error('Erro ao inicializar o banco de dados:', error);
    }
}

ConnectionHandler.connectAndExecute(connection => initializeDatabase(connection)).catch(console.error);
