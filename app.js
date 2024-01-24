const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set up storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// Handle video upload
app.post('/upload', upload.single('video'), (req, res) => {
    const fileSize = (req.file.size / (1024 * 1024)).toFixed(2); // Convert to MB
    res.send(`File uploaded successfully! File Size: ${fileSize} MB`);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
