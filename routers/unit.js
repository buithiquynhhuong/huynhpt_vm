const express = require("express");
var router = express.Router();
const {UnitModal} = require('../models/connectDB');

router.get('/', (req, res) => {
    UnitModal.find({})
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

    UnitModal.findOne({
        label: label,
    })
        .then(data => {
            if (data) {
                return res.status(300).json('Đơn vị đã tồn tại');
            } else {
                UnitModal.create({
                    label: label,
                })
                    .then(data => {
                        res.json('Tạo đơn vị thành công');
                    })
            }
        })
        .catch(err => {
            res.status(500).json("Tạo đơn vị thất bại, server lỗi " + err);
        })
})


module.exports = router;