const mongoose = require("mongoose");


const studentSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId
    },
    studentId: {
        type: String,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        trim: true,
        lowercase: true
    },
    dob: {
        type: Date,
        trim: true,
        lowercase: true
    },
    email: {
        type:String,
        trim: true,
        required: true,
        lowercase: true
    },
    universityId: [mongoose.Types.ObjectId]

})


const studentModal = new mongoose.model("Student", studentSchema)

module.exports = studentModal;