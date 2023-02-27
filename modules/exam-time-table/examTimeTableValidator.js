let validator = {};
const utils = require('../../helper/utils');

validator.getExamTimeTableValidator = (req, type) => {
    let input = {
        create: {
            examTimeTableId: ["notEmpty", req.t("INVALID‌‌‌‌_SELECT_FIELD", { FIELD: "exam type" })],
            subjectId: ["notEmpty", req.t("INVALID‌‌‌‌_SELECT_FIELD", { FIELD: "subject" })],
            duration: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "duration" })],
            day: ["isValidEnum", req.t("DAY_NOT_VALID"), utils.days],
            examDate: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "exam date" })],
            name: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "exam name" })],
        },
        statusChange: {
            breakfastId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "breakfast id" })],
            status: ["isValidEnum", req.t("STATUS_NOT_VALID"), ["ACTIVE", "INACTIVE"]],
        },
    };
    return input[type];
}

module.exports = validator;