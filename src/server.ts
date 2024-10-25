import express from "express";
import {Request, Response, Router} from "express";
import { AccountsHandler } from "./accounts/accounts";

const port = 3000; 
const server = express();
const routes = Router();

server.use(express.json())


routes.get('/', (req: Request, res: Response)=>{
    res.statusCode = 403;
    res.send('Acesso não permitido.');
});

routes.post('/connection',AccountsHandler.connectionHandler);
routes.post('/signUp', AccountsHandler.signUpHandler);
server.use(routes);

server.listen(port, ()=>{
    console.log(`Server is running on: ${port}`);
})