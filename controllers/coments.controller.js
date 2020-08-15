const Topic = require('../models/topic.model');
const validator = require('validator');
var comentsController = {
    add: (req, res) => {
        //recoger el id del topic por la URL
        var topicId = req.params.id;
        //buscar el topic por el id
        Topic.findById(topicId).exec((err, topic) => {
            if(err || !topic) return res.status(500).send({msg: 'Error al buscar su topic'});

            //compobar objeto usuario y validar datos
            if(req.body.content){
                //validar datos 
                let content_val;
                try {
                    content_val = !validator.isEmpty(req.body.content);
                } catch (error) {
                    return res.status(200).send({msg: 'Faltan datos por enviar.' });
                }

                if(content_val){
                    var comment = {
                        user: req.user.sub,
                        content: req.body.content
                    };
                    //en la propiedad de "coment" y añadir un nuevo elemento
                    topic.coments.push(comment);
                    topic.save((err) => {
                        if(err) return res.status(500).send({msg: 'Error al añadir el comentario'});
                        //dar una respuesta
                        return res.status(200).send({msg: 'Comentario añadido.', topic });
                    });
                }else{
                    return res.status(200).send({msg: 'Comentario invalido.' });
                }
            }else{
                return res.status(200).send({msg: 'Debe enviar su comentario' });
            } 
        }); 
    },

    update: (req, res) => {
        //obtener id de comentario
        var comentId = req.params.comentId;
        
        //recoger datos y validar 
        var params = req.body;
        let content_val;
        try {
            content_val = !validator.isEmpty(params.content);
        } catch (error) {
            return res.status(200).send({msg: 'Faltan datos por enviar.' });
        }

        if(content_val){
            //buscar y actualizar el sub documento
            Topic.findOneAndUpdate({ 'coments._id': comentId }, { '$set': { 'coments.$.content': params.content}}, {new:true}, (err, tipocComent) => {
                if(err) return res.status(500).send({msg: 'Error al añadir el comentario'});
                //dar una respuesta
                return res.status(200).send({msg: 'Comentario actualizado.', tipocComent });
            }); 
        } 
    },

    delete: (req, res) => {
        //sacar el id del topic y de comentario a borrar
        var topicId = req.params.topicId;
        var comentId = req.params.comentId;
        //buscar el topic
        Topic.findById(topicId, (err, topicFind) => {
            if(err) return res.status(500).send({msg: 'Error al añadir el comentario'});
            //seleccionar el sub documento (comentario)
            var coment = topicFind.coments.id(comentId);
            if(coment){
                //borrar el comentario
                coment.remove();
                //guardar el topic
                topicFind.save((err) => {
                    if(err) return res.status(500).send({msg: 'Error al guardar cambios'});
                    return res.status(200).send({msg: 'ok', topicFind});
                });
            }else{
                //dar respuesta  
                return res.status(500).send({msg: 'El comentario buscado no esta'});
            }
        }); 
    }
}

module.exports = comentsController;