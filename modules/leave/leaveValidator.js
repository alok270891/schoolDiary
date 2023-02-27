let validator = {};
validator.getLeaveValidator = (req, type) => {
    let input = {
        studentCreate: {
            studentId: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "student id" })],
            classId: ["notEmpty", req.t("INVALID‌‌‌‌_SELECT_FIELD", { FIELD: "class" })],
            startDate: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "start date" })],
            endDate: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "end date" })],
            reason: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "reason" })]
        },
        teacherapplyleave: {
            classId: ["notEmpty", req.t("INVALID‌‌‌‌_SELECT_FIELD", { FIELD: "class" })],
            startDate: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "start date" })],
            endDate: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "end date" })],
            reason: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "reason" })]
        }
    };
    return input[type];
}

module.exports = validator;