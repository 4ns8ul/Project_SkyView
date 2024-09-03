import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from 'body-parser';
import axios from 'axios';
import fs from "fs";
import FormData from 'form-data'

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Setup view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Setup body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public/uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Routes
import indexRouter from './routes/index.js';
app.use('/', indexRouter);

// Upload Route
app.post('/upload', upload.fields([{ name: 'image' }, { name: 'csv' }]), async (req, res) => {
  try {
    const imageFile = req.files['image'][0];
    const csvFile = req.files['csv'][0];

    // Sending files to Python server
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imageFile.path));
    formData.append('csv', fs.createReadStream(csvFile.path));

    const response = await axios.post('http://192.168.32.128:5001/process', formData, {
      headers: formData.getHeaders(),
    });

    // Handle response
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing files');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
