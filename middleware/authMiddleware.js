const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { AccountVanMinhModal } = require("../models/connectDB");

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key";

const authenticateToken = async (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Không có token, từ chối truy cập" });

    // jwt.verify(token, SECRET_KEY, (err, user) => {
    //     if (err) return res.status(403).json({ message: "Token không hợp lệ" });
    //     req.user = user;  // Lưu thông tin user vào req để sử dụng ở API sau
    //     next();
    // });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const userInDb = await AccountVanMinhModal.findById(decoded.id);

        if (!userInDb || (decoded.tokenVersion ?? -1) !== (userInDb.tokenVersion ?? -2)) {
            return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
        }

        req.user = userInDb; // Gán user thực tế từ DB
        next();
    } catch (err) {
        return res.status(403).json({ message: "Token không hợp lệ" });
    }
};

module.exports = authenticateToken;
