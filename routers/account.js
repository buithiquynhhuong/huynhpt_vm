const express = require("express");
var router = express.Router();
const {AccountModel, CourseModel} = require('../models/connectDB');

// lấy data trong db
router.get('/', (req, res) => {
    var page = parseInt(req.body.page) || 1;
    var limit = parseInt(req.body.limit) || 10;

    AccountModel.find({})
        // Phân trang khi load dữ liệu
        .skip((page - 1) * limit)
        .limit(limit)
        // 1 lần populate
        .populate('courseID')
        // 2 lần populate (tìm đến cha, sau đó populate con)
        .populate({
            path: 'courseID',
            populate: {path: 'courseTeacher'},
        })
        // populate đến cha và chấm đến con
        .populate('listCourse.courseID')
        .then(account => {
            res.send(account);
        })
        .catch(err => {
            res.status(500).json("Lỗi " + err);
        });
})

// thêm data vào db
router.post('/register', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var old = req.body.old;
    var key = req.body.key;
    var courseID = req.body.courseID;
    var listCourse = req.body.listCourse;

    AccountModel.findOne({
        username: username,
    })
        .then(account => {
            if (account) {
                return res.json('Tài khoản đã tồn tại');
            } else {
                AccountModel.create({
                    username: username,
                    password: password,
                    old: old,
                    key: key,
                    courseID: courseID,
                    listCourse: listCourse,
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
    var username = req.body.username;
    var password = req.body.password;

    AccountModel.findOne({
        username: username,
        password: password,
    })
        .then(account => {
            if (account) {
                return res.json("Đăng nhập thành công");
            } else {
                return res.status(300).json("Tài khoản hoặc mật khẩu không đúng")
            }
        })
        .catch(err => {
            res.status(500).json("SERVER_ERROR");
        })
})

// Sửa dữ liệu trong DB
router.put('/:id', (req, res) => {
    var id = req.params.id;
    var newPassword = req.body.newPassword;

    AccountModel.findByIdAndUpdate(id, {
        password: newPassword,
    })
        .then(data => {
            res.json('Update thành công');
        })
        .catch(err => {
            res.status(500).json("Update thất bại " + err);
        })
})

router.delete('/:id', (req, res) => {
    var id = req.params.id;

    AccountModel.deleteOne({
        _id: id
    })
        .then(data => {
            if (data && data.deletedCount !== 0) {
                return res.json('Xoá thành công');
            } else {
                return res.json('Xoá thất bại, không tìm thấy ID');
            }
        })
        .catch(err => {
            res.status(500).json("Xoá thất bại " + err);
        })
})

module.exports = router;