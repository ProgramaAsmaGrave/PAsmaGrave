const express = require("express");
const app = express();
const path = require("path");
const morgan = require("morgan");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const session = require("cookie-session");

//Base de Datos
const mongoose = require("mongoose");
const Admin = require("./models/myModel");
const PostModel = require("./models/postModel");

//hash
const bcrypt = require("bcrypt");
const { stringify } = require("querystring");

//variables globales para el logeo y los sweetsalert
global.isLogin = 0;
global.login = false;
global.idPosts=1;

//vistas
app.set("view engine", "ejs");
//Defino la localización de mis vistas
app.set("views", path.join(__dirname, "views"));


app.use(cors());
//Middlewares
app.use(
    session({
        login: false,
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: false,
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
    isLogin= 0;
    res.status(200).render("index", { login: req.session.login, isLogin: isLogin });
});

//Controlador de Admin
app.get("/login", (req, res) => {
    res.status(200).render("login", { isLogin: isLogin, login: req.session.login });
});

app.post("/login", (req, res) => {
    Admin.find({ usuario: req.body.usuario }, (err, docs) => {
        if(req.body.usuario != "Doctor"){
            isLogin = 2;
            res.status(200).render("login", { isLogin: isLogin, login: req.session.login });
        }
        else{
            bcrypt.compare(req.body.contraseña,bcrypt.hashSync(docs[0].contraseña, 5),(err, resul) => {
                if (err) throw err;

                if (resul) {
                    req.session.login = true;
                    isLogin = 5;                      
                    res.status(200).render("index", { login: req.session.login, isLogin: isLogin });
                }     
                else {
                    isLogin = 2;
                    res.status(200).render("login", {isLogin: isLogin,login: req.session.login});
                }
            });
        }
    }); 
});

app.get('/seccionAdmin', (req, res) => {
    if(req.session.login){
        PostModel.find(function(err, post) {   
            res.status(200).render("edicionPosteos", {data:post});
        });
        
    }
    else{
        isLogin = 4
        res.status(200).render("index", {login: req.session.login,isLogin: 4});
    }
});
app.get("/config", (req, res) => {
    if(req.session.login){
        res.status(200).render("config");
    }
    else{
        isLogin = 4
        res.status(200).render("index", {login: req.session.login,isLogin: 4});
    }
});
app.get("/postear", (req, res) => {
    if(req.session.login){
        res.status(200).render("postPrueba", { isLogin: isLogin, login: req.session.login });
        PostModel.findOne().sort({id: -1}).exec(function(err, post) {   
            console.log("Ultimo Id:"+post.id.toString());
            idPosts=post.id;
        });
    }
    else{
        isLogin = 4
        res.status(200).render("index", {login: req.session.login,isLogin: 4});
    }


});

app.get("/logout", (req, res) => {
    if (req.session.login) {
        req.session.login =false;  
        res.redirect("/");
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

app.post("/subirpost", (req, res) => {
        let fecha=req.body.fecha;
        let titulo= req.body.titulo;
        let descripcion = req.body.descripcion;
        let imagen = req.body.imagen;
        let enlace = req.body.enlace;
        let tag = req.body.tag;

        PostModel.findOne().sort({id: -1}).exec(function(err, post) {   
            console.log("Ultimo Id:"+post.id.toString());
            idPosts=post.id;
        

        let posteo = new PostModel({
        id:idPosts+1,
        fecha: fecha,
        titulo: titulo,
        descripcion: descripcion,
        imagen: imagen,
        enlace: enlace,
        tags: tag,
        });  
        posteo.save((err,db)=>{
            if(err) console.error(err);
            console.log(db);
            isLogin=7;
            res.status(200).render("index", { login: req.session.login, isLogin: isLogin });
            })
        });
            
});




app.post("/ChangeDatos", (req, res) => {
    res.status(200).render("login");
    if (req.session.login) {
        Admin.findOneAndUpdate({ nombre: "admin" },
{ $set: { contraseña: req.body.contraseña } }, { new: true }, function (err, doc) {
                if (err) console.log("Error ", err);
                console.log("Updated Doc -> ", doc);
                res.status(200).render("login", { isLogin: isLogin, login: req.session.login });
            });


            Admin.findOneAndUpdate({ nombre: "admin" },
            { $set: { usuario: req.body.usuario } }, { new: true }, function (err, doc) {
                if (err) console.log("Error ", err);
                console.log("Updated Doc -> ", doc);
                res.status(200).render("login", { isLogin: isLogin, login: req.session.login });
            });


    }
});



app.get("/*", (req, res) => {
    res.status(200).render("error404");
    
});





//RUTAS
/*
  
    router.route("/edicion").get(adminController.edicion);
    router.route("/editarPosteo").get(adminController.editarPost);
  
*/




app.post("/cargarImagen", async (req, res) => {
    res.render("config");
});
app.post("/guardarImagen", async (req, res) => {
    res.render("config");
});

module.exports = app;
