const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000; // Or any port of your choice
const PUBLIC_FOLDER = path.join(__dirname, 'public');

// Serve static files from the 'public' directory
app.use(express.static(PUBLIC_FOLDER));

const multer = require('multer');
const upload = multer({ dest: PUBLIC_FOLDER });

app.post('/upload', upload.single('file'), (req, res) => {
    res.send('File uploaded successfully');
});

const serveIndex = require('serve-index');

// Enable directory listing
app.use('/files', express.static(PUBLIC_FOLDER), serveIndex(PUBLIC_FOLDER, { icons: true }));



// Fallback route for 404
app.use((req, res) => {
    res.status(404).send('File not found');
});

app.listen(PORT, () => {
    console.log(`File server is running at http://<YOUR_IP_OR_DOMAIN>:${PORT}`);
});
