//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const examTypeCtr = require('./examTypeController');
const examTypeMiddleware = require('./examTypeMiddleware');
let examTypeRouter = express.Router();


//examType create
let createexamTypeMiddleware = [
    auth.isAuthenticatedUser,
    examTypeMiddleware.validateInput('create'),
    examTypeMiddleware.examTypeExists,
    examTypeCtr.create
];
examTypeRouter.post('/create', createexamTypeMiddleware);

//examType udpate

let updateexamTypeMiddleware = [
    auth.isAuthenticatedUser,
    examTypeMiddleware.examTypeIdExists,
    examTypeMiddleware.examTypeExists,
    examTypeCtr.update
];
examTypeRouter.post('/update', updateexamTypeMiddleware);

//get examType list for customer
let examTypeListCustomerMiddleware = [
    auth.isAuthenticatedUser,
    examTypeCtr.examTypeList
];
examTypeRouter.post('/list', examTypeListCustomerMiddleware);

let statusChangeMiddleware = [
    auth.isAuthenticatedUser,
    examTypeMiddleware.validateInput('statusChange'),
    examTypeMiddleware.examTypeIdExists,
    examTypeCtr.statusChange
];
examTypeRouter.post('/statusChange', statusChangeMiddleware);

module.exports = examTypeRouter;