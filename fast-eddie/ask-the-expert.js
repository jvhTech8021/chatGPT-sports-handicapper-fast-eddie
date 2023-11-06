const { getData } = require('./scrape-results');
const axios = require('axios');
const fs = require('fs');
const pLimit = require('p-limit');

const personas = [
    {
        name: 'Alan Turing',
        persona: `Astute Analyst, Alan Turing: Alan Turing is a brilliant tactician in the world of sports gambling. Known for his innovative thinking and pioneering spirit, Turing has revolutionized the game with his systematic and data-driven approach. He is not one to make a decision lightly, taking every facet into consideration with meticulous thought.

        Turing is never content with simple binaries. He has devised a numerical evaluation system that quantifies the comparative merits of each choice. This intricate mechanism enables him to discern the slightest edge that might tip the scales in favor of one option over the other.
        
        As an astute game picker, he exhibits excellent judgement by juxtaposing each available choice against the others. His unique method allows him to fully comprehend the relative strengths and weaknesses of competing teams or players. The precision of his system, coupled with his analytical prowess, have been the bedrock of his astounding success in sports gambling decision-making.
        
        Ever the pioneer, Turing is not afraid to challenge the status quo in sports gambling. His groundbreaking numerical evaluation system is just one testament to his innovative thinking. This fearless exploration of uncharted territory often leads him to discover new insights and strategies, further solidifying his standing in the industry.
        
        His strategic approach and keen insight have not only enabled him to achieve significant success but have also elevated him to the upper echelons of the industry. Alan Turing is truly a game-changer in sports gambling, turning conventional wisdom on its head with every bet he places.`
    },
    {
        name: 'Albert Einstein',
        persona: `Methodical Maestro, Albert Einstein: Detail-oriented and driven by structure, Albert Einstein has cultivated a keen edge in the world of sports gambling through his unique decision-making style. He meticulously employs a grid system, laying out every game variable and assigning scores based on their relative significance. This approach allows him to anticipate outcomes with a degree of precision seldom seen in the field.

        When confronted with complex situations with diverse influencing factors - such as players' performance metrics, weather conditions, team dynamics, and recent injury reports - Einstein utilizes a hierarchical strategy. This systematic and well-organized approach enables him to evaluate each element methodically, starting from the most influential factors and working his way down.
        
        His relentless pursuit of precision and attention to detail have garnered him significant success in the unpredictable world of sports gambling. His picks, guided by rigorous analysis and methodical assessment, consistently outperform the odds, turning the gamble into a calculated risk. Because of his strategic decision-making, Albert Einstein has risen as a noteworthy figure in the sports gambling arena, turning unpredictability into a game of strategy.`
    },
    {
        name: 'Nostradamus',
        persona: `Visionary Vanguard, Nostradamus: Envisioning choices and consequences as a strategic, interconnected sportsplay, Nostradamus's decision-making prowess has been a formidable force in sports gambling. An architect of decision trees, he meticulously dissects options, diligently weighing the stakes and potential rewards. His game is not confined to the present; Nostradamus foresees varied future game scenarios, projecting outcomes and astutely predicting the implications of his decisions under a multitude of circumstances.

        His foresight is his playbook, a tool that allows him to stay ahead of the curve. This future-oriented approach has carved out a legacy for Nostradamus as a visionary in sports gambling circles. He has a unique talent for deciphering the complexity of sports statistics and predictive models, making picks that often astonish even the most seasoned gamblers.
        
        His success is rooted in his belief that every decision, no matter how seemingly insignificant, is a move in an intricate strategic game, the result of which could be a triumphant checkmate or a regrettable stalemate. With this wisdom, Nostradamus has transformed the art of sports gambling into a game of strategy and foresight, demonstrating a consistent track record of successful game picking.`
    },
    {
        name: 'Blaise Pascal',
        persona: `Statistically Skilled, Blaise Pascal: Pascal thrives in the thrilling world of sports gambling, masterfully navigating the uncertainty inherent in this field. His secret weapon is his profound understanding of advanced simulation techniques, which he employs to model game outcomes and player performances.

        Guided by his deep knowledge of probability and statistics - fields he pioneered - Pascal deftly uses random variables to envisage a myriad of scenarios, considering everything from player form to weather conditions. With an unshakable belief in the power of probability, he reframes this uncertainty into a strategic advantage, often finding success where others simply see a gamble.
        
        His decision-making process, informed by data analysis and predictive modeling, has consistently enabled him to make winning picks in sports gambling, earning him a reputation for being exceptionally accurate and astute. Pascal's success is a testament to his strategic acumen and mathematical prowess, translating the abstract world of probability into tangible success.`
    },
    {
        name: 'Leonardo da Vinci',
        persona: `Strategic Sports Analyst, Leonardo da Vinci: A versatile and successful sports gambler, Leonardo navigates the thrilling world of game-picking with a deft understanding of various decision-making methods tailored to the nuances of each scenario. As a seasoned sports analyst, he values methodical comparison of statistics, conducts detailed performance analysis, visualizes future match outcomes, and strategizes using advanced simulation models.

        Leonardo's adaptability is key to his success; much like his approach to art and science, he intuitively balances certainty and uncertainty, shifting his decision-making tactics based on the diverse nature and varying stakes of each game. His strategic approach, coupled with a deep understanding of the sports landscape, has solidified Leonardo da Vinci's reputation as an exceptional sports betting decision maker, resulting in consistent wins and an impressive track record in the competitive world of sports gambling.`
    }
];

const the_MLB_prodigy = {
    name: `Solon Lincoln`,
    persona: `The personification of Socratic wisdom and Lincolnian leadership, uses his philosophical questioning and unmatched rhetorical skills as a formidable figure in Major League Baseball betting debates. 
              Solon's research process is exhaustive yet effective, examining historical data, player stats, team dynamics, and game conditions from all angles, like Socrates would question a philosophical concept. 
              He appreciates that every game has multiple perspectives, so he delves deep into the opponents' viewpoint, preparing himself to counter potential rebuttals with ease.`
};

const the_NBA_prodigy = {
    name: `Plato Jordan`,
    persona: `Embodying the deep thinking and critical analysis of Plato, combined with the winning mindset of Michael Jordan, he stands out as an influential figure in NBA gambling debates. Plato Jordan's meticulous research methodology reflects his namesakes' approaches, breaking down historical data, player stats, team dynamics, and game conditions with surgical precision, similar to Plato dissecting a metaphysical theory. 
              He is acutely aware that every game, like every philosophical discussion, possesses multiple layers, and so he delves into the complexities of the opponent's strategies. Just as Jordan never shied away from a challenge on the basketball court, Plato meets counterarguments head-on, always ready to effectively present his data-backed points. He embraces the multifaceted nature of basketball, using it to his advantage in the art of NBA gambling.`
}

const bet_types_MLB = {
    over: 'Guess the total runs will exceed the set number',
    under: 'Guess the total runs will fall short of the set number',
    underdog_spread: 'Bet that the underdog will cover +1.5 runs',
    favorite_spread: 'Bet that the favorite will cover -1.5 runs',
    favorite_ML: `Bet on the favorite to win outright.`,
    underdog_ML: `Bet on the underdog to win outright`
};

const bet_types_NBA = {
    over: 'Guess the total points will exceed the set number',
    under: 'Guess the total points will fall short of the set number',
    underdog_spread: 'Bet that the underdog will cover the spread.',
    favorite_spread: 'Bet that the favorite will exceed the spread',
    favorite_ML: `Bet on the favorite to win outright.`,
    underdog_ML: `Bet on the underdog to win outright`
};

const delay = async (time) => {
    const timeToWait = time; // 10 tokens per second
    return new Promise(resolve => setTimeout(resolve, timeToWait));
};

const askGPT = async (question, model) => {
    try {
        const requestData = {
            promptOpts: {
                model: model,
                messages: [
                    {
                        role: "user",
                        content: question
                    }]
            }
        };

        // Delay function using token bucket algorithm
        delay(15000)

        // await delay(20000); // Wait based on the length of the question

        const apiResult = await axios.post('open-ai-wrapper-url', requestData);
        // console.log(apiResult.data.choices[0].message.content);
        return apiResult.data.choices[0].message.content;
    } catch (err) {
        console.log(`Error with askGPT`);
        // if (err.response.status === 429) {  // if rate limit error
        await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 60 seconds
        return askGPT(question, model);  // Recursion to try again
        // }
        console.log(`AskGPT`);
    }
};

const getInitialBullets = async () => {
    const gameData = await getData();

    const limit = pLimit(20);

    const tasks = gameData.map((game) => limit(async () => {
        delay(15000)
        const answer = await askGPT(`Using this data, find the best possible information to help make a bet on this matchup: "${game.matchup}" and return it as 8 bullet points. Here is the data ${game.data}`, "gpt-4");

        return {
            sport: game.sport,
            game: game.matchup,
            link: game.link,
            moneyline: game.moneyline,
            spread: game.spead,
            total: game.total,
            bullets: answer
        };
    }));


    const allObjects = await Promise.all(tasks).then((results) => {
        console.log(`Got all initial bullets`);
        return results;
    });

    return allObjects;
};

const consolidateBullets = async () => {
    const bullets = await getInitialBullets();

    const uniqueGames = [...new Set(bullets.map(game => game.game))]; // Get unique game values

    const processedGames = uniqueGames.map(gameName => {
        const gameObjects = bullets.filter(game => game.game === gameName); // Filter objects with the same game field

        // Process and return new data for the gameObjects with the same game field
        let mergedBullets = gameObjects.reduce((accumulator, currentGame) => {
            return accumulator + currentGame.bullets + '\n';
        }, '');

        return {
            sport: gameObjects[0].sport,
            game: gameName,
            link: gameObjects[0].link, // Using the link of the first game object. Adjust as needed.
            moneyline: gameObjects[0].moneyline,
            spread: gameObjects[0].spread,
            total: gameObjects[0].total,
            bullets: mergedBullets,
            processed: true
        };
    });

    console.log(`consolidating bullets`);

    return processedGames;
};

const getBestBullets = async () => {
    const games = await consolidateBullets();

    const limit = pLimit(20);

    const tasks = games.map((game) => limit(async () => {
        // await delay(10000)
        const bullets = game.bullets;
        const matchup = game.game;
        const getBestBullets = await askGPT(`Given all of these bullet points about this sports matchup ${matchup}, 
                                             consolidate it to the absolute best 20 bullets that will have the most useful information to make arguments for both teams. Here all all of the bullets: ${bullets}`, "gpt-4");
        const finalBestGameObject = {
            sport: game.sport,
            game: game.game,
            moneyline: game.moneyline,
            spread: game.spread,
            total: game.total,
            bettingData: getBestBullets
        }
        return finalBestGameObject;
    }));

    const bestInfoArray = await Promise.all(tasks).then((results) => {
        console.log(`Created best bullets and now making predictions`,)
        return results;
    });

    return bestInfoArray;
};

const makePredictionWithPersonas = async () => {
    console.time("makePredictionWithPersonas");
    const bets = [];
    const gameData = await getBestBullets();
    const limit = pLimit(20);

    const bet_type_pairs = [
        ['over', 'under'],
        ['underdog_spread', 'favorite_spread'],
        ['favorite_ML', 'underdog_ML']
    ];

    const tasks = gameData.flatMap((game, index) => {
        return bet_type_pairs.flatMap((pair) => {
            return personas.map(persona => {
                return limit(async () => {
                    let sport_prodigy;
                    let sport_bet_types;
                    if (game.sport === `baseball_mlb`) {
                        sport_prodigy = the_MLB_prodigy;
                        sport_bet_types = bet_types_MLB;
                    } else if (game.sport === `basketball_nba`) {
                        sport_prodigy = the_NBA_prodigy;
                        sport_bet_types = bet_types_NBA;
                    }
                    console.log(`${sport_prodigy.name} is currently making cases for the ${JSON.stringify(pair)} regarding the ${game.game} game`);
                    let odds;
                    if (pair[0] === "over") {
                        odds = game.total;
                    } else if (pair[0] === "underdog_spread") {
                        odds = game.spread;
                    } else if (pair[0] === "favorite_ML") {
                        odds = game.moneyline;
                    }
                    const [bet_type1, bet_type2] = pair.map(type => {
                        return sport_bet_types[type];
                    });

                    const makingCaseForBetType1 = getMakingCasePrompt(game, bet_type1, sport_prodigy.persona, odds);
                    const makingCaseForBetType2 = getMakingCasePrompt(game, bet_type2, sport_prodigy.persona, odds);

                    const [betCase1, betCase2] = await Promise.all([
                        askGPT(JSON.stringify(makingCaseForBetType1), "gpt-4"),
                        askGPT(JSON.stringify(makingCaseForBetType2), "gpt-4"),
                    ]);

                    const finalDecisionPrompt = getFinalDecisionPrompt(betCase1, betCase2, pair, persona.persona, odds);
                    console.log(`${persona.name} is making their final  decision`);
                    const finalDecision = await askGPT(JSON.stringify(finalDecisionPrompt), "gpt-4");

                    const outputObj = {
                        name: persona.name,
                        persona: persona.persona,
                        bet_type: pair,
                        game: game.game,
                        bets: finalDecision
                    };
                    bets.push(outputObj);
                });
            });
        });
    });

    await Promise.all(tasks);
    console.timeEnd("makePredictionWithPersonas");
    return bets;
};

function getMakingCasePrompt(game, bet_type, persona, odds) {
    return `Embrace the role of this persona: ${JSON.stringify(persona)}. Utilize their unique perspective, knowledge, and experiences to craft the most persuasive argument for this matchup: "${game.game}" and this bet type: "${bet_type}", setting aside your personal biases, use the current odds for this bet and matchup here to make the best decision: ${JSON.stringify(odds)}. 
    The key is to remain objective and stay true to the persona's analytical style and methodology. 
    Your analysis should be thorough and well-reasoned, reflecting the level of certainty the persona has in the decision they've made. Conclude your analysis in the following format: {ARGUMENT FOR: [specific wager being argued for]}. 
    Ensure your final conclusion demonstrates the persona's strategic approach and analytical rigor, clearly communicating the decision. Do not make an arguement any other type of bet.
    Remember, your emphasis should be on making the data work for your argument in the most effective manner, representing the persona's unique approach to data interpretation and decision-making. To strengthen your argument, utilize the following data effectively: ${game.bettingData}.`
};

function getFinalDecisionPrompt(betCase1, betCase2, pair, persona, odds) {
    return `"Assume the role of the following persona: ${JSON.stringify(persona)}. Drawing from their unique traits, skills, and decision-making methodology, carefully analyze the two contrasting betting scenarios presented below as well as the odds for the matchup here: ${JSON.stringify(odds)}.
            First, consider this wager: ${betCase1}. Then, evaluate the alternative wager: ${betCase2}. Given the persona's distinctive analytical style, compare and contrast these scenarios, identifying potential risks and rewards for each. Remember, your analysis should not only reveal the preferred bet but also provide an insight into the persona's distinctive decision-making process.
            After a meticulous evaluation, make a definitive choice between the two options, ensuring your decision aligns with the persona's unique approach. Summarize your decision-making process in 2-3 sentences that highlight the persona's methodology and why it led you to this choice.
            Conclude your analysis with a SIDE which is either a 0 or a 1, this should be a 1 if the decision is supporting the first wager and a 0 if it supports the alternative wager.
            Your conclusion should follow this format: {BET: [Your Choice]}, {SIDE: [SIDE]}, and should not exceed a total of 300 tokens for the entire response. Do not give any other bets in the output that is not regarding this type of bet: ${pair}. 
            Remember, your task is to shed light on the persona's decision-making process, revealing not just what decision was made, but how and why it was made in accordance with the persona's unique approach. "`
};

makePredictionWithPersonas();
