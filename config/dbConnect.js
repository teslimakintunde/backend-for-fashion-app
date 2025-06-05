const mongoose = require("mongoose");

const connectToDB = async () => {
  const connectionURL = process.env.DATABASE_URL;

  mongoose
    .connect(connectionURL)
    .then(() => console.log("database connection successful"))
    .catch((error) => console.log(error));
};

module.exports = connectToDB;
