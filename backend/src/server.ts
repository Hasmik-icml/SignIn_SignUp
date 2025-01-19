import express, {Request, Response} from "express";
import { AppDataSource } from "./database.config";
 
const app = express();
const port = 3000;

app.use(express.json());

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