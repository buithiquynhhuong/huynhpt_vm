const express = require("express");
var router = express.Router();
const {AssetModal} = require('../models/connectDB');
const mongoose = require('mongoose');
const multer = require("multer");
const XLSX = require("xlsx");
const authenticateToken = require("../middleware/authMiddleware");

router.get('/', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query conditions
        const query = {};
        
        // Add filters if provided
        if (req.query.code) query.code = new RegExp(req.query.code, 'i');
        if (req.query.name) query.name = new RegExp(req.query.name, 'i');
        if (req.query.managementOffice) query.managementOffice = req.query.managementOffice;

        console.log('Query conditions:', query);

        const [total, data] = await Promise.all([
            AssetModal.countDocuments(query),
            AssetModal.find(query)
                .populate('managementOffice', 'label code')
                .populate('assetLocation', 'label code')
                .populate('unit', 'label code')
                .populate('assetType', 'label code')
                .sort({ lastUpdated: -1 })
                .skip(skip)
                .limit(limit)
        ]);

        console.log('Found assets:', data.length);
        console.log('Sample asset data:', JSON.stringify(data[0], null, 2));
        console.log('All assets:', data.map(asset => ({
            code: asset.code,
            name: asset.name,
            managementOffice: asset.managementOffice?.label || 'N/A'
        })));

        res.json({
            total,
            data,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).json({ message: "Lỗi khi lấy dữ liệu tài sản: " + error.message });
    }
})

router.get('/total-asset', authenticateToken, async (req, res) => {
    // Đếm tổng số xe theo từng team
    const officeCounts = await AssetModal.aggregate([
        {
            $group: {
                _id: "$managementOffice",
                totalAsset: {$sum: 1}
            }
        }
    ]);
    AssetModal.find({})
        .then(data => {
            res.send({officeCounts});
        })
        .catch(err => {
            res.status(500).json("Lỗi " + err);
        });
})

router.get('/:id', authenticateToken, (req, res) => {
    var id = req.params.id;

    AssetModal.find({_id: id})
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).json("Lỗi " + err);
        });
})

// thêm data vào db
router.post('/', authenticateToken, (req, res) => {
    var code = req.body.code;
    var quantity = req.body.quantity;
    var unit = req.body.unit;
    var name = req.body.name;
    var modelOrSeries = req.body.modelOrSeries;
    var assetType = req.body.assetType;
    var dateOfPurchase = req.body.dateOfPurchase;
    var warranty = req.body.warranty;
    var expirationDate = req.body.expirationDate;
    var price = req.body.price;
    var depreciation = req.body.depreciation;
    var supplier = req.body.supplier;
    var addressNCC = req.body.addressNCC;
    var phoneNCC = req.body.phoneNCC;
    var assetLocation = req.body.assetLocation;
    var managementOffice = req.body.managementOffice;
    var description = req.body.description;
    var seeMore = req.body.seeMore;

    AssetModal.findOne({
        code: code,
    })
        .then(data => {
            if (data) {
                return res.status(300).json('Mã tài sản đã tồn tại');
            } else {
                AssetModal.create({
                    code: code,
                    quantity: quantity,
                    unit: unit,
                    name: name,
                    modelOrSeries: modelOrSeries,
                    assetType: assetType,
                    dateOfPurchase: dateOfPurchase,
                    warranty: warranty,
                    expirationDate: expirationDate,
                    price: price,
                    depreciation: depreciation,
                    supplier: supplier,
                    addressNCC: addressNCC,
                    phoneNCC: phoneNCC,
                    assetLocation: assetLocation,
                    managementOffice: managementOffice,
                    description: description,
                    seeMore: seeMore,
                })
                    .then(data => {
                        return res.json({ message: `Tạo mới tài sản thành công` });
                    })
            }
        })
        .catch(err => {
            res.status(500).json("Tạo tài sản thất bại, server lỗi " + err);
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
    const assets = jsonData.map((row) => ({
        code: row.code,
        quantity: row.quantity,
        unit: row.unit,
        name: row.name,
        modelOrSeries: row.modelOrSeries,
        assetType: row.assetType,
        dateOfPurchase: row.dateOfPurchase,
        warranty: row.warranty,
        expirationDate: row.expirationDate,
        price: row.price,
        depreciation: row.depreciation,
        supplier: row.supplier,
        addressNCC: row.addressNCC,
        phoneNCC: row.phoneNCC,
        assetLocation: row.assetLocation,
        managementOffice: row.managementOffice,
        description: row.description,
        seeMore: row.seeMore,
    }));

    try {
        let insertedCount = 0;
        let skippedCount = 0;

        for (const asset of assets) {
            const existingAsset = await AssetModal.findOne({code: asset.code});

            if (!existingAsset) {
                await AssetModal.create(asset);
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

router.delete('/', authenticateToken, async(req, res) => {
    try {
        const ids  = req.body.ids; // Lấy danh sách ID từ request body

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Danh sách ID không hợp lệ" });
        }

        // Chuyển đổi ID thành ObjectId (nếu cần)
        const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));

        const result = await AssetModal.deleteMany({ _id: { $in: objectIds } });

        if (result.deletedCount > 0) {
            return res.json({ message: `Đã xoá ${result.deletedCount} tài sản thành công.` });
        } else {
            return res.status(404).json({ message: "Không tìm thấy tài sản nào để xoá." });
        }
    } catch (error) {
        console.error("Lỗi khi xoá:", error);
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
})


module.exports = router;