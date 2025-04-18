const express = require("express");
var router = express.Router();
const {OfficeModel} = require('../models/connectDB');

router.get('/', (req, res) => {
    OfficeModel.find({})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).json("Lỗi " + err);
        });
})

router.get('/:id', (req, res) => {
    var id = req.params.id;
    OfficeModel.find({departmentID: id})
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
    var teamID = req.body.teamID;

    OfficeModel.findOne({
        label: label,
    })
        .then(data => {
            if (data) {
                return res.status(300).json('Văn phòng đã tồn tại');
            } else {
                OfficeModel.create({
                    code: code,
                    label: label,
                    departmentID: departmentID,
                    teamID: teamID,
                })
                    .then(data => {
                        res.json('Tạo văn phòng thành công');
                    })
            }
        })
        .catch(err => {
            res.status(500).json("Tạo văn phòng thất bại, server lỗi " + err);
        })
})


module.exports = router;