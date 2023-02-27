//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const homeWorkCtr = require('./homeWorkController');
const homeWorkMiddleware = require('./homeWorkMiddleware');
const classMiddleware = require('../class/classMiddleware');
const studentMiddleware = require('../student/studentMiddleware');
const parentMiddleware = require('../parent/parentMiddleware');
const subjectMiddleware = require('../subject/subjectMiddleware');
const multipart = require('connect-multiparty');
const fileUpload = require('express-fileupload');
const multipartMiddleware = multipart();
let homeWorkRouter = express.Router();

//homeWork create
let createhomeWorkMiddleware = [
    multipartMiddleware,
    // fileUpload({
    //     useTempFiles : true,
    //     tempFileDir : '/tmp/'
    // }),
    auth.isAuthenticatedUser,
    homeWorkMiddleware.validateInput('create'),
    parentMiddleware.parentGrNumberExists,
    classMiddleware.classIdExists,
    subjectMiddleware.subjectIdExists,
    homeWorkCtr.create
];
homeWorkRouter.post('/create', createhomeWorkMiddleware);

//homeWork udpate

let updatehomeWorkMiddleware = [
    multipartMiddleware,
    auth.isAuthenticatedUser,
    homeWorkMiddleware.validateInput('update'),
    parentMiddleware.parentGrNumberExists,
    homeWorkMiddleware.homeWorkIdExists,
    homeWorkCtr.update
];
homeWorkRouter.post('/update', updatehomeWorkMiddleware);

//get homeWork list for customer
let homeWorkListCustomerMiddleware = [
    auth.isAuthenticatedUser,
    homeWorkCtr.homeWorkList
];
homeWorkRouter.post('/list', homeWorkListCustomerMiddleware);

let statusChangeMiddleware = [
    auth.isAuthenticatedUser,
    homeWorkMiddleware.validateInput('statusChange'),
    homeWorkMiddleware.homeWorkIdExists,
    studentMiddleware.studentIdExists,
    homeWorkCtr.statusChange
];
homeWorkRouter.post('/statusChange', statusChangeMiddleware);

let addCommentMiddleware = [
    auth.isAuthenticatedUser,
    homeWorkMiddleware.validateInput('addComment'),
    homeWorkMiddleware.homeWorkIdExists,
    homeWorkCtr.addComment
];
homeWorkRouter.post('/addComment', addCommentMiddleware);

let updateCommentMiddleware = [
    auth.isAuthenticatedUser,
    homeWorkMiddleware.validateInput('updateComment'),
    homeWorkMiddleware.commentIdExists,
    homeWorkCtr.updateComment
];
homeWorkRouter.post('/updateComment', updateCommentMiddleware);

module.exports = homeWorkRouter;