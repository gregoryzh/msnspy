const fs = require('fs');
const path = require('path');

const keyFilePath = path.join(__dirname, 'env.json');
const logFilePath = path.join(__dirname, `log_${Date.now()}.txt`); // New log file with timestamp

let _envObj = undefined;

function getEnv() {
    if (!_envObj) {
        _envObj = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    }
    return _envObj;
}

function logger(type, message) {
    const logLevel = getEnv().logLevel;
    const levels = {
        error: 1,
        info: 2,
        debug: 3
    };
    if (levels[type] > logLevel) {
        return;
    }
    message = typeof message === "object" ? JSON.stringify(message, null, 2) : message;
    const logMessage = `[${type.toUpperCase()}]: ${message}`;

    // Write log message to the log file
    fs.appendFileSync(logFilePath, logMessage + '\n');

    console.log(logMessage);
}

// Rest of the code...

exports.getEnv = getEnv;
exports.logError = logError;
exports.logInfo = logInfo;
exports.logDebug = logDebug;
exports.logDivider = logDivider;
exports.sleep = sleep;
