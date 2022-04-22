require('dotenv').config();
let gfs;

const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const hostname = '127.0.0.1';
const dbPorts = process.env.dbPort;
const mongoURI = process.env.mongoURI;
const conn = mongoose.createConnection(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(mongoURI);
mongoose.connection.once('open',() => {
  console.log(`db connected ${hostname}  ${dbPorts}`);
})

conn.on('open', () => {
  
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('fs');
  
})




