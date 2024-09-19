const fs = require('fs');
const path = require('path');

const keyFilePath = path.join(__dirname, 'env.json');
const logFilePath = path.join(__dirname, `app_${Date.now()}.log`);

let _envObj = undefined;
function getEnv() {
    if (!_envObj) {
        _envObj = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    }
    return _envObj;
}
/**
 * Log levels are: 
 * 3. error, info, debug
 * 2. error, info
 * 1. error
 */
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
    console.log(logMessage);
    logToFile(logMessage);
}


function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}\n`;
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
}

function logError(message) {
    logger('error', message);
}

function logInfo(message) {
    logger('info', message);
}
function logDebug(message) {
    logger('debug', message);
}
function logDivider() {
    console.log('---------------------------------');
}

async function sleep(sec) {
    logInfo(`Waiting for ${sec} secends`)
    const timerPromise = new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, sec * 1000);
    })
    await timerPromise;
}

exports.getEnv = getEnv;
exports.logError = logError;
exports.logInfo = logInfo;
exports.logDebug = logDebug;
exports.logDivider = logDivider;
exports.sleep = sleep;