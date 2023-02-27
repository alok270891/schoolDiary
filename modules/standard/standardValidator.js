let validator = {};
validator.getStandardValidator = (req, type) => {
    // let input = {
    //     create: {
    //         standardName: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "standard name" })]
    //     },
    //     statusChange: {
    //         standardId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "standard id" })],
    //         status: ["isValidEnum", req.t("STATUS_NOT_VALID"), ["ACTIVE", "INACTIVE"]],
    //     },
    // };
    // return input[type];
}

module.exports = validator;