const express = require('express');
const topicsController = require('../controllers/topics.controller');
const md_auth = require('../middlewares/authenticated');
const router = express.Router();
 
router.post('/topic', md_auth.auth, topicsController.save); 
router.get('/topics/:page?', topicsController.getTopics);
router.get('/userTopics/:user', topicsController.getTopicsByUser);
router.get('/topic/:id', topicsController.getTopic);
router.put('/topic/:id', md_auth.auth, topicsController.update);
router.delete('/topic/:id', md_auth.auth, topicsController.delete);
router.get('/search/:search', topicsController.search);

module.exports = router;