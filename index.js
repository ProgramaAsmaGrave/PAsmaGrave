const mongoose = require("mongoose");
const app = require("./app");
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cloudinary = require("cloudinary").v2;
const app = express();
// const myRouter = require("./routes/myRouter");
const cors = require("cors");
const session = require("express-session");
const multer = require("multer");
const port = 3000;
//Corremos el servidor en el puerto seleccionado
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port} correctamente`);
});

app.set("view engine", "ejs");
//Defino la localización de mis vistas
app.set("views", path.join(__dirname, "views"));

app.use(cors());
//Middlewares
app.use(
    session({
        //Usuage
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true },
    })
);
app.use(morgan("dev"));
//Middleware para poder obtener data de los requests con BodyParser
app.use(express.json());
//Configurando archivos estáticos
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

//Agrego un enrutador compatible


    //Conexión al cloud de Mongodb Atlas ...
    mongoose
        .connect('mongodb+srv://hrgarcia:EaFhXeNfxbG277Zz@cluster0.fs8tm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
            useNewUrlParser: true,
        })
        .then((con) => {
            console.log('Conectado a la DB');
        });

 app.get('/', (req, res) => {
     console.log('Dominio principal');
     res.render('index');
});
app.use(
    multer({
        storage: multer.diskStorage({
            destination: "./public/images/avatars",
            limits: { fileSize: 10 * 1024 * 1024 },
            filename: function (req, file, cb) {
                cb(null, "avatar" + ".jpg");
            },
        }),
    }).single("file")
);

//Multer para carga en DataBase
app.use(
    multer({
        storage: multer.diskStorage({
            destination: "./public/images/databaseimg",
            limits: { fileSize: 10 * 1024 * 1024 },
            filename: function (req, file, cb) {
                cb(null, file.fieldname);
            },
        }),
    }).single("image")
);

app.post("/cargarImagen", async (req, res) => {
    res.render("config");
});
app.post("/guardarImagen", async (req, res) => {
    res.render("config");
});

// app.use("/", myRouter);

