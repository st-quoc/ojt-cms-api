const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/config/db");
const authRoute = require("./src/routes/auth");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

connectDB();
app.use("/api/auth", authRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
