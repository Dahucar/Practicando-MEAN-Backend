const express = require('express');
const comentController = require('../controllers/coments.controller');
const md_auth = require('../middlewares/authenticated');
const router = express.Router();
 
router.post('/coment/topic/:id', md_auth.auth, comentController.add); 
router.put('/coment/:comentId', md_auth.auth, comentController.update);
router.delete('/coment/:topicId/:comentId', md_auth.auth, comentController.delete); 

module.exports = router;