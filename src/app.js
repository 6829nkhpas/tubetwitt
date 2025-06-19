import express from "express";
import cors from "cors";
const app = express();
import heakthcheckrouter from "./routes/health_check_router.js";
app.use(
    cors({
        origin: process.env.cors,
        credentials:true
    })
)
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true , limit:"116kb"}))
app.use(express.static("public"))
// importing routes
import userrouter from "./routes/user_routes.js";

app.use("/api/v1/users", userrouter);


 app.use("/api/v1/healthcheck", heakthcheckrouter)
export{ app }