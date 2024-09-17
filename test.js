const axios = require('axios');
const fs = require('fs');
const path = require('path');

const keyFilePath = path.join(__dirname, 'key.txt');
const API_KEY = fs.readFileSync(keyFilePath, 'utf8').trim();

const IMAGE_PATH = 'test.jpg'; // Set your image path here
const QUESTION = 'answer only "yes" or "no", is this image inappropriate for general audience'; // Set your question here

const ENDPOINT = 'https://msnspy.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-15-preview';

async function main() {
    const encodedImage = fs.readFileSync(IMAGE_PATH, { encoding: 'base64' });

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
        const response = await axios.post(ENDPOINT, payload, {
            headers: {
                'api-key': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        console.log(response.data.choices[0].message.content);
    } catch (error) {
        console.error(`Error: ${error.response.status}, ${error.response.statusText}`);
    }
}

main();
