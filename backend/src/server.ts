import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import movieRoutes from "./routes/movieRoutes";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5059;

app.use(cors());
app.use(express.json());

app.use("/api/movies", movieRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
