//express
const express = require("express");
const app = express(); //app or instance for express
const port = process.env.PORT || 5000; //this is the port number

//env variables
require("dotenv").config();

//path for rendering html files
const path = require("path");

//static files to enable css to show
app.use(express.static(__dirname));

//cors access to enable applications on different hosts to send request
const cors = require("cors");
app.use(cors());

//API Middlewares

//For accepting post form data
const bodyParser = require("express");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//nodemailer config
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "nichole.ebert22@ethereal.email",
    pass: "AXfbB7BTxDvsUGayQb",
  },
});

//testing nodemailer succes
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for messages!");
    console.log(success);
  }
});

//API ROUTES

app.get("/sendMail", (req, res) => {
  res.sendFile(path.join(__dirname, "./contact.html"));
});

app.post("/sendMail", (req, res) => {
  const { message, name, email } = req.body; //the data gotten is in the body of the request

  const mailOptions = {
    from: email,
    to: "mihai.antonio.buzescu@gmail.com",
    subject: "Sent mail from the WeatherApp",
    text: `${name} sent the following: \n ${message}`,
  };

  transporter
    .sendMail(mailOptions)
    .then(() => {
      //success
      res.sendFile(path.join(__dirname, "./success.html"));
    })
    .catch((error) => {
      //error
      console.log(error);
      res.json({ status: "FAILED", message: "An error occured!" });
    });
});

//This is to listen on port
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
