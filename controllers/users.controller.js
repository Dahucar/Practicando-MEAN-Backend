const validator = require('validator');
const fs = require('fs');
const path = require('path');
const User = require('../models/user.models');
const jwt = require('../services/jwt');
const bcrypt = require('bcrypt-node'); 
var userController = {  
    save: (req, res) => {
        // 1° -> recoger los parametros de la petición
        var params = req.body; 

        // 2° -> validar los datos
        let name_valid, surname_valid, email_valid, password_valid;
        try {
            name_valid = !validator.isEmpty(params.name);
            surname_valid = !validator.isEmpty(params.surname); 
            email_valid = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            password_valid = !validator.isEmpty(params.password);
        } catch (error) {
            return res.status(200).send({msg: 'Faltan datos por enviar.'});   
        }

        if(name_valid && surname_valid && email_valid && password_valid){
            // 3° -> crear objecto de usuario
            var user = new User();

            // 4° -> asignar datos a objecto
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.rol = 'ROLE_USER';
            user.image = null; 

            // 5° -> verificar existencia de usuario
            User.findOne({email: user.email}, (err, issetUser) => {
                if(err) return res.status(500),send({msg: 'Error al comprobar su email.'});
                if(!issetUser) {
                    // 6° -> cifrar contraseña y guardar
                    bcrypt.hash(params.password, null, null, function(err, hash) {
                        user.password = hash;  
                        user.save((err, userSaved) => {
                            if(err) return res.status(400).send({msg: 'Error al guardar el usuario.'});
                            if(!userSaved) return res.status(400).send({msg: 'Usuario no guardado'});
                            return res.status(200).send({msg: 'Usuario guardado'}); 
                        }); 
                    });

                }else{
                    return res.status(400).send({msg: 'El email ingreso ya esta en uso.'});
                }
            }); 
        }else{
            return res.status(200).send({
                msg: 'Datos invalidos.' 
            }); 
        } 
    },

    login: (req, res) => {
        // recoger parametros
        var params = req.body;
        // validar datos
        let email_val, password_valid;
        try{
            email_val = !validator.isEmpty(params.email) && validator.isEmail(params.email);;
            password_valid = !validator.isEmpty(params.password);
        } catch (error) {
            return res.status(200).send({msg: 'Faltan datos por enviar.'});   
        }

        if(!email_val || !password_valid){
            return res.status(200).send({msg: 'Ingrese sus credenciales correctamente.'});
        }

        // buscar el usuario
        User.findOne({email: params.email.toLowerCase()}, (err, user) => {
            if(err) return res.status(500).send({msg: 'Error durante la busqueda su usuario.'}); 
            if(!user) return res.status(404).send({msg: 'No se han encontrado usuarios con las credenciales indicadas. '});       
            //compara los password encriptada con el que nos pasen
            bcrypt.compare(params.password, user.password, (err, check) => {
                // si lo encuentra comprovar la contraseña
                if(check){
                    // generar token JWT
                    if(params.getToken){
                        // devolcer los datos de usuario
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }else{
                        //limpiar campos de un objeto
                        return res.status(200).send({user});
                    }
                }else{
                    return res.status(200).send({msg: 'sus contraseña no es correcta'});
                } 
            }); 
        }); 
    },

    update: (req, res) => {
        // recoger los datos del usuario
        var params = req.body;

        // validar datos 
        let name_valid, surname_valid, email_valid;
        try {
            name_valid = !validator.isEmpty(params.name);
            surname_valid = !validator.isEmpty(params.surname); 
            email_valid = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        } catch (error) {
            return res.status(200).send({msg: 'Faltan datos por enviar.'});   
        }
        
        //eliminar propiedades innecesarias
        delete params.password;
        
        //informar de errores
        if(!name_valid || !surname_valid || !email_valid){
            return res.status(200).send({msg: 'Los datos ingresados no son validos.'});
        }

        //buscar y actualizar el usuario
        var userId = req.user.sub;
        if(req.user.email != params.email){
            User.findOne({email: params.email.toLowerCase()}, (err, userFinded) => {
                if(err) return res.status(200).send({msg: 'Error al identificarse'});
                if(userFinded && userFinded.email == params.email){
                    return res.status(200).send({msg: 'No puede usar el email ingresado'});
                }else{
                    User.findOneAndUpdate(userId, params, {new:true}, (err, userUpdated) => {
                        if(err) return res.status(500).send({msg: 'Error al actualizar'});
                        if(!userUpdated) return res.status(404).send({msg: 'Usuario no encontrado'}); 
                            
                        //dar respuesta
                        return res.status(200).send({msg: 'update', userUpdated});
                    });
                }
             });
        }else{
            User.findOneAndUpdate(userId, params, {new:true}, (err, userUpdated) => {
                if(err) return res.status(500).send({msg: 'Error al actualizar'});
                if(!userUpdated) return res.status(404).send({msg: 'Usuario no encontrado'}); 
                    
                //dar respuesta
                return res.status(200).send({msg: 'update', userUpdated});
            });
        }
    },

    uploadAvatar: (req, res) => {
        //configurar la subida de imagenes (asignar el middleware configurado a esta ruta)
        //recoger fichero de imagen y verificar que llega
        var fileName = 'empty';
        if(!req.files){
            return res.status(200).send({ msg: 'Avatar no se ha enviado.' });
        }

        //conseguir el nombre y la extencion de archivo
        let filePath = req.files.file0.path;
        let fileSplit = filePath.split('\\');
        fileName = fileSplit[2]; //indice 2 tiene el nombre

        //conseguir y comprobar la extencion de imagen
        let extendSplit = fileName.split('\.');
        let fileExtend = extendSplit[1]; //indice 1 tiene la extencion

        if(fileExtend != 'png' && fileExtend != 'jpg' && fileExtend != 'jpeg'){
            fs.unlink(filePath, (err) => {
                return res.status(200).send({ msg: 'Extencion invalida.' });
            });
        }else{
            //sacar el id de usuario logeado y buscarlo
            let userId = req.user.sub;
            User.findOneAndUpdate({_id: userId}, {image: fileName}, {new:true}, (err, userFound) => {
                if(err) return res.status(500).send({msg: 'Error al buscar sus datos'});
                if(!userFound) return res.status(404).send({msg: 'Error inesperado al buscar sus datos'}); 
                //dar la respuesta
                return res.status(200).send({ msg: 'Avatar actualizado.', userFound });
            }); 
        } 
    },

    avatar: (req, res) => {
        var fileName = req.params.imageFileName;
        var pathFile = './uploads/users/'+fileName;

        //verificar que existe el fichero
        fs.exists(pathFile, (exists) => {
            if(exists) {
                return res.sendFile(path.resolve(pathFile));
            }else{
                return res.status(404).send({msg: 'La imagen no existe'});
            }
            
        });
    },

    getUsers: (req, res) => {
        User.find().exec((err, users) => {
            if(err || !users) return res.status(404).send({msg: 'no hay usuarios para mostrar'});
            return res.status(200).send({users});
        });
    },

    getUser: (req, res) => {
        var userId = req.params.id;
        User.findById(userId).exec((err, user) => {
            if(err || !user) return res.status(404).send({msg: 'no se ha encontrado al usuario'});
            return res.status(200).send({user});
        });
    }
}

module.exports = userController;