const jwt = require('jwt-simple');
const moment = require('moment'); //para generar las fechas

//como solo hay un metodo lo exporto directamente 
exports.createToken = (user) => {
    //objeto del usuario para generar el token
    var payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        image: user.image,
        lat: moment().unix(),
        expr: moment().add(10, 'days').unix()
    };
    //encode permite generar el token 
    return jwt.encode(payload, 'mi-clave-secreta-token');
};