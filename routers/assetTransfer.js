const express = require('express');
const router = express.Router();
const { AssetModal, AssetTransferLogModel, AssetInventoryModel, OfficeModel } = require('../models/connectDB');
const authenticateToken = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Lấy lịch sử xuất nhập kho
router.get('/logs', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const transferType = req.query.transferType; // IMPORT hoặc EXPORT
        const status = req.query.status; // PENDING, COMPLETED, CANCELLED

        let query = {};
        if (transferType) {
            query.transferType = transferType;
        }
        if (status) {
            query.status = status;
        }

        const [total, logs] = await Promise.all([
            AssetTransferLogModel.countDocuments(query),
            AssetTransferLogModel.find(query)
                .populate('assetId', 'name code')
                .populate('fromOffice', 'label code')
                .populate('toOffice', 'label code')
                .populate('transferBy', 'name')
                .sort({ transferDate: -1 })
                .skip(skip)
                .limit(limit)
        ]);

        res.json({
            total,
            logs: logs.map(log => ({
                ...log.toObject(),
                transferTypeText: log.transferType === 'IMPORT' ? 'Nhập kho' : 'Xuất kho',
                statusText: log.status === 'PENDING' ? 'Đang xử lý' : 
                           log.status === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy',
                reasonText: log.reason === 'NEW_IMPORT' ? 'Nhập mới' :
                          log.reason === 'TRANSFER' ? 'Điều chuyển' :
                          log.reason === 'RETURN' ? 'Trả về' : 'Bảo trì'
            })),
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy lịch sử xuất nhập kho: " + error.message });
    }
});

// Nhập kho
router.post('/import', authenticateToken, async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        const { assetId, quantity, note, reason = 'NEW_IMPORT', fromOfficeId, toOfficeId } = req.body;
        const userId = req.user._id;
        const parsedQuantity = parseInt(quantity);

        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            throw new Error("Số lượng không hợp lệ");
        }

        await session.withTransaction(async () => {
            // Kiểm tra tài sản tồn tại
            const asset = await AssetModal.findById(assetId).session(session);
            if (!asset) {
                throw new Error("Không tìm thấy tài sản");
            }

            // Lấy thông tin văn phòng quản lý
            const office = await OfficeModel.findById(toOfficeId).session(session);
            if (!office) {
                throw new Error("Không tìm thấy thông tin văn phòng");
            }

            // const inventoryUpdate = await AssetInventoryModel.findOneAndUpdate(
            //     { 
            //         assetId: assetId,
            //         officeId: office._id
            //     },
            //     {
            //         $inc: { quantity: parsedQuantity },
            //         $set: { lastUpdated: new Date() }
            //     },
            //     { 
            //         session,
            //         new: true,
            //         upsert: true
            //     }
            // );

            // Cập nhật số lượng trong asset
            await AssetModal.findByIdAndUpdate(
                assetId,
                { $inc: { quantity: parsedQuantity } },
                { session }
            );

            // Tạo log nhập kho
            const transferLog = new AssetTransferLogModel({
                assetId: assetId,
                fromOffice: office._id,
                toOffice: office._id,
                quantity: parsedQuantity,
                transferType: 'IMPORT',
                status: 'COMPLETED',
                note: note,
                transferBy: userId,
                reason: reason
            });

            await transferLog.save({ session });
        });

        res.json({ message: "Nhập kho thành công" });

    } catch (error) {
        console.error('Lỗi khi nhập kho:', error);
        res.status(500).json({ message: "Lỗi khi nhập kho: " + error.message });
    } finally {
        await session.endSession();
    }
});

//
// const normalizeAssetData = (sourceData, toOfficeId, quantity) => {
//     return {
//         code: sourceData.code || '',
//         quantity: parseInt(quantity) || 0,
//         unit: sourceData.unit?._id || sourceData.unit || '',
//         name: sourceData.name || '',
//         modelOrSeries: sourceData.modelOrSeries || '',
//         assetType: sourceData.assetType?._id || sourceData.assetType || '',
//         dateOfPurchase: sourceData.dateOfPurchase || null,
//         warranty: parseInt(sourceData.warranty) || 0,
//         expirationDate: sourceData.expirationDate || null,
//         price: parseFloat(sourceData.price) || 0,
//         depreciation: sourceData.depreciation || '',
//         supplier: sourceData.supplier || '',
//         addressNCC: sourceData.addressNCC || '',
//         phoneNCC: sourceData.phoneNCC || '',
//         assetLocation: toOfficeId || '',
//         managementOffice: toOfficeId || '',
//         description: sourceData.description || '',
//         seeMore: sourceData.seeMore || {},
//         lastUpdated: new Date()
//     };
// };

// Xuất kho
router.post('/export', authenticateToken, async (req, res) => {
    let session;
    try {
        session = await mongoose.startSession();
        const { assetId, fromOfficeId, toOfficeId, quantity, note, reason = 'TRANSFER', userId, sourceAsset } = req.body;
        const parsedQuantity = parseInt(quantity);
        
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            throw new Error("Số lượng không hợp lệ");
        }

        await session.withTransaction(async () => {

            const sourceAssetDoc = await AssetModal.findById(assetId).session(session);
            if (!sourceAssetDoc) {
                throw new Error("Không tìm thấy thông tin tài sản nguồn");
            }

            if (sourceAssetDoc.managementOffice.toString() !== fromOfficeId) {
                throw new Error("Chỉ có thể xuất kho từ văn phòng quản lý tài sản");
            }

            if (sourceAssetDoc.quantity < parsedQuantity) {
                throw new Error(`Số lượng tài sản không đủ (hiện có: ${sourceAssetDoc.quantity}, cần xuất: ${parsedQuantity})`);
            }

            await AssetModal.findByIdAndUpdate(
                assetId,
                { $inc: { quantity: -parsedQuantity } },
                { session }
            );
            
            const existingOfficeAssets = await AssetModal.find({
                managementOffice: toOfficeId
            }).session(session);

            let destinationAssetId;

            if (existingOfficeAssets.length > 0) {
                
                const existingAsset = existingOfficeAssets.find(asset => asset.code === sourceAsset.code);

                if (existingAsset) {

                    const updatedAsset = await AssetModal.findByIdAndUpdate(
                        existingAsset._id,
                        {
                            $inc: { quantity: parsedQuantity },
                            $set: { lastUpdated: new Date() }
                        },
                        { session, new: true }
                    );
                    destinationAssetId = updatedAsset._id;

                } else {
                    const newAssetData = {
                        ...sourceAsset,
                        quantity: parsedQuantity,
                        managementOffice: toOfficeId,
                        assetLocation: toOfficeId,
                        lastUpdated: new Date()
                    };

                    const newAsset = await AssetModal.create([newAssetData], { session });
                    
                    // Kiểm tra xem tài sản đã được tạo thành công chưa
                    const checkAsset = await AssetModal.findById(newAsset[0]._id).session(session);
                    
                    destinationAssetId = newAsset[0]._id;
                }
            } else {
                const newAssetData = {
                    ...sourceAsset,
                    quantity: parsedQuantity,
                    managementOffice: toOfficeId,
                    assetLocation: toOfficeId,
                    lastUpdated: new Date()
                };

                const newAsset = await AssetModal.create([newAssetData], { session });

                const checkAsset = await AssetModal.findById(newAsset[0]._id).session(session);
                console.log('Kiểm tra tài sản sau khi tạo:', checkAsset);
                
                destinationAssetId = newAsset[0]._id;
            }


            await Promise.all([
                // Cập nhật inventory văn phòng nguồn
                AssetInventoryModel.findOneAndUpdate(
                    { 
                        assetId: assetId,
                        officeId: fromOfficeId
                    },
                    {
                        $inc: { quantity: -parsedQuantity },
                        $set: { lastUpdated: new Date() }
                    },
                    { 
                        session,
                        new: true,
                        upsert: true
                    }
                ),
                // Cập nhật inventory văn phòng đích
                AssetInventoryModel.findOneAndUpdate(
                    { 
                        assetId: destinationAssetId,
                        officeId: toOfficeId
                    },
                    {
                        $inc: { quantity: parsedQuantity },
                        $set: { lastUpdated: new Date() }
                    },
                    { 
                        session,
                        new: true,
                        upsert: true
                    }
                )
            ]);

            // logs export
            const transferLog = new AssetTransferLogModel({
                assetId: assetId,
                fromOffice: fromOfficeId,
                toOffice: toOfficeId,
                quantity: parsedQuantity,
                transferType: 'EXPORT',
                status: 'COMPLETED',
                note: note,
                transferBy: userId,
                reason: reason
            });

            await transferLog.save({ session });

        });

        // check commit final
        const finalCheck = await AssetModal.findOne({
            code: sourceAsset.code,
            managementOffice: toOfficeId
        });
        console.log('Kiểm tra cuối cùng sau khi commit:', finalCheck);

        res.json({ 
            message: "Xuất kho thành công",
            status: "success"
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Lỗi khi xuất kho: " + error.message,
            status: "error"
        });
    } finally {
        if (session) {
            await session.endSession();
        }
    }
});

// Lấy số lượng tồn kho theo văn phòng
router.get('/inventory/:assetId', authenticateToken, async (req, res) => {
    try {
        const { assetId } = req.params;
        
        const inventory = await AssetInventoryModel.find({ assetId })
            .populate('officeId', 'label code')
            .select('quantity lastUpdated');

        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy thông tin tồn kho: " + error.message });
    }
});

// Xóa nhiều logs
router.delete('/logs', authenticateToken, async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Danh sách ID không hợp lệ" });
        }

        // convert string IDs to ObjectId
        const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));

        const result = await AssetTransferLogModel.deleteMany({ _id: { $in: objectIds } });

        if (result.deletedCount > 0) {
            return res.json({ message: `Đã xóa ${result.deletedCount} bản ghi thành công` });
        } else {
            return res.status(404).json({ message: "Không tìm thấy bản ghi nào để xóa" });
        }
    } catch (error) {
        console.error("Lỗi khi xóa logs:", error);
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
});

module.exports = router; 