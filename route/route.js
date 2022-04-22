const express = require('express');

const route = express.Router();
const multiParty = require('connect-multiparty')();




const {  upload} = require('../model/users');
const resetPassword = require('../controller/passwordReset');
const changePassword = require('../controller/changePassword');
const {
  loginUser,
  updateUser,
  deleteUser,
  findUser,
  postUser,
  logout,
  findall
} = require('../controller/usersController');

const {
  verifyToken
} = require('../config/verifyToken');
const admin = require('../config/admin');
const {
  list_all_tasks,
  create_a_task,
  read_a_task,
  download,
  delete_a_task
} = require('../controller/document');
const {
  loginValidator,
  registerValidator,
  passwordReset,
  task
} = require('../config/validator');
route.post('/register', registerValidator, postUser);
route.post('/login', loginValidator, loginUser);
route.post('/passwordReset', passwordReset, resetPassword);
route.post('/passwordReset/:userId/:token', changePassword);
route.put('/register/update',registerValidator,verifyToken, updateUser);
route.delete('/register/delete', verifyToken,multiParty,deleteUser);
route.get('/me', verifyToken, findUser);
route.get('/all', [verifyToken, admin], findall);
route.post('/upload',[verifyToken],multiParty,create_a_task);
route.get('/allUpload', list_all_tasks);
route.delete('/deleteDoc/:docId', [verifyToken], delete_a_task);
route.get('/me/:docId', [verifyToken], read_a_task);
route.get('/download/:image',  download);


route.get('/logout', logout);


module.exports = route;
