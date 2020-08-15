const validator = require('validator'); 
const Topic = require('../models/topic.model'); 
var topicsController = {  
    save: (req, res) => {
        //recoger parametros por post
        var params = req.body;
        
        //validar datos 
        let title_val, content_val, lang_val;
        try {
            title_val = !validator.isEmpty(params.title);
            content_val = !validator.isEmpty(params.content);
            lang_val = !validator.isEmpty(params.lang);
        } catch (error) {
            return res.status(200).send({msg: 'Faltan datos por enviar.' });
        }

        if(title_val && content_val && lang_val){
            //crear el objeto a guardar
            var topic = new Topic();
            //asignar valores al objeto
            topic.title = params.title;
            topic.content = params.content;
            topic.lang = params.lang;
            topic.code = '';
            topic.user = req.user.sub;
            //guardar el topic
            topic.save((err, topicStored) => {
                if(err || !topicStored) return res.status(500).send({msg: 'Error al guardar el topic' });
                //dar respueste
                return res.status(200).send({msg: 'guardado', topicStored });
            }); 
        }else{
            return res.status(200).send({msg: 'Datos invalidos.' }); 
        }
    },

    getTopics: (req, res) => {
        //cargar libreria de paginacion
        //regocer la pagina actual
        var page;
        if(!req.params.page || req.params.params == 0 || req.params.page == null || req.params.page == undefined){
            page = 1;
        }else{
            page = parseInt(req.params.page);
        }
        
        //indicar las opciones de paginacion
        const options = {
            sort: { date: -1 }, //ordenado de mas nuevo a mas viejo
            populate: 'user', // cargar el objeto completo del usuario que crea el topic
            limit: 5,
            page: page
        };

        //hacer una busqueda paginada
        Topic.paginate(/*condicion*/{}, /*opciones*/ options, (err, topics) => {
            if(err || !topics) return res.status(500).send({msg: 'Error al obtener los datos'});
            //devolver resultados ( topics, total de topics, total de paginas)
            return res.status(200).send({
                msg: 'ok',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages
            });
        }); 
    },

    getTopicsByUser: (req, res) => {
        //conseguir el id de usuario
        var userId = req.params.user;
        
        //buscar al usuario con la condicion de igualdad en el id
        Topic.find({user: userId})
        .sort([['date', 'descending']])
        .exec((err, topics) => {
            if(err || !topics) return res.status(200).send({msg: 'Error al obtener sus topics'})
            
            //devolver datos
            return res.status(200).send({
                topics
            });
        }); 
    }, 
    
    getTopic: (req, res) => {
        //obtener el id del topic 
        var topicId = req.params.id;

        //buscar por el id del topic
        Topic.findById(topicId)
        .populate('user')
        .populate('coments.user')
        .exec((err, topic) => {
            if(err || !topic) return res.status(200).send({msg: 'Error al buscar el topic'});
            return res.status(200).send({ topic });
        }); 
    },

    update: (req, res) => {
        //recoger id de la url
        var topicId = req.params.id;
        //regocer los datos por post
        var params = req.body;
        //validar datos
        let title_val, content_val, lang_val; 
        try {
            title_val = !validator.isEmpty(params.title);
            content_val = !validator.isEmpty(params.content);
            lang_val = !validator.isEmpty(params.lang);
        } catch (error) {
            return res.status(200).send({msg: 'Faltan enviar datos'});
        }

        if(title_val && content_val && lang_val){
            //crear un json con los datos modificados
            var update = {
                title: params.title,
                content: params.content,
                code: params.code,
                lang: params.lang
            }

            //buscar y actualizar el topic por ID e ID de usuario
            Topic.findByIdAndUpdate({_id: topicId, user: req.user.sub}, update, {new: true}, (err, topicUpdated) => {
                if(err || !topicUpdated) return res.status(500).send({msg: 'Error durante la actualización.'});
                return res.status(200).send({ topicUpdated });
            });

            //devolver una respuesta
        }else{
            return res.status(200).send({msg: 'Datos invalidos.'});
        } 
    },

    delete: (req, res) => {
        //obtener el id del topic de la url
        var topicId = req.params.id;

        //buscar y eliminar topic por el id
        Topic.findOneAndDelete({_id: topicId, user: req.user.sub}, (err, topicDelete) => {
            if(err || !topicDelete) return res.status(500).send({msg: 'Error al borrar su topic'});;
            return res.status(200).send({msg: 'delete', topicDelete});
        } );
    },

    search: (req, res) => {
        //sacar el string a buscar
        var busqueda = req.params.search;
        //buscar
        Topic.find({ '$or':[ 
            { 'title': { '$regex': busqueda, '$options': 'i' } },
            { 'content': { '$regex': busqueda, '$options': 'i' } } ,
            { 'code': { '$regex': busqueda, '$options': 'i' } },
            { 'lang': { '$regex': busqueda, '$options': 'i' } }
        ] })
        .sort([['date', 'descending']])
        .populate('user')
        .populate('coments.user')
        .exec((err, topics) => {
            if(err || !topics) return res.status(500).send({msg: 'Error al borrar su topic'});;
            return res.status(200).send({msg: 'encontrados', topics}); 
        }); 
    }
}

module.exports = topicsController;