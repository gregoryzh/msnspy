const fs = require('fs');
const axios = require('axios');
const { getEnv, logDebug, logError, logInfo, logDivider } = require('./Utils');
const sharp = require('sharp');

const API_KEY = getEnv().ai.key;
const QUESTION = 'answer in the fomrat of "X%, reason", how likely is the attached image has exposed anatomy such as bare buttocks, female nipples, genitalia, mark with a higher rate if you are not confident'; // Set your question here
const ENDPOINT = getEnv().ai.endpoint

async function isSensitive(imgUrl, contentText) {
    logDebug(`API_KEY: ${API_KEY}`);
    
    logDebug(`[ENDPOINT]: ${ENDPOINT}`);
    // TODO: can AI checks content test?
    let question = QUESTION;
    if(contentText) {
        question = QUESTION + " "+ contentText
    }
    let content  = [];
    
    logDebug(`[QUESTION]: ${question}`);
    logDivider();
    
    logInfo('Starting the AI model...');

    if(imgUrl){
        try {
            logInfo('Get Image content...');
            const encodedImageResponse = await axios.get(imgUrl, {
                responseType: 'arraybuffer'
            });
            logInfo('End of getting Image content...');
            const encodedImage = Buffer.from(encodedImageResponse.data, 'binary').toString('base64');

            // Resize the image
            const image = await sharp(Buffer.from(encodedImage, 'base64'));
            const metadata = await image.metadata();
            const width = metadata.width;
            const height = metadata.height;
            logInfo(`image size ${width}x${height}`);
            let resizedWidth, resizedHeight;
            if (width > height) {
                resizedWidth = 500;
                resizedHeight = Math.round((height / width) * resizedWidth);
            } else {
                resizedHeight = 500;
                resizedWidth = Math.round((width / height) * resizedHeight);
            }
            const resizedImage = await image.resize(resizedWidth, resizedHeight).toBuffer();
            logInfo(`image resize ${resizedWidth}x${resizedHeight}`);
            const resizedEncodedImage = resizedImage.toString('base64');
            const fileSize = resizedImage.length;
            logInfo(`Resized image file size: ${fileSize} bytes`);
            // logDebug("Image blob: " + encodedImage);
            content.push({
                type: 'image_url',
                image_url: {
                    // url: imgUrl
                    url: `data:image/jpeg;base64,${resizedEncodedImage}`
                }
            })
        } catch (error) {
            logInfo('Failed to get image content...');
            return "";
        }
    }
    content.push({
        type: 'text',
        text: question
    });
    const payload = {
        messages: [
            {
                role: 'user',
                content: content
            }
        ],
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 800,
        stream: false
    };

    const options = {
        headers: {
            'api-key': API_KEY,
            'Content-Type': 'application/json'
        }
    }
    const maxRetries = 3;
    let retryCount = 0;
    let response;

    while (retryCount < maxRetries) {
        try {
            logDebug(`[PAYLOAD]:`);
            logDebug(payload);
            logDebug(`[OPTIONS]:`);
            logDebug(options)
            logDivider();
            logInfo('Sending the request to the AI model...');
            response = await axios.post(ENDPOINT, payload, options);
            logDebug(`[RESPONSE]:`);
            logDebug(response.data);
            logInfo("End of the AI model...");
            logDivider();
            break; // Break out of the retry loop if request is successful
        } catch (error) {
            
            if (error.response && error.response.status === 429) {
                retryCount++;
                logInfo(`Request failed with status code 429 at Attempt ${retryCount}`);
                const waitTime = Math.pow(2, retryCount) * 8000; // exponential back-off wait time
                await new Promise(resolve => setTimeout(resolve, waitTime));
            } else {
                logError("Request failed with an error.");
                logError(error);
                break; // Break out of the retry loop if request fails with an error other than 429
            }
        }
    }

    if (response) {
        return response.data.choices[0].message.content;
    } else {
        logError("Request failed after maximum retries.");
    }
}

exports.isSensitive = isSensitive;
