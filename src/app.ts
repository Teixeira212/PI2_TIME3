import deleteEventRoute from "./routes/deleteEventRoute";
import getEventsRoute from "./routes/getEventsRoute";
import addFundsRoute from "./routes/addFundsRoute"
import express, { Request, Response } from "express";
import tokenAuthRoute from "./routes/tokenAuthRoute";
import getWalletRoute from "./routes/getWalletRoute";
import addEventRoute from "./routes/addEventRoute";
import signUpRoute from "./routes/signUpRoute";
import loginRoute from "./routes/loginRoute";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors())
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "../public")));

app.use("/auth", tokenAuthRoute);

app.use("/account", signUpRoute);
app.use("/account", loginRoute);
app.use("/account", getWalletRoute);
app.use("/account", addFundsRoute);


app.use("/event", addEventRoute);
app.use("/event", deleteEventRoute);
app.use("/event", getEventsRoute);


app.get("/homepage", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/homepage.html"));
});

app.get("/wallet", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/wallet.html"));
});

app.get("/signUp", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/signUp.html"));
});

app.get("/login", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

app.get('/', (req: Request, res: Response)=>{
    res.statusCode = 403;
    res.send('Acesso não permitido.');
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
