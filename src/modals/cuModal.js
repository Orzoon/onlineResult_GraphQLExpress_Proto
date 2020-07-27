const mongoose = require("mongoose");

const cuSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId
    },
    uId: {
        type: String,
        trim: true,
        lowercase: true
    },
    passoword: {
        type: String,
        trim: true,
        min: 7
    },
    name: {
        type: String,
        trim: true,
        lowercase: true
    },
    regNo: {
        type: String,
        trim: true,
        lowercase: true
    },
    establishedDate: {
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
   phone : {
       type: Number
   },
   location: {
    type: String,
    trim: true,
    lowercase: true
   },
   courses: [{
       code: Number,
       name: {
           type: String,
           trim: true,
           lowercase: true
       }
   }],
   RefreshToken: [String]

})

const cuModal = new mongoose.model("Cu", cuSchema)

module.exports = cuModal;