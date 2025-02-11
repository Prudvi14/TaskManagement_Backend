require("dotenv").config(); // it attaches the .env key values in the process variable that we cn now use anywhere as we require
require("./config/dbConfig.js"); // (when ever you require the file, it runs that file.) it will connect the mongoose to our MONGO DB Atlas Database and then we can use the mongoose from here on to do DB stuff
const PORT = process.env.PORT || 1814; // we are attaching a fallback PORT incase if port is not mentioned in the .env file
const express = require("express"); // we will be using express framework for our backend app
const morgan = require("morgan"); // we import a third party library for better logs on console
const cors = require("cors"); // this allow the browser to enable frontend to connect to backend by giving such permissions
const User = require("./models/userModel.js");
const { generateOTP } = require("./utils/otpHelpers.js");
const { sendOtpEmail } = require("./utils/emailHelpers.js");

// --------------------------------------------------------------
const app = express(); // we are creating a server using express
// --------------------------------------------------------------

app.use(cors()); // this code actually allows all origins / domains to talk with backend
app.use(express.json()); // this will read the request body stream and serializes it into javascript object and attach it on the req object

app.use((req, res, next) => {
    console.log("request received -->", req.url);
    next();
}); // this is a very basic middleware which logs the request to console

app.get("/", (req, res) => {
    res.send("<h1>Server is working fine ...</h1>");
});

app.use(morgan("dev")); // this is a third-party middleware (written by someone else) which logs the request to console in better way

// document.addEventListener("click", (ev)=>{ev.target.styles.backgroundColor = 'red'})
// request handler for the endpoint with particular http verb or method
app.get("/users", (req, res) => {
    try {
        // we will complete it after sometime
    } catch (err) {
        console.log("Error in GET /users");
        console.log(err.message);
        res.status(500);
        res.json({
            status: "fail",
            message: "Internal Server Error " + err.message,
        });
    }
});

// request handler for the endpoint with particular http verb or method
app.post("/users", async (req, res) => {
    try {
        const userInfo = req.body; // this is from user request
        const newUser = await User.create(userInfo); // put it in database
        res.status(201);
        res.json({
            status: "success",
            data: {
                user: {
                    email: newUser.email,
                    fullName: newUser.fullName,
                },
            },
        });
    } catch (err) {
        console.log("--- Error in /POST users ---");
        console.log(err.name, err.code);
        console.log(err.message);
        if (err.name === "ValidationError") {
            // mistake of client that he has not sent the valid data
            res.status(400);
            res.json({
                status: "fail",
                message: "Data validation failed: " + err.message,
            });
        } else if (err.code === 11000) {
            // mistake of client that he is using the email which already registered
            res.status(400);
            res.json({
                status: "fail",
                message: "Email already exists!",
            });
        } else {
            // generic mistake by server
            res.status(500);
            res.json({
                status: "fail",
                message: "Internal Server Error",
            });
        }
    }
});

// request handler to send otp for given email
app.post("/otps", async (req, res) => {
    const { email } = req.query;
    // validate if the user is sending email
    //TODO: check if the email is in required format using regex or length or ...
    if (!email) {
        res.status(400).json({
            status: "fail",
            message: 'Missing required parameter: "email"',
        });
        return;
    }

    // create a 4 digit OTP
    const otp = generateOTP();

    // send the OTP to email
    const isEmailSent = await sendOtpEmail(email, otp);

    console.log("🟡 : isEmailSent:", isEmailSent);

    // store the OTP in database
    // send the success response
});

// --------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`--------- Server Started on PORT: ${PORT} ---------`);
}); // we are attaching that server to a active port to listen to requests and respond to them
