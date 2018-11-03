const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const db = require('./db.js')

const imgUpload = require('./controllers/imgUpload');
const Multer = require('multer');

const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb
  }
});

const Users = require('./controllers/Users');
const tokenService = require('./services/TokenService');
const authService = require('./services/AuthService');

// Create connection to Mongo DB ßßßßvia Mongoose
// mongoose.connect(process.env.DB_URI);
mongoose.connection.once('open', () => console.log('Hello from tinge-db!'));
mongoose.Promise = global.Promise;

// Configure Express Application Server
const app = express();
const PORT = process.env.PORT || 8080;

// Set up body-parser for processing form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enable CORS to allow different hosts to connect to our server
app.use(cors());

// Middleware to parse tokens out of incoming request headers
app.use(tokenService.receiveToken);

// Dummy Route
app.get('/', (req, res) => {
  res.send('Hello Brit');
});

// Dummy Restricted Route
app.get('/restricted', authService.restrict(), (req, res) => {
  res.json({ tokenData: res.locals.tokenData });
});

// Signup Route
app.post('/signup', Users.createUser, tokenService.createToken, (req, res) => {
  res.json({ token: res.locals.token, palettes: res.locals.palettes });
});

//Login Route
app.post('/login', Users.login, tokenService.createToken, (req, res) => {
  res.json({ token: res.locals.token, palettes: res.locals.palettes });
});

//Upload photo to Google Cloud Storage
//https://medium.com/google-cloud/upload-images-to-google-cloud-storage-with-react-native-and-expressjs-61b8874abc49
app.post('/image-upload',  
  multer.single('image'),
  imgUpload.uploadToGcs, 
  function(request, response, next) {
    const data = request.body;

    //send URL path of Google Storage File to Database. 
    db.query(`INSERT INTO images (uri) VALUES ('${request.file.cloudStoragePublicUrl}');`)
    .then((data) => {
      console.log(data)
    })
    .catch((err) => {
      console.log(err);
    })

    if (request.file && request.file.cloudStoragePublicUrl) {
      data.imageUrl = request.file.cloudStoragePublicUrl;
    }
  response.send(data)
});
app.post('/postMessages', (req, res, next) => {
  // const data = req.body;
  // console.log('inside /postMessages from axios');
  
  // db.query(``).then((data) => {
  //   console.log('request from axios to db in index.js', data)
  //   res.send(data);
  // }).catch(err => {
  //   console.log('err in native/index/getMessages', err);
  // })
})
//Save Palette Route
app.post('/savePalette', authService.restrict(), Users.savePalette, tokenService.createToken, (req, res) => {
  res.json( { token: res.locals.token, palettes: res.locals.palettes });
});

//Delete Palette Route
app.delete('/deletePalette/:palette_id', authService.restrict(), Users.deletePalette, tokenService.createToken, (req, res) => {
  res.json({token: res.locals.token, palettes: res.locals.palettes})
});

// Start server
app.listen(PORT, () => console.log('Server started on port', PORT));
