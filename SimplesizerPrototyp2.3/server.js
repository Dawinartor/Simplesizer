const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('public'));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('audioFile'), (req, res) => {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(req.file.buffer);
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});