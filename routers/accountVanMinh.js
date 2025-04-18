const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const {AccountVanMinhModal, AssetModal} = require('../models/connectDB');
const authenticateToken = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

dotenv.config();
var router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key";

// lấy data trong db
router.get('/', async (req, res) => {
    var page = parseInt(req.body.page) || 1;
    var limit = parseInt(req.body.limit) || 10;
    const total =  await AccountVanMinhModal.countDocuments();

    AccountVanMinhModal.find({})
        // Phân trang khi load dữ liệu
        .skip((page - 1) * limit)
        .limit(limit)
        // .select('-password')
        .then(account => {
            res.send({total, account});
        })
        .catch(err => {
            res.status(500).json("Lỗi " + err);
        });
})

// lấy data trong db. tìm theo phone
router.get('/:id', authenticateToken, async (req, res) => {
    var phone = req.params.id;
    AccountVanMinhModal.findOne({ phone: phone })
        .then(account => {
            res.send(account);
        })
        .catch(err => {
            res.status(500).json("Lỗi " + err);
        });
})

// thêm data vào db
router.post('/register', (req, res) => {
    var phone = req.body.phone;
    var password = req.body.password;
    var name = req.body.name;
    var officeID = req.body.officeID;
    var ruler = req.body.ruler;
    var avatar = req.body.avatar;
    var dateOfBirth = req.body.dateOfBirth;
    var email = req.body.email;
    var status = req.body.status;
    var position = req.body.position;

    AccountVanMinhModal.findOne({
        phone: phone,
    })
        .then(account => {
            if (account) {
                return res.json('Tài khoản đã tồn tại');
            } else {
                AccountVanMinhModal.create({
                    phone: phone,
                    password: password,
                    name: name,
                    officeID: officeID,
                    ruler: ruler,
                    avatar : avatar,
                    dateOfBirth: dateOfBirth,
                    email: email,
                    status: status,
                    position: position,
                })
                    .then(data => {
                        res.json('Tạo tài khoản thành công');
                    })
            }
        })
        .catch(err => {
            res.status(500).json("Tạo tài khoản thất bại " + err);
        })
})

router.post('/login', (req, res) => {
    var phone = req.body.phone;
    var password = req.body.password;

    AccountVanMinhModal.findOne({
        phone: phone,
        password: password,
    })
        .then(account => {
            if (account) {
                const token = jwt.sign({ id: account._id, phone: account.phone, tokenVersion: account.tokenVersion || 0, }, SECRET_KEY, { expiresIn: "10d" });
                return res.json({message: "Đăng nhập thành công", token, phone});
            } else {
                return res.status(300).json("Tài khoản hoặc mật khẩu không đúng")
            }
        })
        .catch(err => {
            res.status(500).json("SERVER_ERROR");
        })
})

// Sửa dữ liệu trong DB
router.put('/update/:id', authenticateToken, (req, res) => {
    var id = req.params.id;
    var password = req.body.password;
    var name = req.body.name;
    var departmentID = req.body.departmentID;
    var teamID = req.body.teamID;
    var officeID = req.body.officeID;
    var ruler = req.body.ruler;
    var avatar = req.body.avatar;
    var dateOfBirth = req.body.dateOfBirth;
    var phone = req.body.phone;
    var email = req.body.email;
    var status = req.body.status;
    var position = req.body.position;

    AccountVanMinhModal.findById(id)
        .then(user => {
            if (!user) {
                return res.status(404).json("Không tìm thấy user");
            }

            // Nếu password được gửi lên và khác password cũ => cập nhật + tăng tokenVersion
            if (password && password !== user.password) {
                user.password = password;
                user.tokenVersion = (user.tokenVersion || 0) + 1;
            }
            if (status !== user.status) {
                user.status = status;
                user.tokenVersion = (user.tokenVersion || 0) + 1;
            }

            // Cập nhật các trường còn lại
            user.name = name;
            user.departmentID = departmentID;
            user.teamID = teamID;
            user.officeID = officeID;
            user.ruler = ruler;
            user.avatar = avatar;
            user.dateOfBirth = dateOfBirth;
            user.phone = phone;
            user.email = email;
            user.position = position;

            user.save()
                .then(() => {
                    res.json('Update thành công');
                })
                .catch(err => {
                    res.status(500).json("Lỗi khi lưu dữ liệu: " + err);
                });
        })
        .catch(err => {
            res.status(500).json("Update thất bại: " + err);
        });

    // AccountVanMinhModal.findByIdAndUpdate(id, {
    //     password: password,
    //     name:name,
    //     departmentID:departmentID,
    //     teamID:teamID,
    //     officeID:officeID,
    //     ruler:ruler,
    //     avatar:avatar,
    //     dateOfBirth:dateOfBirth,
    //     phone:phone,
    //     email:email,
    //     status:status,
    //     position:position,
    // })
    //     .then(data => {
    //         res.json('Update thành công');
    //     })
    //     .catch(err => {
    //         res.status(500).json("Update thất bại " + err);
    //     })
})

router.delete('/', authenticateToken, async (req, res) => {
    try {
        const ids  = req.body.ids; // Lấy danh sách ID từ request body

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Danh sách ID không hợp lệ" });
        }

        // Chuyển đổi ID thành ObjectId (nếu cần)
        const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));

        const result = await AccountVanMinhModal.deleteMany({ _id: { $in: objectIds } });

        if (result.deletedCount > 0) {
            return res.json({ message: `Đã xoá ${result.deletedCount} tài khoản thành công.` });
        } else {
            return res.status(404).json({ message: "Không tìm thấy tài khoản nào để xoá." });
        }
    } catch (error) {
        console.error("Lỗi khi xoá:", error);
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
})

module.exports = router;