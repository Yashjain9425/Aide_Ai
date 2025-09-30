import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

await connectCloudinary();

app.use(helmet({
    contentSecurityPolicy: false, 
  }));
  

const allowedOrigins = [
    "http://localhost:5173",
    "https://aide-ai-frontend.onrender.com"
  ];
app.use(cors({ origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  }, credentials: true }));
app.use(express.json());
app.use(clerkMiddleware());

const PORT = process.env.PORT || 3000;


app.use("/api/ai", requireAuth(), aiRouter);
app.use("/api/user", requireAuth(), userRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
