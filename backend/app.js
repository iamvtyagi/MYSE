import express from "express";
import morgan from "morgan";
import connect from "./db/db.js";
import expressSession from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config.js";

import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import aiRoutes from "./routes/gemini.routes.js";

// Establishing database connection
connect();

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

// Configure session middleware
app.use(
  expressSession({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  })
);

// Routes
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
