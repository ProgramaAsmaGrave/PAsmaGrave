const express = require("express");
const app = express();
const path = require("path");
const morgan = require("morgan");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const session = require("cookie-session");
const nodemailer = require("nodemailer");
const  imgbbUploader  =  require ( "imgbb-uploader" ) ;

//Base de Datos
const mongoose = require("mongoose");
const Admin = require("./models/myModel");
const PostModel = require("./models/postModel");

//Multer
const multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/files');
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + ".png");
    }
  })
   
  var upload = multer({ storage: storage })

//hashS
const bcrypt = require("bcrypt");
const { stringify } = require("querystring");

//variables globales para el logeo y los sweetsalert
global.isLogin = 0;
global.login = false;
global.idPosts=1;
global.formulario=1;
global.cerrar=false;

//vistas
app.set("view engine", "ejs");
//Defino la localización de mis vistas
app.set("views", path.join(__dirname, "views"));


app.use(cors());
//Middlewares
app.use(
    session({
        login: false,
        cerrar:false,
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
                    res.status(200).redirect("/config");                  
                }     
                else {
                    res.status(200).render("login", {isLogin: 2,login: req.session.login});
                }
            });
        }
    }); 
});

app.get('/seccionAdmin', (req, res) => {
    if(req.session.login){
        
        PostModel.find().sort({id: -1}).exec(function(err, post) {   
            console.log(post);
            res.status(200).render("edicionPosteos", {data:post});
        });
        
        
    }
    else{
        res.status(200).render("index", {isLogin: 4,login: req.session.login}); 
    }
});
app.get("/config", (req, res) => {
    if(req.session.login){
        res.status(200).render("config",{isLogin:5,login:req.session.login});
    }
    else{
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
        res.status(200).render("index", {isLogin: 4,login: req.session.login}); 
    }


});

app.get("/logout", (req, res) => {
    if (req.session.login) {
        req.session.login =false;  
        res.redirect("/");
        //cerrar=true;
    } else {
        res.redirect("/");
    }
});
app.get("/error404", (req, res) => {
    res.status(200).render("error404");

});

app.get('/visualizar/:id', (req, res) => {
    var id= req.params.id;
    PostModel.find({ id:id }, (err, post) => {  
        console.log(post);
        res.status(200).render("visualizarPost", {data:post});
    }); 
});

app.get('/eliminarPost/:id', (req, res) => {
    var id= req.params.id;
    PostModel.find({ id:id }).remove().exec();
    PostModel.find().sort({id: -1}).exec(function(err, post) {   
        console.log(post);
        res.status(200).render("edicionPosteos", {data:post});
    });
    res.redirect("/seccionAdmin");
    
});

app.get('/verPostsUsuario', (req, res) => {
    PostModel.find(function(err, data) {
        if(err){
            console.log(err);
        }
        else{
            console.log(data);
            res.status(200).render("verPostsUsuario", {data: data});
        }
    }); 
});

app.get('/contactanos', (req, res) => {
    PostModel.find(function(err, data) {
        if(err){
            console.log(err);
        }
        else{
            console.log(data);
            res.status(200).render("vistaContacto", {data: data});
        }
    }); 
});

app.get('/editarpost/:id', (req, res) => {
    var id= req.params.id;
    PostModel.find({ id:id }, (err, post) => {  
        console.log(post);
        res.status(200).render("editPosteo", {data:post});
    });
    
});

app.post('/editarposteo/:id', (req, res) => {
    var id= req.params.id;
    PostModel.findOneAndUpdate({ id: id },
    { $set: { titulo: req.body.titulo,descripcion: req.body.descripcion,fecha: req.body.fecha,enlace: req.body.enlace,tags: req.body.tag} }, { new: true }, function (err, doc) {
        if (err) console.log("Error ", err);
                console.log("Updated Doc -> ", doc);
                PostModel.find().sort({id: -1}).exec(function(err, post) {   
                    console.log(post);
                    res.status(200).render("edicionPosteos", {data:post});
                });
                
            });
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

app.post("/subirpost1", (req, res) => {
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
            if(err){
            console.log(err);
            res.status(200).render("index", {isLogin: 8,login: req.session.login}); 
            } 
            else{
            res.status(200).render("index", {isLogin: 7,login: req.session.login}); 
            } 
            })
        });       
});

app.post('/subirpost', upload.single('foto'),function (req, res, next) {
    console.log("holaa"+req.file.filename)
        let fecha=req.body.fecha;
        let titulo= req.body.titulo;
        let descripcion = req.body.descripcion;
        let imagen ;
        let enlace = req.body.enlace;
        let tag = req.body.tag;
        imgbbUploader("04facdbd2e755d55e56fdc0f9e422f92", req.foto)
                    .then((res) => console.log(res.url))
                    .catch((error) => console.error(error));
                    imagen= res.url;
        PostModel.findOne().sort({id: -1}).exec(function(err, post) {  
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
            if(err){
            console.log(err);
            res.status(200).render("index", {isLogin: 8,login: req.session.login});
            }
            else{       
                const file = req.file;      
                if (!file) {
                    const error = new Error('Please choose files');
                    error.httpStatusCode = 400;
                    return next(error);
                }
               
  
            res.status(200).render("index", {isLogin: 7,login: req.session.login});
            }
            })
        });
 });
 

app.post("/ChangeDatos", (req, res) => {
    res.status(200).render("login");
    if (req.session.login) {
        Admin.findOneAndUpdate({ nombre: "admin" },{ $set: { contraseña: req.body.contraseña } }, { new: true }, function (err, doc) {
            if (err) console.log("Error ", err);
            console.log("Updated Doc -> ", doc);
            res.status(200).render("login", { isLogin: isLogin, login: req.session.login });
        });

        Admin.findOneAndUpdate({ nombre: "admin" },{ $set: { usuario: req.body.usuario } }, { new: true }, function (err, doc) {
            if (err) console.log("Error ", err);
            console.log("Updated Doc -> ", doc);
            res.status(200).render("login", { isLogin: isLogin, login: req.session.login });
        });
    }
});

app.get("/*", (req, res) => {
    res.status(200).render("error404"); 
});

app.post("/contactForm", async (req, res) => {

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "jaguerodiaz@escuelasproa.edu.ar",
            pass: "jere172901",
        },
    });

    let contenido = {
        from: "jaguerodiaz@escuelaproa.edu.ar", // sender address
        to: "lnespinoza@escuelasproa.edu.ar", // list of receivers
        subject: "consulta de paciente", // Subject line
        text:
            "\n" +
            "Nombre:"+
            "\n" +
            req.body.nombreCompleto +
            "\n" +
            "Numero:"+
            "\n" +
            req.body.telefono +
            "\n" +
            "consulta:" +
            "\n" +
            req.body.consulta +
            "\n" +
            "mail del paciente:" +
            "\n" +
            req.body.email, // plain text body
    };
    transporter.sendMail(contenido, function (err, data) {
        if (err) {
            console.log(`error encontrado : ${err}`);
        } else {
            console.log(`Email enviado`);
        }
    });
    res.redirect("/");
});

app.post("/cargarImagen", async (req, res) => {
    res.render("config");
});
app.post("/guardarImagen", async (req, res) => {
    res.render("config");
});

module.exports = app;
