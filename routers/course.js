const express = require("express");
var router = express.Router();
const {AccountModel, CourseModel} = require('../models/connectDB');

router.post('/', (req, res) => {
    var courseName = req.body.courseName;
    var courseNumber = req.body.courseNumber;
    var courseTeacher = req.body.courseTeacher;
    var courseDate = req.body.courseDate;

    CourseModel.create({
        courseName: courseName,
        courseNumber: courseNumber,
        courseTeacher: courseTeacher,
        courseDate: courseDate,
    })
        .then(data => {
            res.send('Tạo khoá học thành công');
        })
        .catch(err => {
            res.status(500).send("Tạo khoá học thất bại " + err);
        })
})

module.exports = router;