import express, {Request, Response} from "express";
import { AppDataSource } from "./database.config";
import { router } from "./routers";
import  cors from "cors";
import cookieParser from "cookie-parser";
 
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
    origin: process.env.API_URL,
    credentials: true,
}));
app.use(cookieParser());

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })

app.use('/', router);

app.listen(port, () => {
    console.log(`server is running on ${port}`);
})