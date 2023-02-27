let validator = {};
const utils = require('../../helper/utils');

validator.getDailyTimeTableValidator = (req, type) => {
    let input = {
        create: {
            subject: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "subject" })],
            duration: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "duration" })],
            teacherId: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "teacher id" })],
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