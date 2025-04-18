const express = require("express");
var router = express.Router();
const {TeamModel} = require('../models/connectDB');

router.get('/', (req, res) => {
    TeamModel.find({})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).json("Lỗi " + err);
        });
})

router.get('/:id', (req, res) => {
    var id = req.params.id;
    TeamModel.find({ departmentID: id })
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
    var departmentID = req.body.departmentID;

    TeamModel.findOne({
        label: label,
    })
        .then(data => {
            if (data) {
                return res.status(300).json('Bộ phận đã tồn tại');
            } else {
                TeamModel.create({
                    code: code,
                    label: label,
                    departmentID: departmentID,
                })
                    .then(data => {
                        res.json('Tạo bộ phận thành công');
                    })
            }
        })
        .catch(err => {
            res.status(500).json("Tạo bộ phận thất bại, server lỗi " + err);
        })
})


module.exports = router;