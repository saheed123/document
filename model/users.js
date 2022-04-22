const mongoose = require('mongoose');
const token = require('jsonwebtoken');
require('dotenv').config();
const crypto = require('crypto');
const path = require('path');
const {
  GridFsStorage
} = require('multer-gridfs-storage');
const multer = require('multer');
const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  confirm: {
    type: String,
    required: true


  },
  phone: {
    type: Number,
    required: true
  },
  documents: [{
      type: mongoose.Schema.Types.ObjectId

    }]


    ,

  date: {
    type: Date,
    default: Date.now
  },
  isAdmin: {
    type: Boolean,
    default: false
  }


});
var storage = new GridFsStorage({
  url: process.env.mongoURI,
  file: (req, file,res) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(res.json(err.stack));

        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'





        };
        resolve(fileInfo);
      });
    });
  },
  options: {
    useUnifiedTopology: true,
    useNewUrlParser: true
  }
});

userSchema.methods.generateToken = function () {
  const accessToken = token.sign({
    _id: this._id,
    firstname: this.firstname,
    lastname: this.lastname,
    email: this.email,
    isAdmin: this.isAdmin,
    phone: this.phone,
    documents: this.documents
  }, process.env.JWT_SEC, {
    expiresIn: '2d'
  });
  return accessToken;

}
userSchema.virtual("fullName").get(function () {
  return `${this.firstname} ${this.lastname}`;
})
userSchema.methods.findUserWithSameName = function () {
  return this.model("USER")
    .find({
      fullname: this.fullname
    })
    .exec();
}


userSchema.methods.fullname = function () {
  return ` ${this.firstname} ${this.lastname}`;
}
const User = mongoose.model('User', userSchema);
const upload = multer({
  storage
});



module.exports = {
  User,
  upload,

};