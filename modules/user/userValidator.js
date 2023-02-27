let validator = {};
validator.getUserValidator = (req, type) => {
    let input = {
        login: {
            schoolId: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "school id" })],
            // password: ["notEmpty", req.t("USER_PASSWORD_REQUIRE")],
        },
        adminLogin: {
            email: ["notEmpty", req.t("USERNAME_REQUIRE")],
            password: ["notEmpty", req.t("USER_PASSWORD_REQUIRE")],
        },
        register: {
            firstName: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "first ame" })],
            lastName: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "last ame" })],
            email: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "email" })]
        },
        setPassword: {
            password: ["notEmpty", req.t("USER_PASSWORD_REQUIRE")]
        },
        statusChange: {
            userId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "User id" })],
            status: ["isValidEnum", req.t("STATUS_NOT_VALID"), ["ACTIVE", "INACTIVE"]],
        },
        forgotPassword: {
            email: ["isEmail", req.t("INVALID_FIELD", { FIELD: "Email" })],
            schoolId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "School id" })]
        },
        resetpassword: {
            oldPassword: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Old password" })],
            newPassword: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "New password" })],
        },
        socialLogin: {
            fullName: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Full name" })],
            email: ["isEmail", req.t("INVALID_FIELD", { FIELD: "email" })],
            fbid: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "fbid" })]
        },
        sendNotification: {
            userId: ["isInt", req.t("FIELD_REQUIRED", { FIELD: "User id" })],
            message: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "Message" })],
        },
        notification: {
            sendto: ["isValidEnum", req.t("SEND_TO_NOT_VALID"), ['all', 'clientsusers', 'selecteduser', 'businessowners']],
            title: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "title" })],
            body: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "body" })],
        },
        setting: {
            key: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "key" })],
            valueEn: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "value english" })],
            valueAr: ["notEmpty", req.t("FIELD_REQUIRED", { FIELD: "value arabic" })],
        }
    };
    return input[type];
}

module.exports = validator;