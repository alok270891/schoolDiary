let validator = {};
validator.getExamTypeValidator = (req, type) => {
    let input = {
        create: {
            name: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Exam type name" })]
        },
        statusChange: {
            examTypeId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "examType id" })],
            status: ["isValidEnum", req.t("STATUS_NOT_VALID"), ["ACTIVE", "INACTIVE"]],
        },
    };
    return input[type];
}

module.exports = validator;