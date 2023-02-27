//Dependencies
const auth = require("../../helper/auth");
const express = require("express");
const draftCtr = require("./draftController");
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
let draftRouter = express.Router();

//draft create
let createdraftMiddleware = [
    auth.isAuthenticatedUser,
    draftCtr.drafts,
];
draftRouter.get("/drafts", createdraftMiddleware);

let addDraftMiddleware = [
    auth.isAuthenticatedUser,
    draftCtr.addDrafts,
];
draftRouter.post("/create", addDraftMiddleware);

module.exports = draftRouter;