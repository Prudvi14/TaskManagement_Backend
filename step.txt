--1. npm init -y
--2. npm i express mongodb mongoose nodemon dotenv cors bcrypt cookie-parser morgan jsonwebtoken

--3. Make folders "config", "models"

--4. make a .gitignore --> 
    `node_modules 
    .env
    `

--5. make a .env file -->
    `MONGO_DB_URL=
    MONGO_DB_PASSWORD=
    MONGO_DB_DATABASE_NAME=
    `

(if you don't have mognodb account --> create the account --> select FREE when you get the deployment option and "create deployment")
(wait for 5 minutes for cluster to get created)
go to "network access" in left panel --> add ip address --> allow access from any where --> done

go to "database access" in left panel --> edit --> edit password --> type new password --> update user 
(this is your MONGO_DB_PASSWORD value)

go to "clusters" in left panel --> "connect" --> select drivers --> copy link in 3rd step 
(this is your MONGO_DB_URL)

MONGO_DB_DATABASE_NAME=write any name according to you but no space or hyphen 

for example,
MONGO_DB_URL=mongodb+srv://likhileshbalpande:<db_password>@cluster0.abcdx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGO_DB_PASSWORD=mypasshardword
MONGO_DB_DATABASE_NAME=LPU_TASK_MANAGEMENT_MERN_ONLINE

--6. Inside config --> dbConfig.js -->

    `const mongoose = require("mongoose");

    const URL = process.env.MONGO_DB_URL;
    const URL_WITH_PASSWORD = URL.replace("<db_password>", process.env.MONGO_DB_PASSWORD);
    const URL_WITH_PASSWORD_AND_DB_NAME = URL_WITH_PASSWORD.replace("/?", `/${process.env.MONGO_DB_DATABASE_NAME}?`);

    const connectToDb = async () => {
        try {
            await mongoose.connect(URL_WITH_PASSWORD_AND_DB_NAME);
            console.log("--------- MONGO_DB CONNECTED ---------");
        } catch (err) {
            console.log("------ MONGO_DB NOT CONNECTED --------");
            console.log(err.message);
        }
    };

    connectToDb(); 
    `

--7. Make app.js file --> 
    `
    `

--8. run the application to check if it is working-->
    npx nodemon app.js

## HTTP STATUS CODES
(https://static.semrush.com/blog/uploads/media/3a/79/3a7950050980a0e2de37bc1a632cc321/wmkPPztB7KlAC7fPzO0-85NG8t0B9IEh4JEbt_ELP1pvJMhof9vt2pDSwrBZeXodoqaoV_Es1Rur-AWoeoOdV-RIde2vjqyMQuxrqch62uXZ1bsI0yaaMWx-f4cg4BlmOQrI2kFJ6CPXECCd69KeopE.png)
    1XX --> nothing imp for you
    3XX --> nothing imp for you

    2XX --> success -->
        200 --> OK (In general)
        201 --> created (CREATE / POST)
        204 --> No content (DELETE)
    4XX --> mistake of client
        400 --> bad request (validation error, or something is missing which was required, ...)
        401 --> unauthorized (the user does not have permission)
        404 --> NOT FOUND (this you will mostly get in express app when the endpoint or route you are using is not attached on the app)
                you may send it when the user asked for something which is not present

    5XX --> mistake of server
        500 --> Internal Server Error (Something went wrong on server that code was not prepared for )
            (connection issue, ram outage, processor outage, or ...)
    

--9. Make a userModel.js file -->
    // 1. make a schema
    // 2. make a model --> attached to a collection and schema
    // then use this model anywhere to work on the collection like find documents, add document, delete document, update document
    
-- 10. Make a BASIC post api to create a BASIC user

-- 11. IMPORTANT STEP: to do in app.js: 
    add these middlewares to your code -->
    `
        ...
        const cors = require("cors"); // this allow the browser to enable frontend to connect to backend by giving such permissions
        ...
        ...
        app.use(cors()); // this code actually allows all origins / domains to talk with backend
        app.use(express.json()); // this will read the request body stream and serializes it into javascript object and attach it on the req object 
        ...
    `

## HTTP METHODS or VERBS : (https://medium.com/@hhphu/understanding-http-verb-tampering-in-web-security-e2a167a9917e)

## how view database ?  collections ? documents
--> go to "clusters" in left panel --> click on "browse collections" --> select your database --> select your collection --> now you will see all your documents