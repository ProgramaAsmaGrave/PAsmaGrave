const mongoose = require("mongoose");
const app = require("./app");

const port = 3000;
//Corremos el servidor en el puerto seleccionado
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port} correctamente`);
});

//Carga de variables de entorno

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
    res.render('pagina');
});



