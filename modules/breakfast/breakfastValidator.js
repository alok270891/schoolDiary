let validator = {};
const utils = require('../../helper/utils');

validator.getBreakfastValidator = (req, type) => {
    let input = {
        create: {
            breakfastName: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "breakfast name" })],
            day: ["isValidEnum", req.t("DAY_NOT_VALID"), utils.days]
        },
        statusChange: {
            breakfastId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "breakfast id" })],
            status: ["isValidEnum", req.t("STATUS_NOT_VALID"), ["ACTIVE", "INACTIVE"]],
        },
    };
    return input[type];
}

module.exports = validator;