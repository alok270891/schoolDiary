let validator = {};
validator.getClassValidator = (req, type) => {
    let input = {
        create: {
            standardId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "standard id" })],
            className: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "class name" })],
            medium: ["isValidEnum", req.t("MEDIUM_NOT_VALID"), ["ENG", "GUJ"]]
        },
        statusChange: {
            classId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "Class id" })],
            status: ["isValidEnum", req.t("STATUS_NOT_VALID"), ["ACTIVE", "INACTIVE"]],
        },
    };
    return input[type];
}

module.exports = validator;