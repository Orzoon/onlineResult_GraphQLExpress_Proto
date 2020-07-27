const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");



const mainResolver = {
    // interfaces

    NODE: {
        __resolveType(parent){
            if(parent.UID){
                return "University"
            }
            else if(parent.universityId){
                return "Teacher"
            }
            else {
                return null
            }
        }
    },
    UniversityInterface: {
        __resolveType(parent){
            if(parent.UID){
                return "University"
            } else return null
        }
    },
    TeacherInterface: {
        __resolveType(parent){
            if(parent.universityId){
                return "Teacher"
            }
        }
    },
    // unions
    registerUniversityOrError:{
        __resolveType(obj){
            if(obj.errorMessage || obj.errorMessages) return "Error"
            return "createUniversity"
        }
    },
    registerTeacherOrError: {
        __resolveType(obj){
            if(obj.errorMessage || obj.errorMessages) return "Error"
            return "teacher"
        }
    },
    registerStudentoOrError: {
        __resolveType(obj){
            if(obj.errorMessage || obj.errorMessages) return "Error"
            return "student"
        }
    },
    updateUniversityOrError: {
        __resolveType(obj) {
            if(obj.errorMessage || obj.errorMessages) return "Error"
            return "University"
        }
    },
    Query: {
        universitiesInfo: async(_, {_universityId, limit, skip}, {modals:{cuModal}}) => {
            // check for auth and userType later on
            try{
                // search when id is provided
                if(_universityId){
                    const uniResult = await cuModal.findOne({_id: mongoose.Types.ObjectId(_universityId)})
                    if(unireResult){
                        return {
                            universities: uniResult,
                            pageInfo: {
                                hasNextPage: false
                            }
                        };
                    }
                }
                // normal search
                const uniResult = await cuModal.aggregate([
                    {$match: {}},
                    {$limit: limit+1 || 10},
                    {$skip: skip || 0},
                    {$sort: -1}
                ])
                return {
                    pageInfo: {
                        hasNextPage: uniResult.length > limit ? true: false
                    },
                    universities: uniResult.length > limit ? uniResult.pop() : uniResult, 
                }
            }
            catch(error){
             console.log("error", error)
            }
        },
        teachers: async(_, {_teacherId, limit, skip}, {modal:{teacherModal}}) => {
            // check for auth and userType later on
            try{
                // search when id is provided
                if(_teacherId){
                    const teacherResult = await teacherModal.findOne({_id: mongoose.Types.ObjectId(_teacherId)})
                    if(teacherResult){
                        return teacherResult
                    }
                }
                // normal search
                const teacherResult = await cuModal.aggregate([
                    {$match: {}},
                    {$limit: limit || 10},
                    {$skip: skip || 0},
                    {$sort: -1}
                ])
                return teacherResult
            }
            catch(error){
                
            }
        },
        students: async(_, { _universityId,_studentId, limit, skip}, {modal:{studentModal}}) => {
            try{
                // validation check
                if(_studentId){
                    const studentResult = await studentModal.find({_studentId: mongoose.Types.ObjectId(_studentId), "universityId": mongoose.Types.ObjectId(_universityId)});
                    if(studentResult){
                        return studentResult
                    }
                }

                
                const studentsResult = await studentModal.aggregate([
                    {$match: {"universityId": mongoose.Types.ObjectId(_universityId)}},
                    {$limit: limit || 10},
                    {$skip: skip || 0},
                    {$sort: -1}
                ])

                return studentsResult

            }catch(error){

            }
        },
        results: async(_, {_studentId}, {modals:{resultModal}}) => {
            try{
                const results = await resultModal.find({studentId: _studentId})
                return results
            }catch(error){
                return error
            }
        }
    },

    Mutation: {

        // register resolvers
        registerUniversity: async (_, {input}, {modals:{cuModal}}) => {
            const {
                UID, 
                name, 
                regNo, 
                establishedDate, 
                email, 
                phone, 
                location,
                password
            } = input;

            try {

                /*
                    ========VALIDATION ERROR
                    to be done at FRONT-END FOR NOW
                */

                /* hashing password */

                const hashedPassword = await bcrypt.hash(password, 10);
                // check for UID
                const UIDExists = await cuModal.find({uId: UID}).countDocument();
                if(UIDExists > 0){
                    throw({errorMessage: "University already exists"})
                }
                const newUni = await cuModal.Create({
                    _id: mongoose.Types.ObjectId(), 
                    ... input, 
                    uId: UID, 
                    courses: [],
                    password: hashedPassword
                })
                // changing to object
                newUni.toObject();
                delete newUni.password;
                return newUni
            }catch(error){
                return error
            }
        },
        registerTeacher: async(_,{input}, {modals:{teacherModal}}) => {
            /* additional validation and checking to be done --Later*/
            const {name, email, phone, password, universityId} =input;

            try{
            
            /* PRE-EXISTENCE OF A TEACHER */
            const teacherExists = await teacherModal.find({email});
            if(teacherExists){
                let errorMessage = "Teacher already exists"
                // return typedef Error
                return {
                    errorMessage,
                    errorMessages: null
                }
            }

            /* GTG */
            const hashedPassword = await bcrypt.hash(password, 10);

            const teacher = await teacherModal.create({
                _id: mongoose.Types.ObjectId,
                ...input,
                password: hashedPassword,
            }) 

            // token and refesh token generation
            const accessToken = await jwt.sign({
                                _id: teacher._id, userType: "TEACHER"},
                                process.env.TOKENSECRET,
                                {expiresIn: "15m"})
            const refreshToken = await jwt.sign({
                                _id: teacher._id, userType: "TEACHER"},
                                process.env.TOKENSECRET,
                                {expiresIn: "7d"})

            const tokens = {
                refresh: [refreshToken],
                access: [accessToken]
            }

            const updatedTeacher = await teacherModal.findOneAndUpdate({
                                _id: mongoose.Types.ObjectId(teacher._id)}, 
                                {tokens}
                                )
            updatedTeacher.toObject();

            delete updatedTeacher.password;
            
            /* returning the created teacher */
            return {
                updatedTeacher
            }

            }catch(error){
                return error
            }
        },
        registerStudent: async(_,{input}, {modals:{studentModal}}) => {

            const {
                studentID,
                name, 
                email,
                universityId,
                DOB
            } = input;

            try{
                /* NOTE */
                /* Validation check */
                
                //--> Unique std
                const stdCount = await studentModal.find({$and: [{email}, {"universityId": universityId}]}).countDocuments();
                if(stdCount > 0){
                    return {
                        errorMessage: "Student already exists",
                        errorMessages: null
                    }
                }

                const newStudent = await studentModal.create({
                    ...input,
                    dob: DOB
                })

                return newStudent

            }catch(error){
                return error;
            }
        },
        // update Resolvers
        updateUniversity: async(_,{input},{modals: {cuModal}}) => {
            // check out for misssing fields and validation
            /* fields Check */
            const allowedFields = ["_id", "UID", "name", "regNo", "establishedDate", "email", "phone", "location", "courses"];
            const receivedFields = Object.keys(input);
            const fieldsAllowed = receivedFields.every(field => allowedFields.includes(field));

            if(!fieldsAllowed){
                return {
                    errorMessage: "invalid fields Detected",
                    errorMessages: null
                }
            }


            // validation check
           


            let errorMessages = [];



            return{
                _id: "sfsfsfsfs",
                createdAt: "fsfsfsfs",
                updatedAt:"fsfsfsfs",
                UID: "fsfsfsfsf3353",
                name: "Universiyt",
                regNo: 1314141,
                establishedDate: "fsfsfs",
                email: "fsfsfsfsfs",
                phone: 131414,
                location: "fsfsfsfsfs",
                courses: [{code:"tets", name: "testname"}]
            }
        }

    }
}

module.exports = mainResolver;