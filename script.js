// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyDC2PVWM-AH8supToCmYS_uzhVXF9C8hJY",
    authDomain: "martasbricka.firebaseapp.com",
    databaseURL: "https://martasbricka-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "martasbricka",
    storageBucket: "martasbricka.appspot.com",
    messagingSenderId: "459874035548",
    appId: "1:459874035548:web:85e519ab911b207f18c399"
};
firebase.initializeApp(firebaseConfig);

const db = firebase.database();
const timeline = document.querySelector('.timeline');

let playerWins = {};
let playerAveragePlacement = {};
let playerTotalPlacements = {};
let playerTotalPoints = {};
let totalFirstPlacePoints = 0;
let totalYears = 0;

function displayYearlyData(year, location, dinnerLocation, noteworthy, playersData) {
    const entry = document.createElement('div');
    entry.className = 'player-card';

    const circle = document.createElement('div');
    circle.className = 'timeline-circle';
    entry.appendChild(circle);

    const label = document.createElement('span');
    label.className = 'timeline-label';

    // Extract winner (player with placement 1)
    let winnerEntry = Object.entries(playersData).find(([player, details]) => details && details.placement === 1.0);
    let winner = winnerEntry ? winnerEntry[0] : "Unknown";
    let allPlayers = Object.keys(playersData).join(', ');

    label.innerHTML = `
        <strong>${year}</strong><br>
        Winner: ${winner}<br>
        Location: ${location || 'Unknown'}<br>
        Players: ${allPlayers}<br>
        Dinner Location: ${dinnerLocation || 'Unknown'}<br>
        Noteworthy: ${noteworthy || 'None'}
    `;
    entry.appendChild(label);

    timeline.appendChild(entry);
}

function processAndDisplayData(data) {
    for (let year in data.events) {
        totalYears++;
        const eventData = data.events[year];

        let location = eventData.location;
        let dinnerLocation = eventData.dinner_location;
        let noteworthy = eventData.noteworthy;
        let playersData = eventData.players;

        for (let player in playersData) {
            let details = playersData[player];
            let placement = details.placement;

            if (placement !== undefined && placement !== "") {
                playerTotalPlacements[player] = (playerTotalPlacements[player] || 0) + 1;
                playerAveragePlacement[player] = (playerAveragePlacement[player] || 0) + placement;
            }

            if (details.points !== undefined && details.points !== "") {
                playerTotalPoints[player] = (playerTotalPoints[player] || 0) + parseInt(details.points);
            }

            if (placement === 1.0) {
                playerWins[player] = (playerWins[player] || 0) + 1;
                totalFirstPlacePoints += (details.points !== undefined && details.points !== "") ? parseInt(details.points) : 0; 
            }
        }

        displayYearlyData(year, location, dinnerLocation, noteworthy, playersData);
    }

    let mostWinsPlayer = Object.keys(playerWins).reduce((a, b) => playerWins[a] > playerWins[b] ? a : b);
    let averageWinPoints = (totalFirstPlacePoints / totalYears).toFixed(2);

    // Filter out players who have only 1 event and then find the favourite based on average points.
    let favouriteToWinPlayer = Object.keys(playerTotalPoints)
        .filter(player => playerTotalPlacements[player] > 1)
        .reduce((a, b) => (playerTotalPoints[a] / playerTotalPlacements[a]) > (playerTotalPoints[b] / playerTotalPlacements[b]) ? a : b);

    displaySummaryCard(mostWinsPlayer, favouriteToWinPlayer, averageWinPoints);
}

function displaySummaryCard(mostWinsPlayer, favouriteToWinPlayer, averageWinPoints) {
    const summaryCard = document.createElement('div');
    summaryCard.className = 'player-card';

    summaryCard.innerHTML = `
        <strong>Summary Statistics:</strong><br>
        Most Wins: ${mostWinsPlayer} (${playerWins[mostWinsPlayer]} wins)<br>
        Highest Avg score: ${favouriteToWinPlayer} (Avg Score: ${(playerTotalPoints[favouriteToWinPlayer] / playerTotalPlacements[favouriteToWinPlayer]).toFixed(2)})<br>
        Average winner points: ${averageWinPoints} points<br>
    `;

    const parentContainer = timeline.parentElement;
    parentContainer.insertBefore(summaryCard, timeline);
}

// Fetch data from Firebase (moved to the bottom to ensure functions are defined first)
db.ref().on('value', snapshot => {
    const data = snapshot.val();
    processAndDisplayData(data);
});
