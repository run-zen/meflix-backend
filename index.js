import app from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";
import MoviesDAO from "./DAO/moviesDAO.js";

dotenv.config();
const MongoClient = mongodb.MongoClient;
const port = process.env.PORT || 8000;

MongoClient.connect(process.env.URI, {
    poolSize: 100,
    wtimeout: 3000,
    useNewUrlParser: true,
})
    .catch((err) => {
        console.error(err.stack);
        process.exit(1);
    })
    .then((client) => {
        MoviesDAO.injectDB(client);
        app.listen(port, () => {
            console.log(`listening on port http://localhost:${port}`);
        });
    });
