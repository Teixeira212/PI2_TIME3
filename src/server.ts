import express, { Request, Response, Router } from "express";
import { AccountsHandler } from "./accounts/accounts";
import { EventsHandler } from "./services/events";
import { ModeratorHandler } from "./services/moderator";

const port = 3000; 
const server = express();
const routes = Router();

server.use(express.json())

routes.get('/', (req: Request, res: Response)=>{
    res.statusCode = 403;
    res.send('Acesso não permitido.');
});

// Rotas
routes.post('/signUp', AccountsHandler.signUpHandler);
routes.post('/login', AccountsHandler.loginHandler);
routes.post('/addNewEvent',  AccountsHandler.authHandler, EventsHandler.addNewEventHandler);
routes.post('/getEvents', EventsHandler.getEventsHandler);
routes.post('/deleteEvent', AccountsHandler.authHandler, EventsHandler.deleteEventHandler);
routes.post('/evaluateNewEvent', AccountsHandler.authHandler, AccountsHandler.roleHandler, ModeratorHandler.evaluateNewEventHandler);

server.use(routes);

server.listen(port, ()=>{
    console.log(`Servidor rodando na porta ${port}`);
})