const {gql} = require("apollo-server-express")

const mainTypeDef = gql`
    ## 
    ##  ROOT  
    ##

    type Query {
        #public fields
        universitiesInfo(
            _universityId: String, 
            limit: Int, 
            skip: Int):ReturnUniversityandPageInfo

        # private fields
        teachers(
            _teacherId: String, 
            limit: Int, 
            skip: Int): [Teacher]!

        students(
            _universityId: String!,
            _studentId: String,  
            limit: Int, 
            skip: Int): [Student]!

        #private
        results(_studentId: String!): [Result]
    }

  
   ##
   ## INTERFACES
   ##
   interface NODE {
       _id: ID!,
       createdAt: String!,
       updatedAt: String!
   }
   interface UniversityInterface{
        UID: ID!,
        name: String!,
        regNo: Int!,
        establishedDate: String!,
        email: String!,
        phone: Int!,
        location: String!,
        courses: [Course]
   }

   interface TeacherInterface{
         _id: ID!,
        name: String!,
        email: String!,
        phone: Int!,
        universityId: [String!]!
   }


    ## 
    ##  MISC_MINI  
    ##

    ##
    type Tokens{
        refresh: [String!]
        access: [String!]
    }

    ## Main return types
    type ReturnUniversityandPageInfo{
        universities: [University],
        pageInfo: PageInfo
    }

    # pageInfo
    type PageInfo{
        hasNextPage: Boolean!
    }
    # ERROR
    type Error {
        errorMessage: String, 
        errorMessages: [errorMessage]
    }
    #nested Errors for forms
    type errorMessage{
        field: String!,
        errorMessage: String!
    }


    ##
    ##  MAIN_RETURN_TYPES 
    ##

    # university
    type University implements UniversityInterface & NODE{
        _id: ID!,
        createdAt: String!,
        updatedAt: String!
        UID: ID!,
        name: String!,
        regNo: Int!,
        establishedDate: String!,
        email: String!,
        phone: Int!,
        location: String!,
        courses: [Course]!
    }
    type Course {
        code: String!
        name: String!
    }

    ##Teacher
    type Teacher implements TeacherInterface & NODE{
        _id: ID!,
        createdAt: String!,
        updatedAt: String!,
        name: String!,
        email: String!,
        phone: Int!,
        universityId: [String!]!
    }

    # result- grades
    type Result {
        studentID: ID!,
        grades: [Grade]
    }
    type Grade {
        courseCode: ID!,
        teacher: Teacher,
        # later to date type
        year: String!,
        termSemester: String!,
        mark: Int!
    }


    # Student
    type Student {
        _id: ID!,
        studentID: ID!
        name: String!,
        DOB: String!,
        email: String!,
        universityIDS: [ID!]!
    }

    ##
    ##  INPUT--MUTATION
    ##

    # inputs
    input UniversityInput {
        UID: ID!,
        name: String!,
        regNo: Int!,
        establishedDate: String!,
        email: String!,
        phone: Int!,
        location: String!,
        password: String!
    }

    input UniversityInputUpdate {
        name: String,
        regNo: Int,
        establishedDate: String,
        email: String,
        phone: Int,
        location: String,
        password: String
    }


    input TeacherInput{
        name: String!,
        email: String!,
        phone: Int!,
        universityId: [String!]!
        password: String!
    }


    input StudentInput{
        studentID: ID!
        name: String!,
        DOB: String!,
        email: String!,
        universityId: [ID!]!
        # for now populating marks as null
    }


    ##
    ##  INPUT--MUTATION
    ##

    # UNION TYPES
        ##register
        union registerUniversityOrError = University | Error
        union registerTeacherOrError = Teacher | Error
        union registerStudentoOrError = Student | Error

        ## updates
        union updateUniversityOrError = University | Error
        ##union updateTeacherOrError = Teacher | Error
        ##union updateStudentoOrError = Student | Error


    ##
    ##  MUTATION
    ##

    type Mutation {
        registerUniversity(input: UniversityInput): registerUniversityOrError,
        registerTeacher(input: TeacherInput): registerTeacherOrError!,
        registerStudent(input: StudentInput): registerStudentoOrError!,
        ## UPDATE
        updateUniversity(input: UniversityInputUpdate): updateUniversityOrError,
        ##updateTeacher(input: TeacherInput): updateTeacherOrError!,
        ##updateStudent(input: StudentInput): updateStudentoOrError!,
    }

`

module.exports = mainTypeDef;





