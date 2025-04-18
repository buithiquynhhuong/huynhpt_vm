const express = require("express");
var router = express.Router();
const {DepartmantModel, AccountModel} = require('../models/connectDB');

router.get('/', (req, res) => {
    DepartmantModel.find({})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).json("Lỗi " + err);
        });
})

// thêm data vào db
router.post('/', (req, res) => {
    var code = req.body.code;
    var label = req.body.label;

    DepartmantModel.findOne({
        label: label,
    })
        .then(data => {
            if (data) {
                return res.status(300).json('Khu vực đã tồn tại');
            } else {
                DepartmantModel.create({
                    code: code,
                    label: label,
                })
                    .then(data => {
                        res.json('Tạo khu vực thành công');
                    })
            }
        })
        .catch(err => {
            res.status(500).json("Tạo khu vực thất bại, server lỗi " + err);
        })
})


module.exports = router;