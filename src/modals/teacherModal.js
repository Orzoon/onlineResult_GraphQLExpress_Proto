const mongoose = require("mongoose");



const teacherSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId
    },
    email: {
        type: String,
        trim: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true,
        lowercase: true
    },
    phone: {
        type: Number,
    },
    universityId: [mongoose.Types.ObjectId],
    tokens: {
        refresh: [String] ,
        access: [String]
    }
}, {timestamps: true})

const teacherModal = new mongoose.model("Teacher", teacherSchema)

module.exports = teacherModal;