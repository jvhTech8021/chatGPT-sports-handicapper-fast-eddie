const SCRAPINGBEE_API_KEY = '3V37EYZUBWHLGJNJRKC15AGQN23RVGHP5Q5EW7NG85BDG78LKHWPNXGCE7PVVJXJQIGRTNB0B1KUOR7G';
const axios = require('axios');
const cheerio = require('cheerio');
const scrapingBee = require('scrapingbee');
const scrapingBeeClient = new scrapingBee.ScrapingBeeClient(SCRAPINGBEE_API_KEY);
const { retrieveLinks } = require('./serp-search');

const scrapeURL = async (url) => {
    try {
        const isGooglePage = url.includes("google.com");
        const customGoogleOpt = isGooglePage ? { custom_google: "True" } : {};

        const response = await axios.get(url, {
            params: {
                api_key: SCRAPINGBEE_API_KEY,
                url: url,
                return_page_source: true,
                ...customGoogleOpt
            }
        });

        const $ = cheerio.load(response.data);
        const mainTextArray = [];

        $('p').each((i, el) => {
            mainTextArray.push($(el).text());
        });

        // $('.trends__item').each((i, el) => {
        //     mainTextArray.push($(el).text());
        // });

        const mainText = mainTextArray.join('\n');

        return mainText;

    } catch (err) {
        console.log(`Error scraping ${url}`)
        return null;
    }
}


const getData = async () => {
    const games = await retrieveLinks();

    const promises = games.map(async game => {
        const data = await scrapeURL(game.link); // Scrape data using link

        // const words = data.split(' ');
        // const trimmedData = words.length > 6000 ? words.slice(1500).join(' ') : '';

        return {
            sport: game.sport,
            link: game.link,
            matchup: game.matchup,
            starts: game.starts,
            moneyline: game.moneyline,
            spead: game.spread,
            total: game.total,
            data: data, // Data from the scrape
        };
    });

    const allScrapedData = await Promise.all(promises); // await all promises

    return allScrapedData;
}



module.exports = { getData };