const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        hash: { type: String, required: true },
        uuid: { type: String, required: false},
        isactive: { type: Boolean, default: false }
    },
    totalExpense: {
        type: Number,
        default: 0,
        min: 0
    },
    downloads: {
        files : [{
            date: { type: Date, default: Date.now, required: true },
            fileUrl: { type: String, required: true, trim: true }
        }]
    },
    order: {
        orderId: {type: String, required: false},
        status: { type: String, enum: ['SUCCESS', 'PENDING'], default: 'PENDING' }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);