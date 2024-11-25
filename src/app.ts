import express, { Request, Response } from "express";
import signUpRoute from "./routes/signUpRoute";
import loginRoute from "./routes/loginRoute";
import addEventRoute from "./routes/addEventRoute"
import deleteEventRoute from "./routes/deleteEventRoute"
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use("/account", signUpRoute);
app.use("/account", loginRoute);
app.use("/event", addEventRoute);
app.use("/event", deleteEventRoute);

app.get('/', (req: Request, res: Response)=>{
    res.statusCode = 403;
    res.send('Acesso não permitido.');
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
