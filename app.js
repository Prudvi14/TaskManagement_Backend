require('dotenv').config(); 
require("./config/dbConfig.js"); 
const PORT = process.env.PORT || 1814; 
const express = require("express"); 
const morgan = require("morgan"); 
const cors = require("cors"); 
const User = require("./models/userModel.js");
const { generateOTP } = require("./utils/otpHelpers.js");
const { sendOtpEmail, sendReminderMail } = require("./utils/emailHelpers.js");
const OTP = require("./models/otpModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const Task = require("./models/taskModel.js");

const cron = require("node-cron");

cron.schedule("* * * * *", () => {
    console.log("---- ---- ---- running a task every minute");
});

const app = express(); 

app.use(morgan("dev")); 

app.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_URL,
    })
); 

app.use(express.json()); 

app.use((req, res, next) => {
    console.log("=> Request received -->", req.url);
    next();
}); 

app.get("/", (req, res) => {
    res.send("<h1>Server is working fine ...</h1>");
});

app.get("/users", (req, res) => {
    try {
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

app.post("/users/register", async (req, res) => {
    try {
        const { email, password, otp, fullName } = req.body; 
        const lowerCaseEmail = email.toLowerCase();
        const otpDoc = await OTP.findOne({ email: lowerCaseEmail }).sort({ createdAt: -1 });
        // console.log(otpDoc);
        if (!otpDoc) {
            return res.status(400).json({
                status: "fail",
                message: "Either OTP is not sent to the given email or it is expired! Please try again!",
            });
        }
        const { otp: hashedOtp } = otpDoc; 
        const isOtpCorrect = await bcrypt.compare(otp.toString(), hashedOtp);
        if (!isOtpCorrect) {
           return res.status(401).json({
                status: "fail",
                message: "Invalid OTP !",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            email:lowerCaseEmail,
            password: hashedPassword,
            fullName,
        });

        res.status(201).json({
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
            res.status(400);
            res.json({
                status: "fail",
                message: "Data validation failed: " + err.message,
            });
        } else if (err.code === 11000) {
            res.status(400);
            res.json({
                status: "fail",
                message: "Email already exists!",
            });
        } else {
            res.status(500);
            res.json({
                status: "fail",
                message: "Internal Server Error",
            });
        }
    }
});

app.post("/otps", async(req, res) => {
    const { email }= req.query;
    if(!email){
        return res.status(400).json({
            status: "fail",
            message: "missing required parameter",
        });
    }
    const otp=generateOTP();
    const isEmailSent=await sendOtpEmail(email,otp);
    console.log("💛: isEmailSend: ",isEmailSent);

    if (!isEmailSent) {
        return res.status(500).json({
            status: "fail",
            message: "Email could not be sent! Please try again after 30 seconds!",
        });
    }

    const newSalt=await bcrypt.genSalt(10);
    const hashedOtp=await bcrypt.hash(otp.toString(),newSalt);
    await OTP.create({
        email,
        otp:hashedOtp,
    });
    return res.status(201).json({
        status: "success",
        message: `OTP sent successfully to ${email}`,
    });
});

app.post("/users/login", async (req, res) => {
    try {
        const { email, password } = req.body; 
        if (!email || !password) {
            res.status(400);
            res.json({
                status: "fail",
                message: "Email and password is required!",
            });
        }
        const currUser = await User.findOne({ email: email });
        if (!currUser) {
            res.status(400);
            res.json({
                status: "fail",
                message: "User is not registered!",
            });
            return;
        }

        const { password: hashedPassword, fullName, _id } = currUser; // currUser --> DB document
        const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);
        if (!isPasswordCorrect) {
            res.status(401);
            res.json({
                status: "fail",
                message: "Invalid email or password!",
            });
            return;
        }
        const token = jwt.sign(
            {
                email,
                _id,
                fullName,
            }, 
            process.env.JWT_SECRET_KEY, 
            {
                expiresIn: "1d", 
            } 
        );
        res.cookie("authorization", token, {
            httpOnly: true, 
            secure: true, 
            sameSite: "None", 
        });
        res.status(200);
        res.json({
            status: "success",
            message: "User logged in",
            data: {
                user: {
                    email,
                    fullName,
                },
            },
        });
    } catch (err) {
        console.log("Error in login", err.message);
        res.status(500);
        res.json({
            status: "fail",
            message: "Internal Server Error",
        });
    }
});

app.use(cookieParser());

app.use((req, res, next) => {
    try {
        const { authorization } = req.cookies;
        if (!authorization) {
            res.status(401).json({
                status: "fail",
                message: "Authorization failed!",
            });
            return;
        }
        jwt.verify(authorization, process.env.JWT_SECRET_KEY, (error, data) => {
            if (error) {
                res.status(401).json({
                    status: "fail",
                    message: "Authorization failed!",
                });
            } else {
                req.currUser = data;
                next();
            }
        });
    } catch (err) {
        console.log("Error in validation middleware", err.message);
        res.status(500).json({
            status: "fail",
            message: "Internal Server Error",
        });
    }
});

app.post("/tasks", async (req, res) => {
    try {
        const taskInfo = req.body;
        const { email } = req.currUser;
        const newTask = await Task.create({
            ...taskInfo,
            assignor: email,
        });
        res.status(201); 
        res.json({
            status: "success",
            data: {
                task: newTask,
            },
        });
    } catch (err) {
        console.log("Error in POST /tasks", err.message);
        if (err.name === "ValidationError") {
            res.status(400).json({ status: "fail", message: err.message });
        } else if (err.code === 11000) {
            res.status(400).json({ status: "fail", message: err.message });
        } else {
            res.status(500).json({ status: "fail", message: "Internal Server Error" });
        }
    }
});

app.get("/users/me", (req, res) => {
    try {
        const { email, fullName } = req.currUser;
        res.status(200);
        res.json({
            status: "success",
            data: {
                user: {
                    email,
                    fullName,
                },
            },
        });
    } catch (err) {
        console.log("error is GET /users/me", err.message);
        res.status(500);
        res.json({
            status: "fail",
            message: "INTERNAL SERVER ERROR",
        });
    }
});

app.get("/users/logout", (req, res) => {
    // use try-catch here
    res.clearCookie("authorization");
    res.json({
        status: "success",
        message: "User is logged out!",
    });
});

app.get("/tasks", async (req, res) => {
    try {
        // we only need to send the tasks where either assignor is the current user or assignee is current user
        const taskList = await Task.find().or([{ assignor: req.currUser.email }, { assignee: req.currUser.email }]);
        res.status(200);
        res.json({
            status: "success",
            data: {
                tasks: taskList,
            },
        });
    } catch (err) {
        console.log("error is GET /users/me", err.message);
        res.status(500);
        res.json({
            status: "fail",
            message: "INTERNAL SERVER ERROR",
        });
    }
});

app.listen(PORT, () => {
    console.log(`--------- Server Started on PORT: ${PORT} ---------`);
});

