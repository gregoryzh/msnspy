const { isSensitive } = require('./isSensitive');

async function main() {
    // case 1
    // https://www.msn.com/en-us/lifestyle/fashion/the-marie-claire-autumn-winter-2024-trend-report/ar-AA1pY2ty?item=spalink%3Alatest&ocid=winp2fptaskbarent&cvid=3dd3fa9c3def45feb61beb161c29a5e1&ei=5
    // https://www.marieclaire.co.uk/fashion/autumn-winter-2024-fashion-trends-report
    // exposure clothing, 
    // https://cdn.mos.cms.futurecdn.net/88JTWeMwa8WsvUxCefhbLJ-1600-80.jpg.webp this one is hard to detect
    // https://cdn.mos.cms.futurecdn.net/X9EM4sFmnKtj8HUFgHxnK9-2560-80.jpg.webp this one is easier to detect
    // 
    // case 2
    // https://www.msn.com/en-us/movies/news/the-10-top-movies-of-1977-a-year-that-changed-film-forever/ss-AA1oNVMS
    // https://www.moviemaker.com/top-movies-of-1977-box-office-galle/
    // https://www.moviemaker.com/cdn-cgi/image/width%3D788%2Cheight%3D444%2Cfit%3Dcrop%2Cquality%3D80%2Cformat%3Dauto%2Conerror%3Dredirect%2Cmetadata%3Dnone/wp-content/uploads/2023/12/The-Deep-1.jpg


  // const url = 'https://www.moviemaker.com/cdn-cgi/image/width%3D788%2Cheight%3D444%2Cfit%3Dcrop%2Cquality%3D80%2Cformat%3Dauto%2Conerror%3Dredirect%2Cmetadata%3Dnone/wp-content/uploads/2023/12/The-Deep-1.jpg';
  // const url = 'https://cdn.mos.cms.futurecdn.net/88JTWeMwa8WsvUxCefhbLJ-1600-80.jpg.webp';
  // const url = 'https://cdn.mos.cms.futurecdn.net/X9EM4sFmnKtj8HUFgHxnK9-2560-80.jpg.webp';
  // const url = "https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1qRGgm.img"; // content filter marked as jailbreak
  let result = await isSensitive(url);
  console.log(result);
}

main();