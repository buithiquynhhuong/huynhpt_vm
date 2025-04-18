const mongoose = require('mongoose');
const e = require("express");
mongoose.connect('mongodb+srv://minhduc98toni:Phamminhduc98@user.wmy5i.mongodb.net/VanMinhGroup?retryWrites=true&w=majority&appName=User')
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    username: String,
    password: String,
    old: Number,
    key: String,
    courseID : {
        type: String,
        ref: 'course',
    },
    listCourse : {
        type: String,
        ref: 'course',
    }
}, {
    collection: 'account',
});

const CourseSchema = new Schema({
    courseName: String,
    courseNumber: Number,
    courseTeacher: {
        type: String,
        ref: 'account',
    },
    courseDate: Date,
}, {
    collection: 'course',
});

const AccountVanMinhSchema = new Schema({
    phone: String,
    password: String,
    name: String,
    officeID: [Schema.Types.Mixed],
    ruler: [Schema.Types.Mixed],
    avatar : String,
    dateOfBirth: Date,
    email: String,
    status: Boolean,
    position: String,
    tokenVersion: {
        type: Number,
        default: 0,
    },
}, {
    collection: 'accountVanMinh',
});

const DepartmantSchema = new Schema({
    code: String,
    label: String,
}, {
    collection: 'department',
});

const TeamSchema = new Schema({
    code: String,
    label: String,
    departmentID: {
        type: String,
        ref: 'department',
    },
}, {
    collection: 'team',
});

const OfficeSchema = new Schema({
    code: String,
    label: String,
    departmentID: {
        type: String,
        ref: 'department',
    },
    teamID: {
        type: String,
        ref: 'team',
    }
}, {
    collection: 'office',
});

const AssetTypeSchema = new Schema({
    label: String,
}, {
    collection: 'assetType',
});

const UnitSchema = new Schema({
    label: String,
}, {
    collection: 'unit',
});

const AssetSchema = new Schema({
    code: String,
    quantity: Number,
    unit: {
        type: String,
        ref: 'unit',
    },
    name: String,
    modelOrSeries: String,
    assetType: {
        type: String,
        ref: 'assetType',
    },
    dateOfPurchase: Date,
    warranty: Number,
    expirationDate: Date,
    price: Number,
    depreciation: String,
    supplier: String,
    addressNCC: String,
    phoneNCC: Number,
    assetLocation: {
        type: String,
        ref: 'office',
    },
    managementOffice: {
        type: String,
        ref: 'office',
    },
    description: String,
    seeMore: Object,

}, {
    collection: 'asset',
});

const CarSchema = new Schema({
    carType: String,
    bks: {
        type: String,
        unique: true
    },
    team: {
        type: String,
        ref: 'team',
    },
    yearOfManufacture: Date,
    registrationPeriod: Date,
    registrationName: String,
    valuation: Number,
    insurancePeriodTNDS: Date,
    insuranceSellerTNDS: String,
    insurancePeriodBHVC: Date,
    insuranceSellerBHVC: String,
    insurancePeriodGPS: Date,
    descriptionGPS: String,
    insurancePeriod4G: Date,
    insuranceSeller4G: String,
    description: String,
}, {
    collection: 'car',
});

const AssetTransferLogSchema = new Schema({
    assetId: {
        type: Schema.Types.ObjectId,
        ref: 'asset',
        required: true
    },
    fromOffice: {
        type: Schema.Types.ObjectId,
        ref: 'office',
        required: true
    },
    toOffice: {
        type: Schema.Types.ObjectId,
        ref: 'office',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    transferType: {
        type: String,
        enum: ['IMPORT', 'EXPORT'],
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
        default: 'COMPLETED'
    },
    transferDate: {
        type: Date,
        default: Date.now
    },
    note: String,
    transferBy: {
        type: Schema.Types.ObjectId,
        ref: 'accountVanMinh',
        required: true
    },
    reason: {
        type: String,
        enum: ['NEW_IMPORT', 'TRANSFER', 'RETURN', 'MAINTENANCE'],
        required: true
    }
}, {
    timestamps: true,
    collection: 'assetTransferLog'
});

const AssetInventorySchema = new Schema({
    assetId: {
        type: Schema.Types.ObjectId,
        ref: 'asset',
        required: true
    },
    officeId: {
        type: Schema.Types.ObjectId,
        ref: 'office',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'assetInventory'
});

const AccountModel = mongoose.model('account', AccountSchema);
// const CourseModel = mongoose.model('course', CourseSchema);
const DepartmantModel = mongoose.model('department', DepartmantSchema);
const TeamModel = mongoose.model('team', TeamSchema);
const OfficeModel = mongoose.model('office', OfficeSchema);
const AssetTypeModal = mongoose.model('assetType', AssetTypeSchema);
const UnitModal = mongoose.model('unit', UnitSchema);
const AssetModal = mongoose.model('asset', AssetSchema);
const CarModal = mongoose.model('car', CarSchema);
const AccountVanMinhModal = mongoose.model('accountVanMinh', AccountVanMinhSchema);
const AssetTransferLogModel = mongoose.model('assetTransferLog', AssetTransferLogSchema);
const AssetInventoryModel = mongoose.model('assetInventory', AssetInventorySchema);

// Find Hàm tìm kiếm ở bảng khác bằng populate
// AccountModel.find({})
//     // 1 lần populate
//     .populate('courseID')
//     // 2 lần populate (tìm đến cha, sau đó populate con)
//     .populate({
//         path: 'courseID',
//         populate: {path: 'courseTeacher'},
//     })
//     // populate đến cha và chấm đến con
//     .populate('listCourse.courseID')
//     .then(account => {
//         console.log("Tìm kiếm DB thành công " + account);
//     })
//     .catch(err => console.log("Lỗi " + err));

// Find Hàm tìm kiếm có điều kiện trong database
// AccountModel.find({
//     old : {$gt : 28 , $lt : 51} //Tìm kiếm phần tử có tuổi lớn hơn 28 và nhỏ hơn 51
// })
//     .then(account => {
//         console.log("Tìm kiếm DB thành công " + account);
//     })
//     .catch(err => console.log("Lỗi " + err));

//Find Hàm tìm kiếm trong database
// AccountModel.find({})
//     .then(account => {
//         console.log("account " + account);
//     })
//     .catch(err => console.log("Lỗi " + err));

// Create Thêm vào trong database
// AccountModel.create({
//     username: "ThemTuCode",
//     password: "ThemTuCodePass",
//     key: "DangONha"
// })
//     .then(account => {
//         console.log("account " + account);
//     })
//     .catch(err => console.log("Lỗi " + err));

// Update Cập nhật trong database
// AccountModel.updateOne({
//     // object cần sửa
//     username: "BuiThanHai",
// }, {
//     // thông tin mới để lưu vào object cần sửa
//     username: "BuiThanHai 130598",
// })
//     .then(account => {
//         console.log("account " + account);
//     })
//     .catch(err => console.log("Lỗi " + err));

// Delete Xoá trong database
// AccountModel.deleteOne({
//     // object cần Xoá
//     username: "BuiThanHai",
// })
//     .then(account => {
//         console.log("Xoá Thành Công " + account);
//     })
//     .catch(err => console.log("Xoá thất bại " + err));


module.exports = {
    AccountModel,
    DepartmantModel,
    TeamModel,
    OfficeModel,
    AssetTypeModal,
    UnitModal,
    AssetModal,
    CarModal,
    AccountVanMinhModal,
    AssetTransferLogModel,
    AssetInventoryModel
}
