const {
  User,
  upload
} = require('../model/users');
const bcrypt = require('bcrypt');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const conn = mongoose.createConnection(process.env.mongoURI);
let gfs;



const _ = require('lodash');


const {
  validationResult
} = require('express-validator');
exports.postUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send(
      errors.array()
    );
  }
  var user = new User(_.pick(req.body, ['firstname', 'lastname', 'email', 'password', 'confirm', 'phone']));
  user.password = await bcrypt.hash(user.password, 10);
  user.confirm = user.password;
  user.fullname = user.fullname;
  user.phone = user.phone,
    user.documents = [];
  const token = user.generateToken();
  const fullname = user.fullname();
  const {
    _id,
    password,
    confirm,
    documents,
    ...other
  } = user._doc;
  try {
    await user.save();
    res.header('x-auth-token', token).status(200).json({
      ...other,
      token,
      fullname
    });

  } catch (ex) {
    next(ex);

  }




}
exports.loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }
  try {

    const user = await User.findOne({
      email: req.body.email
    });
    if (!user)
      return res.status(400).send('invalid!!! email not registered');
    const validatePassword = await bcrypt.compare(req.body.password, user.password);
    if (!validatePassword) {
      return res.status(400).send('invalid password');
    }
    const accessToken = user.generateToken();

    const {
      _id,
      password,
      confirm,
      ...other
    } = user._doc;
    res.header('x-auth-token', accessToken).status(200).json({
      ...other,
      accessToken
    });





  } catch (error) {
    next(error);

  }





}
exports.updateUser = async (req, res) => {


  if (req.body.password) {
    req.body.password = bcrypt.hash(req.body.password, 10)
  }
  try {
    const updateUser = await User.findOneAndUpdate(req.user._id, {
      $set: req.body
    }, {
      new: true
    });
    updateUser ? res.status(200).json({
      message: 'successfully updated'
    }) : res.status(400).json({
      message: 'not found'
    });

  } catch (error) {
    res.status(500).json(error);

  }

}
exports.deleteUser = async (req, res, next) => {
  const fs = require('fs');


  try {

    gfs = Grid(conn.db, mongoose.mongo);
    var coll = gfs.collection('fs');





    const user = await User.findByIdAndDelete({
      _id: req.user._id
    });
    if (!user)
      res.status(401).json({
        message: 'invalid credential'
      });
    const obj = coll.findOne({
      'metadata.email': user.email
    }, {
      _id: 1
    });
    gfs.files.deleteMany(obj, function (err) {
      if (err) {
        return console.log(err.message)
      }
      console.log('success');

    });
    

    








    return res.status(200).json({
      message: 'successfully deleted'
    });



  } catch (error) {

    next();

  }










}
exports.findUser = async (req, res, next) => {
  const user = await User.findOne({
    _id: req.user._id
  });

  res.status(200).json(user);
}
exports.logout = async (req, res, next) => {
  req.logout();
  res.status(200).json({
    message: 'logout successfull'
  });

}
exports.findall = async (req, res, next) => {
  try {
    const all = await User.find({});


    return res.status(200).json(all);



  } catch (error) {

    next();


  }






}