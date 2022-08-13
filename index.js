const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cloudinary = require("cloudinary").v2;
const app = express();
const cors = require("cors");
const moment = require("moment");
const session = require("cookie-session");
//mongoose
const mongoose = require("mongoose");
const OneModel = require("../models/myModel");
const PostModel = require("../models/postModel");
const Admin = require("../models/myModel");
//hash
const bcrypt = require("bcrypt");
const { hash } = require("bcrypt");
//multer
const multer = require("multer");
const upload = multer({ dest: "images/upload/" });

//variables globales para el logeo y los sweetsalert
global.isLogin = 0;
global.login = false;

const msg = new Admin({
    nombre: "admin",
    apellido: "1",
    usuario: "Admin1",
    contraseña: "administrador",
    avatar: "...",
    email: "adminhospital@gmail.com",
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




const port = 3000;
//Corremos el servidor en el puerto seleccionado
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port} correctamente`);
});
    //Conexión al cloud de Mongodb Atlas ...
    mongoose
        .connect('mongodb+srv://hrgarcia:EaFhXeNfxbG277Zz@cluster0.fs8tm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
            useNewUrlParser: true,
        })
        .then((con) => {
            console.log('Conectado a la DB');
        });
 //controlador principal
 app.get('/', (req, res) => {
     console.log('Dominio principal');
     res.status(200).render("index", { login:login, isLogin:isLogin});
    });

 //Controlador de Admin
 app.get('/login', (req, res) => {
    res.status(200).render("login", { isLogin: isLogin, login: login });
    });

    app.post('/login', (req, res) => {
    if (req.body.usuario == "Doctor") {
        OneModel.find({ usuario: req.body.usuario }, (err, docs) => {
            bcrypt.compare(
                req.body.contraseña,
                bcrypt.hashSync(docs[0].contraseña, 5),
                (err, resul) => {
                    console.log(docs[0].contraseña);
                    if (err) throw err;
                    if (resul) {
                        res.session = true;
                        login = res.session;
                        isLogin = 1;
                        res.status(200).render("index", { login: login });
                    } else {
                        isLogin = 2;
                        res.status(200).render("login", {
                            isLogin: isLogin,
                            login: login,
                        });
                    }
                }
            );
        });
    } else {
        isLogin = 3;
        res.status(200).render("login", { isLogin: isLogin, login: login });
    }
    });

    app.post('/logout', (req, res)  => {
        if (login) {
            res.redirect("/");
            req.session.destroy();
            login = false;
        } else {
            res.redirect("/");
        }
    });

app.post('/subirPost', (req, res) => {
    if (login) {
        res.status(200).render("postPrueba", {
            isLogin: isLogin,
            login: login,
        });
    } else {
        isLogin = 4;
        res.redirect("/"); //Hacer vista o algo con esto
    }
});

app.get('/seccionAdmin', (req, res) => {
    res.status(200).render("edicionPosteos", { data: TwoModel.find() });
    res.status(200).render("edicionPosteos", { data: PostModel.find() });
});

app.get('/config', (req, res)  => {
    res.status(200).render("config");
});



app.post('/postear', (req, res)  => {
    const pos = new PostModel({
        id: "2",
        fecha: new Date(req.body.fecha),
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        imagen: "./public/images/databaseimg/" + req.body.image,
        enlace: req.body.enlace,
        tags: req.body.tag,
    });

    res.status(200).render("edicionPosteos", { data: TwoModel.find() });
    pos.save()
        .then((doc) => {
            console.log(doc);
            console.log("cargado");
        })
        .catch((err) => {
            console.error(err);
        });
    console.log(req.body.image);
    res.status(200).render("edicionPosteos", { data: PostModel.find() });
});

//error404
app.get('/*', (req, res) => {
    res.status(200).render("error404");
});
//Termina controller Admin



// app.use(
//     multer({
//         storage: multer.diskStorage({
//             destination: "./public/images/avatars",
//             limits: { fileSize: 10 * 1024 * 1024 },
//             filename: function (req, file, cb) {
//                 cb(null, "avatar" + ".jpg");
//             },
//         }),
//     }).single("file")
// );

// //Multer para carga en DataBase
// app.use(
//     multer({
//         storage: multer.diskStorage({
//             destination: "./public/images/databaseimg",
//             limits: { fileSize: 10 * 1024 * 1024 },
//             filename: function (req, file, cb) {
//                 cb(null, file.fieldname);
//             },
//         }),
//     }).single("image")
// );

app.post("/cargarImagen", async (req, res) => {
    res.render("config");
});
app.post("/guardarImagen", async (req, res) => {
    res.render("config");
});

module.exports = app;
