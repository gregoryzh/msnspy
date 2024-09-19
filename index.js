const axios = require('axios');
const { getEnv, logDebug, logError, logInfo, logDivider, sleep } = require('./Utils');
const { isViolate } = require('./isViolate');
const fs = require('fs');

// globals
let articles = []; // { images: {url: string; isViolate: string}[], text: string, isViolate: string }[]
const env = getEnv();
const feedEnv = env.feed;
const aiEnv = env.ai;
// only get 1st page for now
async function getFeedsFromMsn() {
    logInfo("Start of getting Feeds...")
    const options = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    const response = await axios.get(feedEnv.feedFirstPageUrl, options)
    logDebug(`[Feed RESPONSE]: ${JSON.stringify(response.data)}`);
    logInfo("End of getting Feeds...")
    return response.data;
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
    return filteredCardPool.slice(0, feedEnv.maxFeedItems);
}

function getArticleIdsAndMarket(cards) {
    return cards.map(card => ({id: card.id, market: card.locale}));
}

async function getCardItem(id, market) {
    const articleDetial = await getArcileDetails(id, market);
    return {
        id,
        images: articleDetial?.imageResources?.map(r => ({url: r.url, isViolate: "not checked"})) || [],
        text: articleDetial.body,
        isViolate: "not checked"
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
    const feeds = await getFeedsFromMsn();
    const cards = findAllArticleIdsFromMsnFeed(feeds);
    const articleIdsAndMarkt = getArticleIdsAndMarket(cards);
    const articleInterval = feedEnv.intervalForGettingArticleDetailsInSec;
    const aiInterval = aiEnv.intervalForRequestingAiInSec;
    logDivider();
    logInfo("Start of getting articles details");
    for (let i = 0; i < articleIdsAndMarkt.length; i++) {
        const article = articleIdsAndMarkt[i];
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

            img.isViolate = await isViolate(img.url);

            if (img.isViolate.toLowerCase().startsWith("yes")) {
                fs.appendFileSync('bad.txt', img.url + '\n');
            }

            // wait for a certain time to avoid been banned
            
            await sleep(aiInterval);
        }
        // not ding text, too much token consumed
        // let textResult = await isViolate(null, article.text)
        // article.isViolate = textResult;
        // await sleep(aiInterval);
    }
    logInfo("End of validating the content with AI...");
    logDivider();
    logInfo("[Report] validation result: ");
    logInfo(articles.map(article => ({ images: article.images, isViolate: article.isViolate })));
    logDivider();
    logInfo("App ends...")
}

main();