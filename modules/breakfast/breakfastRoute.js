//Dependencies
const auth = require('../../helper/auth');
const express = require('express');
const breakfastCtr = require('./breakfastController');
const breakfastMiddleware = require('./breakfastMiddleware');
let breakfastRouter = express.Router();


//breakfast create
let createbreakfastMiddleware = [
    auth.isAuthenticatedUser,
    breakfastMiddleware.validateInput('create'),
    breakfastMiddleware.breakfastExists,
    breakfastCtr.create
];
breakfastRouter.post('/create', createbreakfastMiddleware);

//breakfast udpate

let updatebreakfastMiddleware = [
    auth.isAuthenticatedUser,
    breakfastMiddleware.breakfastIdExists,
    breakfastMiddleware.breakfastExists,
    breakfastCtr.update
];
breakfastRouter.post('/update', updatebreakfastMiddleware);

//get breakfast list for customer
let breakfastListCustomerMiddleware = [
    auth.isAuthenticatedUser,
    breakfastCtr.breakfastList
];
breakfastRouter.post('/list', breakfastListCustomerMiddleware);

let deleteMiddleware = [
    auth.isAuthenticatedUser,
    breakfastMiddleware.validateInput('delete'),
    breakfastMiddleware.breakfastIdExists,
    breakfastCtr.delete
];
breakfastRouter.post('/delete', deleteMiddleware);

module.exports = breakfastRouter;