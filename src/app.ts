import deleteEventRoute from "./routes/deleteEventRoute"
import testTokenRoute from "./routes/printTokenRoute"
import tokenAuthRoute from "./routes/tokenAuthRoute"
import express, { Request, Response } from "express";
import addEventRoute from "./routes/addEventRoute"
import signUpRoute from "./routes/signUpRoute";
import loginRoute from "./routes/loginRoute";
import bodyParser from "body-parser";
import cors from "cors"
import path from "path"

const app = express();
const port = process.env.PORT || 3000;

app.use(cors())
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "../public")));

app.use("/account", signUpRoute);
app.use("/account", loginRoute);
app.use("/event", addEventRoute);
app.use("/event", deleteEventRoute);

app.use("/auth", tokenAuthRoute);
app.use("/testing", testTokenRoute);

app.get("/events", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/addEvent.html"));
});

app.get("/printToken", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/printToken.html"));
});

app.get("/login", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get('/', (req: Request, res: Response)=>{
    res.statusCode = 403;
    res.send('Acesso não permitido.');
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
