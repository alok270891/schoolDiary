let validator = {};
validator.getSubjectValidator = (req, type) => {
    let input = {
        create: {
            subjectName: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "subject name" })]
        },
        statusChange: {
            subjectId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "subject id" })],
            status: ["isValidEnum", req.t("STATUS_NOT_VALID"), ["ACTIVE", "INACTIVE"]],
        },
    };
    return input[type];
}

module.exports = validator;