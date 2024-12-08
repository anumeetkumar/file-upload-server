const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const serveIndex = require('serve-index');
const cors = require('cors');
const { default: axios } = require('axios');
require('dotenv').config();
var cron = require('node-cron');

const app = express();
const PORT = 3000;
const PUBLIC_FOLDER = path.join(__dirname, 'public');

// Define allowed origins
const allowedOrigins = [
    /^(https?:\/\/localhost(:\d+)?)/, // Matches any port on localhost
    'https://app.clourax.com',
];

// Configure CORS to only allow requests from localhost (any port) or app.clourax.com
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some(regex => typeof regex === 'string' ? origin === regex : regex.test(origin))) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error('Not allowed by CORS'), false); // Reject the request
        }
    }
}));

// Ensure the public folder exists
if (!fs.existsSync(PUBLIC_FOLDER)) {
    fs.mkdirSync(PUBLIC_FOLDER, { recursive: true });
}

// Serve static files from the 'public' directory
app.use(express.static(PUBLIC_FOLDER));

// Configure multer to save files with unique names in the public folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, PUBLIC_FOLDER);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        const publicUrl = `https://upload.clourax.com/${req.file.filename}`;
        res.json({ message: 'File uploaded successfully', url: publicUrl });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.get("/", async (req, res) => {
    const secret = process.env.CRON_SECRET
    const API_URL = process.env.API_SERVER_URL
    try {
        const resp = await axios.get(`${API_URL}/api/admin/notifications/whatsapp/followup`, { headers: { Authorization: `Bearer ${secret}` } });

        res.json({ message: 'File uploaded successfully', });

    } catch (error) {
        console.log("followup cron ", error)

    }

})

// Enable directory listing
app.use('/files', express.static(PUBLIC_FOLDER), serveIndex(PUBLIC_FOLDER, { icons: true }));

// Fallback route for 404
app.use((req, res) => {
    res.status(404).send('File not found');
});

app.listen(PORT, () => {
    console.log(`File server is running at http://localhost:${PORT}`);
});

const sendFollowup = async () => {
    const secret = process.env.CRON_SECRET
    const API_URL = process.env.API_SERVER_URL

    try {
        await axios.get(`${API_URL}/api/admin/notifications/whatsapp/followup`, { headers: { Authorization: `Bearer ${secret}` } });
    } catch (error) {
        console.log("sendFollowup error", error)
    }
}

// running a task every day at 6 AM
cron.schedule('0 6 * * *', () => {
    sendFollowup()
});

cron.schedule('*/20 * * * * *', () => {
    console.log('running a task every 20 seconds');
    sendFollowup()

});

