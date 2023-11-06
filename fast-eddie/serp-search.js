const { getAllUpcomingGames } = require('./get-todays-events');
const SERP_API_KEY = '';
const axios = require('axios');

const searchForGameNews = async (query) => {
    const serpApiParams = {
        engine: 'google',
        num: 8,
        q: query,
        qdr: 'h24',
        api_key: SERP_API_KEY,
    };

    const serpApiUrl = `https://serpapi.com/search.json?${new URLSearchParams(serpApiParams).toString()}`;
    const serpApiResults = await axios.get(serpApiUrl);
    const results = serpApiResults.data.organic_results;
    return results;
};


const retrieveLinks = async () => {
    try {
        const games = await getAllUpcomingGames();
        const gameLinks = [];
        const today = new Date();
        
        await Promise.all(games.map(async (game) => {
            // console.log(game);
            const home_team = game.home;
            const away_team = game.away;
            const starts = game.starts;
            const sport = game.sport;
            const query = `${away_team} vs ${home_team} betting predictions ${today.toLocaleDateString()}`;

            const searchResults = await searchForGameNews(query);

            searchResults.forEach((site) => {
                const gameObject = {
                    sport: sport,
                    matchup: `${away_team} vs ${home_team}`,
                    starts: starts,
                    moneyline: game.moneyline,
                    spread: game.spread,
                    total: game.total,
                    link: site.link
                }
                gameLinks.push(gameObject);
            });
        }));
        
        return gameLinks;
    } catch (error) {
        console.error(`Error getting link`);
    }
};


module.exports = { retrieveLinks };
