'use strict';
require('dotenv').config;



const {
  validationResult
} = require('express-validator');
const {
  User
} = require('../model/users');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const conn = mongoose.createConnection(process.env.mongoURI);
const fs = require('fs');









let gfs;














exports.list_all_tasks = async (req, res) => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.files.find().toArray((error, result) => {
    if (error) {
      return res.json({
        error: 'not found'
      });
    }
    if (result = [])
     return res.json({ message: 'no file is available' });
    res.status(200).json(result);


  });
};

exports.create_a_task = async function (req, res) {
  const docId = mongoose.Types.ObjectId(req.user._id);
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
  const write = gfs.createWriteStream({
    filename: req.files.file.name,
    content_type: req.files.file.type,
    metadata: req.user,
    mode: 'w'
  })

  fs.createReadStream(req.files.file.path).pipe(write);



  write.on('close', async function (file) {


    const user = await User.findById({
      _id: docId
    });

    user.documents.push(file._id);
    try {
      user.save();
      res.status(200).json({
        message: ` file with id ${file._id} for ${req.user.email} successfully saved`
      });

      fs.unlink(req.files.file.path, (err) => {
        if (err)
          console.log(err.message)
        console.log('success');
      })




    } catch (error) {

      return res.status(500).json({
        success: false,
        msg: error.message
      });
    }



  });















};
exports.download = async function (req, res) {
  try {
    gfs = Grid(conn.db, mongoose.mongo);

    gfs.files.findOne({
      filename: req.params.image
    }, (err, file) => {



      const readStream = gfs.createReadStream({
        filename: file.filename
      });
      readStream.on('error', err => {
        console.log(err.message);
        res.end();
      });
      readStream.pipe(res);



    });






  } catch (error) {
    res.status(500).json(error.message);
  }



};

exports.read_a_task = async function (req, res) {
  try {
    gfs = Grid(conn.db, mongoose.mongo);

    gfs.files.findOne({
      filename: req.params.docId
    }, (err, file) => {
      if (err) return res.status(400).send(err);
      if (!file || file.length === 0) return res.status(404).send('not found');
      console.log(file);
      res.status(200).json(file);

      if (file.contentType === 'image/png') {
        const readStream = gfs.createReadStream({
          filename: file.filename
        });
        readStream.on('error', err => {
          console.log(err.message);
          res.end();
        });
        readStream.pipe(res);
      }


    });






  } catch (error) {
    res.status(500).json(error.message);
  }



};

exports.delete_a_task = async function (req, res) {
  const objid = mongoose.Types.ObjectId(req.params.docId);
  const user = await User.findOne({
    _id: req.user._id
  });
  if (!user)
    res.status(401).json({
      message: 'invalid credential'
    });
  const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'fs'
  });
  bucket.delete(objid, function (err) {
    if (err) return res.json({
      message: 'no file to delete'
    });
  })
  await user.documents.pull(objid);
  user.save();
  res.status(200).json({
    message: 'successfully deleted'



  })



}