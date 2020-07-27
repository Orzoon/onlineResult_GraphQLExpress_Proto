if(process.env.ENV !== 'production') {
    require("dotenv").config();
} 

const express = require("express");
const mongoose = require("mongoose");
const {ApolloServer, ApolloError} = require("apollo-server-express");
const {GraphQLError} = require("graphql");

// bringing In Modules
const modals = {
     cuModal: require("./src/modals/cuModal"),
     resultModal: require("./src/modals/resultModal"),
     studentModal: require("./src/modals/studentModal"),
     teacherModal: require("./src/modals/teacherModal")
}

// typeDefs and resolvers
const typeDefs = require("./src/typedefs/maintypedef");
const resolvers = require("./src/resolvers/mainresolver");


const app = express();
app.use(express.json());

// response Headers
app.use((req,res,next) => {
    res.setHeader("Access-Control-Allow-origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
})


const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req,res}) => {
        // authentication
        return({
            req, 
            res,
            modals
        })
    },
    formatError: (error) => {
        console.log("indexpage", error)
        if(error.originalError instanceof ApolloError){
            console.log("originalError")
            return error
        }
        //return new GraphQLError(`Something went wrong`)
        return error
    }

})

server.applyMiddleware({app, path: "/graphql"})


mongoose.connect(process.env.mongooseURL,{useNewUrlParser: true, useUnifiedTopology: true}, (error) => {
    if(error){
        console.log("error", error)
        return null
    }
    app.listen(process.env.PORT || 5000, ()=> {
        console.log(`app is running at the port http://localhost:${process.env.PORT || 5000+server.graphqlPath}`)
    })
})


