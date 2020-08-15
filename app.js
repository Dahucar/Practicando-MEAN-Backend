const express = require('express');
const bodyParser = require('body-parser');
const userRouter = require('./routes/users.routes');
const topicsRouter = require('./routes/topics.routes');
const comentRouter = require('./routes/coments.routes');
const app = express();

//configuracion
app.set('puerto', process.env.PORT || 5000);

//middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//CORS
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


//rutas
app.use('/users', userRouter);
app.use('/topics', topicsRouter);
app.use('/coment', comentRouter);

//exportar app
module.exports = app;