const express = require("express");
var router = express.Router();
const {CarModal} = require('../models/connectDB');
const mongoose = require("mongoose");
const multer = require("multer");
const XLSX = require("xlsx");
const cors = require("cors");
const authenticateToken = require("../middleware/authMiddleware");

router.get('/', async (req, res) => {
    var page = parseInt(req.query.page) || 1;
    var limit = parseInt(req.query.limit) || 20;
    var total = await CarModal.countDocuments();

    CarModal.find({})
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('team')
        .then(data => {
            res.send({total, data});
        })
        .catch(err => {
            res.status(500).json("Lỗi " + err);
        });
})

router.get('/total-car', authenticateToken, async (req, res) => {
    // Đếm tổng số xe theo từng team
    const teamCounts = await CarModal.aggregate([
        {
            $group: {
                _id: "$team",
                totalCars: {$sum: 1}
            }
        }
    ]);
    CarModal.find({})
        .then(data => {
            res.send({teamCounts});
        })
        .catch(err => {
            res.status(500).json("Lỗi " + err);
        });
})

// thêm data vào db
router.post('/', authenticateToken,  (req, res) => {
    var carType = req.body.carType;
    var bks = req.body.bks;
    var team = req.body.team;
    var yearOfManufacture = req.body.yearOfManufacture;
    var registrationPeriod = req.body.registrationPeriod;
    var registrationName = req.body.registrationName;
    var valuation = req.body.valuation;
    var insurancePeriodTNDS = req.body.insurancePeriodTNDS;
    var insuranceSellerTNDS = req.body.insuranceSellerTNDS;
    var insurancePeriodBHVC = req.body.insurancePeriodBHVC;
    var insuranceSellerBHVC = req.body.insuranceSellerBHVC;
    var insurancePeriodGPS = req.body.insurancePeriodGPS;
    var descriptionGPS = req.body.descriptionGPS;
    var insurancePeriod4G = req.body.insurancePeriod4G;
    var insuranceSeller4G = req.body.insuranceSeller4G;
    var description = req.body.description;

    CarModal.findOne({
        bks: bks,
    })
        .then(data => {
            if (data) {
                return res.status(300).json('Xe đã tồn tại');
            } else {
                CarModal.create({
                    carType: carType,
                    bks: bks,
                    team: team,
                    yearOfManufacture: yearOfManufacture,
                    registrationPeriod: registrationPeriod,
                    registrationName: registrationName,
                    valuation: valuation,
                    insurancePeriodTNDS: insurancePeriodTNDS,
                    insuranceSellerTNDS: insuranceSellerTNDS,
                    insurancePeriodBHVC: insurancePeriodBHVC,
                    insuranceSellerBHVC: insuranceSellerBHVC,
                    insurancePeriodGPS: insurancePeriodGPS,
                    descriptionGPS: descriptionGPS,
                    insurancePeriod4G: insurancePeriod4G,
                    insuranceSeller4G: insuranceSeller4G,
                    description: description,
                })
                    .then(data => {
                        res.json({message: 'Tạo thông tin xe thành công'});
                    })
            }
        })
        .catch(err => {
            res.status(500).json("Tạo xe thất bại, server lỗi " + err);
        })
})

// Cấu hình Multer để lưu file tạm
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

router.post('/upload', authenticateToken, upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded.");

    // Đọc file Excel từ buffer
    const workbook = XLSX.read(req.file.buffer, {type: "buffer"});
    const sheetName = workbook.SheetNames[0];
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Chuyển đổi dữ liệu & lưu vào MongoDB
    const cars = jsonData.map((row) => ({
        carType: row.carType,
        bks: row.bks,
        team: row.team,
        yearOfManufacture: row.yearOfManufacture,
        registrationPeriod: row.registrationPeriod,
        registrationName: row.registrationName,
        valuation: row.valuation,
        insurancePeriodTNDS: row.insurancePeriodTNDS,
        insuranceSellerTNDS: row.insuranceSellerTNDS,
        insurancePeriodBHVC: row.insurancePeriodBHVC,
        insuranceSellerBHVC: row.insuranceSellerBHVC,
        insurancePeriodGPS: row.insurancePeriodGPS,
        descriptionGPS: row.descriptionGPS,
        insurancePeriod4G: row.insurancePeriod4G,
        insuranceSeller4G: row.insuranceSeller4G,
        description: row.description,
    }));

    try {
        let insertedCount = 0;
        let skippedCount = 0;

        for (const car of cars) {
            const existingCar = await CarModal.findOne({bks: car.bks});

            if (!existingCar) {
                await CarModal.create(car);
                insertedCount++;
            } else {
                skippedCount++;
            }
        }
        // await CarModal.insertMany(cars); // Thêm không check
        res.json({message: `Thêm thành công ${insertedCount} bản ghi, bỏ qua ${skippedCount} bản ghi đã tồn tại.`});
    } catch (error) {
        res.status(500).json({message: "Lỗi khi lưu vào database", error});
    }
})

// xoá dữ liệu vào db
router.delete('/', authenticateToken, async (req, res) => {
    try {
        const ids = req.body.ids;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({message: "Danh sách ID không hợp lệ"});
        }
        const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
        const result = await CarModal.deleteMany({_id: {$in: objectIds}});
        if (result.deletedCount > 0) {
            return res.json({message: `Đã xoá ${result.deletedCount} thông tin xe thành công.`});
        } else {
            return res.status(404).json({message: "Không tìm thấy thông tin xe nào để xoá."});
        }
    } catch (error) {
        console.error("Lỗi khi xoá:", error);
        res.status(500).json({message: "Lỗi server: " + error.message});
    }
})


module.exports = router;