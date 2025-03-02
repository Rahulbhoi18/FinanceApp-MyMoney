const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const rootRouter = require("./routes/index");
const connectDb = require("./db/connectDB");
const app = express();
app.use(express.json());
const cors = require("cors");


app.use(cors());
app.use("/api/v1", rootRouter);
app.post("/", (req, res) => {
  res.send({
    msg: "Hello server has started",
  });
});
const port = process.env.PORT || 8000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`App is listening on the port ${port} `);
    });
  })
  .catch((error) => {
    console.log(error);
  });
