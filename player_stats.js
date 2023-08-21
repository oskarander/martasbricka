const db = firebase.database();
const playerList = document.querySelector('.player-list');

// Fetch data from Firebase
db.ref().on('value', snapshot => {
    const data = snapshot.val().events; // Adjusted to access events key
    const aggregatedData = aggregatePlayerData(data);
    displayAggregatedData(aggregatedData);
});

function aggregatePlayerData(data) {
    let playerStats = {};

    for (let year in data) {
        const participantsData = data[year].players; // Adjusted to access players key

        for (let participant in participantsData) {
            let details = participantsData[participant];

            if (!playerStats[participant]) {
                playerStats[participant] = {
                    totalPoints: 0,
                    totalGames: 0,
                    totalPlacement: 0,
                    validPlacementGames: 0,
                    wins: 0,
                    organizerCount: 0
                };
            }

            if (details.points && details.points !== "" && !isNaN(details.points)) {
                playerStats[participant].totalPoints += parseInt(details.points);
                playerStats[participant].totalGames++;
            }

            if (details.placement && details.placement !== "" && !isNaN(details.placement)) {
                playerStats[participant].totalPlacement += details.placement;
                playerStats[participant].validPlacementGames++;
                if (details.placement === 1.0) {  // Adjusted to compare with number
                    playerStats[participant].wins++;
                }
            }

            // Removed the organizer logic as it's not present in the provided JSON
        }
    }

    return playerStats;
}

function displayAggregatedData(playerStats) {
    for (let player in playerStats) {
        const stats = playerStats[player];
        const avgPoints = (stats.totalGames !== 0 ? (stats.totalPoints / stats.totalGames).toFixed(2) : "0");
        const avgPlacement = (stats.validPlacementGames !== 0 ? (stats.totalPlacement / stats.validPlacementGames).toFixed(2) : "0");
        const wins = stats.wins;

        displayPlayerStats(player, avgPoints, avgPlacement, wins);
    }
}

function displayPlayerStats(playerName, avgPoints, avgPlacement, wins) {
    const playerCard = document.createElement('div');
    playerCard.className = 'player-card';

    playerCard.innerHTML = `
        <strong>${playerName}</strong><br>
        Avg Points: ${avgPoints}<br>
        Avg Placement: ${avgPlacement}<br>
        Number of Wins: ${wins}<br>
    `;

    playerList.appendChild(playerCard);
}
