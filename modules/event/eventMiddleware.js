const _v = require('../../helper/validate');
const utils = require('../../helper/utils');
const eventValidator = require('./eventValidator');
const eventModel = require('./eventModel');

let eventMiddleware = {};

eventMiddleware.validateInput = (type, validateType, inputKey) => {
    return function(req, res, next) {
        var eventValidators = {};
        var validators = eventValidator.getEventValidator(req, type);
        inputKey = (inputKey) ? inputKey : "body";
        if (validateType == "update") {
            let input = req[inputKey];
            if (validators) {
                for (var k in input) {
                    eventValidators[k] = validators[k];
                }
            }
        } else {
            eventValidators = validators
        }
        let error = _v.validate(req.body, eventValidators);
        if (!utils.empty(error)) {
            return errorUtil.validationUserError(res, { data: [], message: error, status: false });
        }
        next();
    };
}


eventMiddleware.eventIdExists = (req, res, next) => {
    if (!utils.empty(req.body.eventId)) {
        eventModel.geteventById(req.body.eventId, (eventDetails) => {
            if (!utils.empty(eventDetails)) {
                req.eventDetails = eventDetails.dataValues;
                next();
            } else {
                return res.status(400).json({ data: [], status: false, "message": req.t("EVENT_ID_NOT_VALID") });
            }
        }, (err) => {
            console.log(err);
            return res.status(500).json({ data: [], status: false, "message": req.t("DB_ERROR") });
        });
    } else {
        return res.status(400).json({ data: [], status: false, "message": req.t("EVENT_ID_NOT_VALID") });
    }
}

eventMiddleware.eventExists = (req, res, next) => {
    let filter = {
        eventName: req.body.eventName
    };
    if (!utils.empty(req.body.eventId)) {
        filter.id = { "$ne": req.body.eventId };
    }
    eventModel.getevent(filter, (result) => {
        if (!utils.empty(result) && result.length > 0) {
            return res.status(400).json({ data: [], status: false, "message": req.t("event_NAME_ALREADY_EXISTS", { FIELD: 'english' }) });
        } else {
            next();
        }
    });
}

module.exports = eventMiddleware;