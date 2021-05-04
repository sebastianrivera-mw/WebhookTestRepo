define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.test = {};
    exports.STATUS_CODES = {
        CURRENT_EXECUTION: "currentexecution",
        CREATED: "filecreated",
        ONE: "justone",
        AT_LEAST_ONE: "atleastone",
        UNKNOWN: "unknown",
    };
    exports.STATES = {
        HALT: 1,
        RUNNING: 2,
        FINISHED: 3,
        ERROR: 4,
    };
    exports.GENERAL = {
        CHECKING_1000_ACCOUNT: 1,
        AUTHOR: -5,
        MAPPING_ID: 445,
        FOLDER: 1386943,
        STATUS_FLAG: "status",
    };
});

