const { isSensitive } = require('./isSensitive');

async function main() {
    // https://www.msn.com/en-us/lifestyle/fashion/the-marie-claire-autumn-winter-2024-trend-report/ar-AA1pY2ty?item=spalink%3Alatest&ocid=winp2fptaskbarent&cvid=3dd3fa9c3def45feb61beb161c29a5e1&ei=5
    // https://www.marieclaire.co.uk/fashion/autumn-winter-2024-fashion-trends-report
    // exposure clothing, 
    // https://cdn.mos.cms.futurecdn.net/88JTWeMwa8WsvUxCefhbLJ-1600-80.jpg.webp

    // gun https://img-s-msn-com.akamaized.net/tenant/amp/entityid/BB1qej0o.img?w=768&h=417&m=6
    //     AA1qKzzL: https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1qpHRz.img : 70%, reason: The image depicts a candlelight vigil, which may be associated with somber or emotional events. 
    // AA1qKzzL: https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1q0q2E.img : 70%, the image references a shooting, which can be distressing for some audiences. 
    // AA1qKzzL: https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1q0q2E.img : 70%, reason: The image refers to a shooting, which is a sensitive topic for general audiences. 


  const url = 'https://cdn.mos.cms.futurecdn.net/X9EM4sFmnKtj8HUFgHxnK9-1600-80.jpg.webp';
  let result = await isSensitive(url);
  console.log(result);
}

main();