//Dependencies
const auth = require("../../helper/auth");
const express = require("express");
const studentCtr = require("./studentController");
const studentMiddleware = require("./studentMiddleware");
const parentMiddleware = require("../parent/parentMiddleware");
const multipart = require("connect-multiparty");
const fileUpload = require('express-fileupload');
const multipartMiddleware = multipart();
let studentRouter = express.Router();

//student create
let createstudentMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    studentMiddleware.validateInput("create"),
    parentMiddleware.parentGrNumberExists,
    studentMiddleware.rollNumberExists,
    studentCtr.create,
];
studentRouter.post("/create", createstudentMiddleware);

let excelcreatestudentMiddleware = [
    fileUpload({
        useTempFiles : true,
        tempFileDir : '/tmp/'
    }),
    // multipartMiddleware,
    auth.isAuthenticatedUser,
    // studentMiddleware.validateInput('create'),
    parentMiddleware.parentGrNumberExists,
    studentMiddleware.rollNumberExists,
    studentCtr.excelcreate,
];
studentRouter.post("/excelcreate", excelcreatestudentMiddleware);

//student udpate

let updatestudentMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    studentMiddleware.validateInput("update"),
    parentMiddleware.parentGrNumberExists,
    studentMiddleware.studentIdExists,
    studentCtr.update,
];
studentRouter.post("/update", updatestudentMiddleware);

//get student list for customer
let studentListCustomerMiddleware = [
    auth.isAuthenticatedUser,
    studentCtr.studentList,
];
studentRouter.post("/list", studentListCustomerMiddleware);

let statusChangeMiddleware = [
    auth.isAuthenticatedUser,
    studentMiddleware.validateInput("statusChange"),
    studentCtr.statusChange,
];
studentRouter.post("/statusChange", statusChangeMiddleware);

let studentresultMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    studentMiddleware.validateInput("addstudentresult"),
    studentMiddleware.checkResult,
    studentCtr.addstudentresult,
];
studentRouter.post("/addstudentresult", studentresultMiddleware);

let sampleresultMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    studentMiddleware.validateInput("sampleresult"),
    studentCtr.sampleresult,
];
studentRouter.post("/sampleresult", sampleresultMiddleware);

let getresultMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    studentMiddleware.validateInput("getresult"),
    studentCtr.getresult,
];
studentRouter.post("/getresult", getresultMiddleware);

let studentexportMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    studentCtr.exportdata,
];
studentRouter.get("/exportdata", studentexportMiddleware);

let download = [studentCtr.download];
studentRouter.get('/download', download)

let deleteStudentResultMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    studentCtr.deleteStudentResult
];

studentRouter.post('/deleteStudentResult', deleteStudentResultMiddleware);

let updateStudentResultMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    studentMiddleware.validateInput('updateresult'),
    studentCtr.updateStudentResult
];
studentRouter.post('/updateStudentResult', updateStudentResultMiddleware);

module.exports = studentRouter;