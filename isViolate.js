const fs = require('fs');
const axios = require('axios');
const { getEnv, logDebug, logError, logInfo, logDivider } = require('./Utils');

const API_KEY = getEnv().ai.key;
const QUESTION = 'answer only "yes" or "no", is this image inappropriate for general audience'; // Set your question here
const ENDPOINT = getEnv().ai.endpoint

async function isViolate(imgUrl, contentText) {
    logDebug(`API_KEY: ${API_KEY}`);
    logDebug(`[QUESTION]: ${QUESTION}`);
    logDebug(`[ENDPOINT]: ${ENDPOINT}`);
    // TODO: can AI checks content test?
    logDivider();
    logInfo('Starting the AI model...');
    logInfo('Get Image content...');
    const encodedImageResponse = await axios.get(imgUrl,{
        responseType: 'arraybuffer'
    });
    logInfo('End of getting Image content...');
    const encodedImage = Buffer.from(encodedImageResponse.data, 'binary').toString('base64');
    // logDebug("Image blob: " + encodedImage);

    const payload = {
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:image/jpeg;base64,${encodedImage}`
                        }
                    },
                    {
                        type: 'text',
                        text: QUESTION
                    }
                ]
            }
        ],
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 800,
        stream: false
    };

    try {
        const options = {
            headers: {
                'api-key': API_KEY,
                'Content-Type': 'application/json'
            }
        }
        logDebug(`[PAYLOAD]:`);
        logDebug(payload);
        logDebug(`[OPTIONS]:`);
        logDebug(options)
        logDivider();
        logInfo('Sending the request to the AI model...');
        const response = await axios.post(ENDPOINT, payload, options);
        logDebug(`[RESPONSE]:`);
        logDebug(response.data);
        logInfo("End of the AI model...");
        logDivider();
        return response.data.choices[0].message.content;
    } catch (error) {
        logError(error);
    }
}

exports.isViolate = isViolate;
