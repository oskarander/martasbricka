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

            if (placement && !isNaN(placement)) {
                playerTotalPlacements[player] = (playerTotalPlacements[player] || 0) + 1;
                playerAveragePlacement[player] = (playerAveragePlacement[player] || 0) + placement;
            }

            if (details.points && !isNaN(details.points)) {
                playerTotalPoints[player] = (playerTotalPoints[player] || 0) + parseInt(details.points);
            }

            if (placement === 1.0) {
                playerWins[player] = (playerWins[player] || 0) + 1;
                totalFirstPlacePoints += playerTotalPoints[player];
            }
        }

        displayYearlyData(year, location, dinnerLocation, noteworthy, playersData);
    }

    let mostWinsPlayer = Object.keys(playerWins).reduce((a, b) => playerWins[a] > playerWins[b] ? a : b);
    let mostLikelyToWinPlayer = Object.keys(playerAveragePlacement).reduce((a, b) => (playerAveragePlacement[a] / playerTotalPlacements[a]) < (playerAveragePlacement[b] / playerTotalPlacements[b]) ? a : b);
    let averageWinPoints = (totalFirstPlacePoints / totalYears).toFixed(2);

    displaySummaryCard(mostWinsPlayer, mostLikelyToWinPlayer, averageWinPoints);
}

function displaySummaryCard(mostWinsPlayer, mostLikelyToWinPlayer, averageWinPoints) {
    const summaryCard = document.createElement('div');
    summaryCard.className = 'player-card';

    summaryCard.innerHTML = `
        <strong>Summary Statistics:</strong><br>
        Player with the Most Wins: ${mostWinsPlayer} (${playerWins[mostWinsPlayer]} wins)<br>
        Player Most Likely to Win (based on avg placement): ${mostLikelyToWinPlayer} (Avg Placement: ${(playerAveragePlacement[mostLikelyToWinPlayer] / playerTotalPlacements[mostLikelyToWinPlayer]).toFixed(2)})<br>
        Average Points Needed to Win: ${averageWinPoints} points<br>
    `;

    const parentContainer = timeline.parentElement;
    parentContainer.insertBefore(summaryCard, timeline);
}

// Fetch data from Firebase (moved to the bottom to ensure functions are defined first)
db.ref().on('value', snapshot => {
    const data = snapshot.val();
    processAndDisplayData(data);
});
