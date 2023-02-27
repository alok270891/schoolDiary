//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const leaveCtr = require('./leaveController');
const leaveMiddleware = require('./leaveMiddleware');
let leaveRouter = express.Router();


//leave create
let createleaveMiddleware = [
    auth.isAuthenticatedUser,
    leaveMiddleware.validateInput('studentCreate'),
    leaveCtr.create
];
leaveRouter.post('/parentapplyleave', createleaveMiddleware);

let applyleaveMiddleware = [
    auth.isAuthenticatedUser,
    leaveMiddleware.validateInput('teacherapplyleave'),
    leaveCtr.create
];
leaveRouter.post('/teacherapplyleave', applyleaveMiddleware);

//leave udpate

let updateleaveMiddleware = [
    auth.isAuthenticatedUser,
    leaveMiddleware.validateInput('update'),
    leaveMiddleware.leaveIdExists,
    leaveCtr.update
];
leaveRouter.post('/update', updateleaveMiddleware);

//get leave list for customer
let leaveListCustomerMiddleware = [
    auth.isAuthenticatedUser,
    leaveCtr.leaveList
];
leaveRouter.post('/list', leaveListCustomerMiddleware);

module.exports = leaveRouter;