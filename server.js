import express from "express";
import cors from "cors";
import MoviesRoute from "./api/routes/movies.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/movies", MoviesRoute);
app.use("*", (req, res) => {
    return res
        .status(404)
        .json({ success: false, error: "resource not found" });
});

export default app;
