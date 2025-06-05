require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const connectToDB = require("./config/dbConnect");
const corsOption = require("./config/corsOptions");

const app = express();

const PORT = process.env.PORT || 3500;
connectToDB();

app.use(cors(corsOption));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/usersRoute"));
app.use("/notes", require("./routes/notesRoutes"));

mongoose.connection.once("open", () => {
  console.log("Databse connection successful");
  app.listen(PORT, () => console.log(`database running on port ${PORT}`));
});
mongoose.connection.on("error", (err) => {
  console.log(err);
});
