const express = require("express");
const app = express();
const path = require("path");
const morgan = require("morgan");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
//const moment = require("moment");
const session = require("cookie-session");
//mongoose


const mongoose = require("mongoose");
const Admin = require("./models/myModel");
const PostModel = require("./models/postModel");
// const PostModel = require("./models/postModel");

//hash
const bcrypt = require("bcrypt");
//multer
//const multer = require("multer");
//const upload = multer({ dest: "images/upload/" });


//variables globales para el logeo y los sweetsalert
global.isLogin = 0;
global.login = false;

// const msg = new Admin({
//     nombre: "admin",
//     apellido: "1",
//     usuario: "Admin1",
//     contraseña: "administrador",
//     avatar: "...",
//     email: "adminhospital@gmail.com",
// });

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
    .connect(
        "mongodb+srv://hrgarcia:EaFhXeNfxbG277Zz@cluster0.fs8tm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
        {
            useNewUrlParser: true,
        }
    )
    .then((con) => {
        console.log("Conectado a la DB");
    });
//controlador principal
app.get("/", (req, res) => {
    res.status(200).render("index", { login: login, isLogin: isLogin });
});

//Controlador de Admin
app.get("/login", (req, res) => {
    res.status(200).render("login", { isLogin: isLogin, login: login });
});

app.post("/login", (req, res) => {
    if (req.body.usuario == "Doctor") {
        Admin.find({ usuario: req.body.usuario }, (err, docs) => {
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

app.get("/logout", (req, res) => {
    if (login) {
        res.redirect("/");
        req.session.destroy();
        login = false;
    } else {
        res.redirect("/");
    }
});
app.get("/error404", (req, res) => {
    res.status(200).render("error404");

});
app.get('/visualizar', (req, res) => {
    res.status(200).render("visualizarPost");
    
});

app.get("/kinesiologia", (req, res) => {
    res.status(200).render("kinesiologia");
    
});
app.get("/saludMental", (req, res) => {
    res.status(200).render("saludmental");
    
});
app.get("/neumonologia", (req, res) => {
    res.status(200).render("neumonologia");
});

app.get('/seccionAdmin', (req, res) => {
    if(login){
        res.status(200).render("edicionPosteos", {data:PostModel.find()});
    }
    else{
    res.redirect("/login"); 
    }
});


app.get("/config", (req, res) => {
    res.status(200).render("config");
});
app.post("/ChangePassword", (req, res) => {
    res.status(200).render("login");
    if (login) {
        Admin.findOneAndUpdate({ nombre: "admin" },
            { $set: { contraseña: req.body.contraseña } }, { new: true }, function (err, doc) {
                if (err) console.log("Error ", err);
                console.log("Updated Doc -> ", doc);
                res.status(200).render("login", { isLogin: isLogin, login: login });
            });


    }
});

app.post("/ChangeUser", (req, res) => {
    res.status(200).render("login");
    if (login) {
        Admin.findOneAndUpdate({ nombre: "admin" },
            { $set: { usuario: req.body.usuario } }, { new: true }, function (err, doc) {
                if (err) console.log("Error ", err);
                console.log("Updated Doc -> ", doc);
                res.status(200).render("login", { isLogin: isLogin, login: login });
            });


    }
});

app.get("/subirPost", (req, res) => {
    res.status(200).render("postear2");
});





app.get("/*", (req, res) => {
    res.status(200).render("error404");
    
});


//RUTAS
/*
    router.route("/subirPost").get(adminController.postear2);
    router.route("/postear").post(adminController.subirPost);
    router.route("/edicion").get(adminController.edicion);
    router.route("/editarPosteo").get(adminController.editarPost);
    router.route("/ChangeUser").get(adminController.seccionAdmin).post(adminController.ChangeUser);
    router.route("/user").get(adminController.user);
*/


// // REVISARR


// app.get('/config', (req, res)  => {
//     res.status(200).render("config");
// });

// app.post('/postear', (req, res)  => {
//     const pos = new PostModel({
//         id: "2",
//         fecha: new Date(req.body.fecha),
//         titulo: req.body.titulo,
//         descripcion: req.body.descripcion,
//         imagen: "./public/images/databaseimg/" + req.body.image,
//         enlace: req.body.enlace,
//         tags: req.body.tag,
//     });

//     res.status(200).render("edicionPosteos", { data: TwoModel.find() });
//     pos.save()
//         .then((doc) => {
//             console.log(doc);
//             console.log("cargado");
//         })
//         .catch((err) => {
//             console.error(err);
//         });
//     console.log(req.body.image);
//     res.status(200).render("edicionPosteos", { data: PostModel.find() });
// });

//error404
// app.get('/*', (req, res) => {
//     res.status(200).render("error404");
// });
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
