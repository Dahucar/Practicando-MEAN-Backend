const jwt = require('jwt-simple');
const moment = require('moment');
const secret = 'mi-clave-secreta-token';
exports.auth = (req, res, next) => {
    //comprobar si llega la autorización 
    if(!req.headers.authorization){
        return res.status(403).send({msg: 'La petición no tiene la cabecera correcta'});
    }

    //limpiar token y quitar comillas 
    var token = req.headers.authorization.replace(/['*]+/g, '');

    //decodificar el tokent
    try {
        var payload = jwt.decode(token, secret);  
        //comprobar si el token ha expirado
        if(payload.exp <= moment().unix()){
            return res.status(403).send({msg: 'Token expirado'});    
        }    
    } catch (ex) {
        return res.status(403).send({msg: 'Token invalido'});    
    } 
    
    //adjuntar usuario identificado 
    req.user = payload;

    next();
}