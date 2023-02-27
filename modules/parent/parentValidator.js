let validator = {};
validator.getParentValidator = (req, type) => {
    let input = {
        login: {
            grNumber: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "GR number" })],
            schoolId: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "school id" })],
        },
        create: {
            parentName: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "parent name" })]
        },
        statusChange: {
            parentId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "Parent id" })],
            status: ["isValidEnum", req.t("STATUS_NOT_VALID"), ["ACTIVE", "INACTIVE"]],
        },
        forgotPassword: {
            email: ["isEmail", req.t("INVALID_FIELD", { FIELD: "Email" })],
            grNumber: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "GR number" })]
        },
        resetpassword: {
            oldPassword: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Old password" })],
            newPassword: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "New password" })],
        },
        resetpassword: {
            oldPassword: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Old password" })],
            newPassword: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "New password" })],
        },
    };
    return input[type];
}

module.exports = validator;