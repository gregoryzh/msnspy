const axios = require('axios');
const { getEnv, logDebug, logError, logInfo, logDivider, sleep } = require('./Utils');
const { isSensitive } = require('./isSensitive');
const fs = require('fs');

// globals
let articles = []; // { images: {url: string; isSensitive: string}[], text: string, isSensitive: string }[]
const env = getEnv();
const feedEnv = env.feed;
const aiEnv = env.ai;
let articleCnt = 0;
let nextPageUrl = "";

// only get 1st page for now
async function getFeedsFromMsn() {
    if (articleCnt >= feedEnv.maxFeedItems) {
        return;
    }
    logInfo("Start of getting Feeds...")
    const options = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const url = nextPageUrl || feedEnv.feedFirstPageUrl;
    logInfo(`[Feed request url]: ${url}`)
    const response = await axios.get(url, options)
    const data = response.data;
    logDebug(`[Feed RESPONSE]: ${JSON.stringify(data)}`);
    logInfo("End of getting Feeds...")
    nextPageUrl = data.nextPageUrl;
    return data;
}

function findAllArticleIdsFromMsnFeed(response) {
    const sections = response.sections;
    let cardPool = [];
    // get all cards and subcards in a flat data structure
    sections.forEach(section => {
        let subCardPool = [];
        const { cards } = section;
        cards.forEach(card => {
            if(card.subCards && card.subCards.length) {
                subCardPool = subCardPool.concat(card.subCards);
            } else {
                subCardPool.push(card)
            }
        });
        cardPool = cardPool.concat(subCardPool);
    });
    // filter find only articles
    const filteredCardPool = cardPool.filter(card => card.type === "article")
    // only return max number of cards
    const slicedCardPool =  filteredCardPool.slice(0, feedEnv.maxFeedItems - articleCnt);
    articleCnt += slicedCardPool.length;
    return slicedCardPool
}

function getArticleIdsAndMarket(cards) {
    return cards.map(card => ({id: card.id, market: card.locale}));
}

async function getCardItem(id, market) {
    const articleDetial = await getArcileDetails(id, market);
    return {
        id,
        images: articleDetial?.imageResources?.map(r => ({url: r.url, sensitivity: "not checked"})) || [],
        text: articleDetial.body
        // isSensitive: "not checked"
    }
}

function buildArticleUrlFromArticleId(id, market) {
    const baseUrl = feedEnv.baseArticleUrl;
    return `${baseUrl}/${market}/${id}`;
}

async function getArcileDetails(id, market) {
    logInfo("Start of getting article details for: " + id);
    const url = buildArticleUrlFromArticleId(id, market);
    const options = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    logInfo("[Article Detail URL] " + url);
    const response = await axios.get(url, options)
    logDebug(`[Article Detail RESPONSE]: ${JSON.stringify(response.data)}`);
    logInfo("End of getting article details for: " + id);
    logDivider();
    return response.data;
}

async function main() {
    logInfo("App starts...")
    // get all articles firstly. 
    let cards = [];
    while (articleCnt < feedEnv.maxFeedItems) {
        cards = cards.concat(findAllArticleIdsFromMsnFeed(await getFeedsFromMsn()));
        await sleep(feedEnv.intervalForGettingArticleDetailsInSec);
    }
    const articleIdsAndMarket = getArticleIdsAndMarket(cards);
    logDebug("[ArticleIdsAndMarkets]");
    logDebug(articleIdsAndMarket);

    // run ai module now.
    const articleInterval = feedEnv.intervalForGettingArticleDetailsInSec;
    const aiInterval = aiEnv.intervalForRequestingAiInSec;
    logDivider();
    logInfo("Start of getting articles details");
    for (let i = 0; i < articleIdsAndMarket.length; i++) {
        const article = articleIdsAndMarket[i];
        logInfo(`Getting article details for [Article: ${article.market}/${article.id}]`);
        articles.push(await getCardItem(article.id, article.market))
        // wait for a certain time to avoid been banned
        
        await sleep(articleInterval);
    }
    logInfo("End of getting articles details");
    logInfo("Start of validating the content with AI...");
    const maxAiItems = aiEnv.maxAiItems;
    
    for (let i = 0; i < articles.length; i++) {
        let count = 0;
        const article = articles[i];
        // validate images
        for(let j = 0; j < article.images.length; j++) {
            const img = article.images[j];
            if (count >= maxAiItems) { 
                break;
            }
            count++;

            const sensitivity = await isSensitive(img.url);
            img.sensitivity = sensitivity;
            try {
                const [percentage, reason] = sensitivity.split('%');
                const sensitivityNumber = parseInt(percentage);

                if (sensitivityNumber > 40) {
                    
                    try {
                        fs.appendFileSync('sensitivity.log', `${article.id}: ${img.url} : ${sensitivity} \n`);
                    } catch (error) {
                        logError(`Error writing to file: ${error}`);
                    }
                }

            } catch (error){
                logError(`Error while parsing : ${error}`)
            }
            try {
                fs.appendFileSync('scanHistory.log', JSON.stringify(img) + '\n');
            } catch (error) {
                logError(`Error writing to file: ${error}`);
            }
            // wait for a certain time to avoid been banned
            
            await sleep(aiInterval);
        }
        // not ding text, too much token consumed
        // let textResult = await isSensitive(null, article.text)
        // article.isSensitive = textResult;
        // await sleep(aiInterval);
    }
    logInfo("End of validating the content with AI...");
    logDivider();
    logInfo("[Report] validation result: ");
    logInfo(articles.map(article => ({ images: article.images, isSensitive: article.isSensitive })));
    logDivider();
    logInfo("App ends...")
}

main();