const axios = require('axios');

const sports = [
    // 'americanfootball_ncaaf',
    // 'americanfootball_nfl',
    'baseball_mlb',
    // 'basketball_nba',
    // 'basketball_ncaab',
    // 'icehockey_nhl'
]

const getGames = async (sport) => {
    try {
        const upcomingGames = [];
        const markets = ['h2h', 'spreads', 'totals']
        const api_key = '97e61e18193a3518624c1dbee3a323f6'; // Don't forget to secure your API keys
        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${api_key}&regions=us&markets=h2h,spreads,totals&dateFormat=iso&oddsFormat=american`);

        const games = response.data;

        const today = new Date();
        const now = new Date();
        const todayString = today.toLocaleDateString(); // get today's date in local format
        let count = 0;

        games.forEach((game) => {
            // console.log(game);
            const gameDate = new Date(game.commence_time); // create Date object directly from ISO string
            const gameDateString = gameDate.toLocaleDateString(); // get game's date in local format

            if (gameDateString === todayString && gameDate.getTime() > now.getTime()) {
                upcomingGames.push(game);
            }

            // upcomingGames.push(game);
        })

        return upcomingGames;

    } catch (error) {
        console.error(error);
    }
};

const getAllUpcomingGames = async () => {
    const allUpcomingGames = [];
    const matchups = [];
    for (const sport of sports) {
        const upcomingGames = await getGames(sport);
        allUpcomingGames.push(...upcomingGames);
    }
    if (allUpcomingGames.length < 1) {
        console.log(`There are no games on today`);
        return;
    } else {
        allUpcomingGames.map((game) => {
            const matchup = {
                sport: game.sport_key,
                away: game.away_team,
                home: game.home_team,
                starts: game.commence_time,
                moneyline: [game.bookmakers[0].markets[0].outcomes[0], game.bookmakers[0].markets[0].outcomes[1]],
                spread: [game.bookmakers[0].markets[1].outcomes[0], game.bookmakers[0].markets[1].outcomes[1]],
                total: [game.bookmakers[0].markets[2].outcomes[0], game.bookmakers[0].markets[2].outcomes[1]]
            };
            matchups.push(matchup);
        });
        console.log(`Researching the following ${matchups.length} matchups:`);
        console.log(matchups);
        return matchups;
    }
}

module.exports = { getAllUpcomingGames };
