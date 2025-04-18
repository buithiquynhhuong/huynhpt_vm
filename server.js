const express = require('express')
const cors = require("cors");
var bodyParser = require('body-parser');
const port = 3076
const dotenv = require("dotenv");
var accountRouter = require('./routers/account')
var courseRouter = require('./routers/course')
var accountVanMinhRouter = require('./routers/accountVanMinh')
var qltsRouter = require('./routers/assetType')
var departmantRouter = require('./routers/departmant')
var teamRouter = require('./routers/team')
var officeRouter = require('./routers/office')
var assetTypeRouter = require('./routers/assetType')
var unitRouter = require('./routers/unit')
var assetRouter = require('./routers/assets')
var carRouter = require('./routers/car')
var assetTransferRouter = require('./routers/assetTransfer')
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Hoặc chỉ cho phép localhost:3000
app.use(cors({origin: "http://localhost:3000"}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res, next) => {
    res.send('hello world')
})


// Tạo thư mục uploads nếu chưa có
const fs = require("fs");
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = uuidv4() + ext;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage: storage });

// API upload ảnh
app.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

// Cho phép truy cập file ảnh đã upload
app.use("/uploads", express.static("uploads"));


app.use('/api/account', accountRouter);
app.use('/api/course', courseRouter);
app.use('/api/qlts', qltsRouter);
app.use('/api/vanminh/account-vanminh', accountVanMinhRouter);
app.use('/api/vanminh/departmant', departmantRouter);
app.use('/api/vanminh/team', teamRouter);
app.use('/api/vanminh/office', officeRouter);
app.use('/api/vanminh/asset-type', assetTypeRouter);
app.use('/api/vanminh/unit', unitRouter);
app.use('/api/vanminh/asset', assetRouter);
app.use('/api/vanminh/car', carRouter);
app.use('/api/vanminh/asset-transfer', assetTransferRouter);

// Nếu lỗi cái nhảy xuống đây luôn
app.use((err, req, res, next) => {
    res.send(err + ' Chưa đăng nhập đúng');
})

app.listen(port, () => {
    console.log(`Example app listening http://localhost ${port}`)
})