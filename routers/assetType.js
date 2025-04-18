const express = require("express");
var router = express.Router();
const {AssetTypeModal} = require('../models/connectDB');

router.get('/', (req, res) => {
    AssetTypeModal.find({})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).json("Lỗi " + err);
        });
})

// thêm data vào db
router.post('/', (req, res) => {
    var label = req.body.label;

    AssetTypeModal.findOne({
        label: label,
    })
        .then(data => {
            if (data) {
                return res.status(300).json('Loại tài sản đã tồn tại');
            } else {
                AssetTypeModal.create({
                    label: label,
                })
                    .then(data => {
                        res.json('Tạo loại tài sản thành công');
                    })
            }
        })
        .catch(err => {
            res.status(500).json("Tạo loại tài sản thất bại, server lỗi " + err);
        })
})


module.exports = router;