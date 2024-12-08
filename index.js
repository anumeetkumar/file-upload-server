const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const serveIndex = require('serve-index');
const cors = require('cors');

const app = express();
const PORT = 3000; 
const PUBLIC_FOLDER = path.join(__dirname, 'public');
app.use(cors());

// Ensure the public folder exists
if (!fs.existsSync(PUBLIC_FOLDER)) {
    fs.mkdirSync(PUBLIC_FOLDER, { recursive: true });
}

// Serve static files from the 'public' directory
app.use(express.static(PUBLIC_FOLDER));

// Configure multer to save files with original names in the public folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, PUBLIC_FOLDER);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        const publicUrl = `${req.protocol}://${req.get('host')}/${req.file.originalname}`;
        res.json({ message: 'File uploaded successfully', url: publicUrl });
    } catch (error) {

    }

});

// Enable directory listing
app.use('/files', express.static(PUBLIC_FOLDER), serveIndex(PUBLIC_FOLDER, { icons: true }));

// Fallback route for 404
app.use((req, res) => {
    res.status(404).send('File not found');
});

app.listen(PORT, () => {
    console.log(`File server is running at http://localhost:${PORT}`);
});
