const express = require('express');
const userController = require('../controllers/users.controller');
const md_auth = require('../middlewares/authenticated');
const multiPart = require('connect-multiparty'); 
const md_upload = multiPart({ uploadDir: './uploads/users' })
const router = express.Router();
 
router.post('/save', userController.save);
router.post('/login', userController.login);
router.put('/update', md_auth.auth, userController.update);
router.post('/uploadAvatar', [md_auth.auth, md_upload], userController.uploadAvatar);
router.get('/avatar/:imageFileName', userController.avatar)
router.get('/users', userController.getUsers);
router.get('/user/:id', userController.getUser);

module.exports = router;