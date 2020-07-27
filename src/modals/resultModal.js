const mongoose = require("mongoose");


const resultSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId
    },
    studentId: {
        type: String,
        trim: true,
        lowercase: true
    },
    grades: {
        studentId: {
            type: String,
            trim: true,
            lowercase: true
        },
        courseCode: {
            type: Number
        },
        teacherID: {
            type: mongoose.Types.ObjectId
        },
        year: {
            type: Date
        },
        term: {
            type: String
        },
        semester: {
            type: String
        }
    }

})


const resultModal = new mongoose.model("Result", resultSchema)

module.exports = resultModal;