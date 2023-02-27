let validator = {};
validator.getHomeWorkValidator = (req, type) => {
    let input = {
        create: {
            subjectId: ["notEmpty", req.t("INVALID‌‌‌‌_SELECT_FIELD", { FIELD: "subject" })],
            classId: ["notEmpty", req.t("INVALID‌‌‌‌_SELECT_FIELD", { FIELD: "class" })],
            title: ["notEmpty", req.t("INVALID‌‌‌‌_FIELD", { FIELD: "title" })],
            deadlineDate: ["notEmpty", req.t("INVALID‌‌‌‌_SELECT_FIELD", { FIELD: "deadline date" })],
            startDate: ["notEmpty", req.t("INVALID‌‌‌‌_SELECT_FIELD", { FIELD: "start date" })]
        },
        statusChange: {
            homeworkId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "Home work id" })],
            status: ["isValidEnum", req.t("STATUS_NOT_VALID"), ["Pending", "Completed", "Reopen", "Accepted"]],
        },
        update: {
            homeworkId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "Home work id" })],
        },
        addComment: {
            homeworkId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "Home work id" })],
            comment: ["notEmpty", req.t("INVALID‌‌‌‌_FIELD", { FIELD: "comment" })],
        },
        updateComment: {
            comment: ["notEmpty", req.t("INVALID‌‌‌‌_FIELD", { FIELD: "comment" })],
        }
    };
    return input[type];
}

module.exports = validator;