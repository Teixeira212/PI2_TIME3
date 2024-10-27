import express, { Request, Response, Router } from "express";
import { AccountsHandler } from "./accounts/accounts";
import { ConnectionHandler } from "./connection";
import { EventsHandler } from "./services/events";

const port = 3000; 
const server = express();
const routes = Router();

server.use(express.json())

routes.get('/', (req: Request, res: Response)=>{
    res.statusCode = 403;
    res.send('Acesso não permitido.');
});

// Rotas
routes.post('/connection', ConnectionHandler.connectionHandler);
routes.post('/signUp', AccountsHandler.signUpHandler);
routes.post('/login', AccountsHandler.loginHandler);
routes.post('/addNewEvent',  AccountsHandler.authHandler, EventsHandler.addNewEventHandler);
routes.post('/getEvents', EventsHandler.getEventsHandler)

server.use(routes);

server.listen(port, ()=>{
    console.log(`Servidor rodando na porta ${port}`);
})