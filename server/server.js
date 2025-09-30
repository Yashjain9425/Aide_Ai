import express from "express";
import cors from "cors";
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
await connectCloudinary();
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

const PORT = process.env.PORT || 3000;

// API first, with auth
app.use('/api', requireAuth(), (req, res, next) => next());
app.use('/api/ai', aiRouter);
app.use('/api/user', userRouter);

// Serve client build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));

// SPA fallback (only for non-API)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).send('Not Found');
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});