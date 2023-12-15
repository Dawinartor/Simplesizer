const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3001;

// Konfiguration für das Speichern von hochgeladenen Dateien
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Statische Dateien aus dem 'src' Verzeichnis servieren
app.use(express.static('src'));

// Standardroute für die index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
