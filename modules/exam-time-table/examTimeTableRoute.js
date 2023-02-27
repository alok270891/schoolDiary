//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const examTimeTableCtr = require('./examTimeTableController');
const examTimeTableMiddleware = require('./examTimeTableMiddleware');
const examTypeMiddleware = require('../exam-type/examTypeMiddleware');
const subjectMiddleware = require('../subject/subjectMiddleware');
const classMiddleware = require('../class/classMiddleware');
let examTimeTableRouter = express.Router();


//examTimeTable create
let createexamTimeTableMiddleware = [
    auth.isAuthenticatedUser,
    // examTimeTableMiddleware.validateInput('create'),
    // examTypeMiddleware.examTypeIdExists,
    // subjectMiddleware.subjectIdExists,
    examTimeTableCtr.create
];
examTimeTableRouter.post('/create', createexamTimeTableMiddleware);

//examTimeTable udpate

let updateexamTimeTableMiddleware = [
    auth.isAuthenticatedUser,
    examTimeTableMiddleware.examTimeTableIdExists,
    examTypeMiddleware.examTypeIdExists,
    subjectMiddleware.subjectIdExists,
    classMiddleware.classIdExists,
    examTimeTableCtr.update
];
examTimeTableRouter.post('/update', updateexamTimeTableMiddleware);

//get examTimeTable list for customer
let examTimeTableListCustomerMiddleware = [
    auth.isAuthenticatedUser,
    examTimeTableCtr.examTimeTableList
];
examTimeTableRouter.post('/list', examTimeTableListCustomerMiddleware);

let deleteMiddleware = [
    auth.isAuthenticatedUser,
    examTimeTableMiddleware.validateInput('delete'),
    examTimeTableMiddleware.examTimeTableIdExists,
    examTimeTableCtr.delete
];
examTimeTableRouter.post('/delete', deleteMiddleware);

let getresultMiddleware = [
    auth.isAuthenticatedUser,
    // examTimeTableMiddleware.validateInput('getresult'),
    // examTimeTableMiddleware.examTimeTableIdExists,
    examTimeTableCtr.getresult
];
examTimeTableRouter.post('/getresult', getresultMiddleware);

module.exports = examTimeTableRouter;