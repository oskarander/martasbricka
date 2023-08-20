const db = firebase.database();
const playerList = document.querySelector('.player-list');

// Fetch data from Firebase
db.ref().on('value', snapshot => {
    const data = snapshot.val();
    const aggregatedData = aggregatePlayerData(data);
    displayAggregatedData(aggregatedData);
});

function aggregatePlayerData(data) {
    let playerStats = {};

    for (let year in data) {
        const participantsData = data[year];

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

            if (details.points && !isNaN(details.points)) {
                playerStats[participant].totalPoints += parseInt(details.points);
                playerStats[participant].totalGames++;
            }

            if (details.placement && !isNaN(details.placement)) {
                playerStats[participant].totalPlacement += parseInt(details.placement);
                playerStats[participant].validPlacementGames++;
                if (details.placement === "1") {
                    playerStats[participant].wins++;
                }
            }

            if (details.organiser && details.organiser.toLowerCase() === "yes") {
                playerStats[participant].organizerCount++;
            }
        }
    }

    return playerStats;
}

function displayAggregatedData(playerStats) {
    for (let player in playerStats) {
        const stats = playerStats[player];
        const avgPoints = (stats.totalPoints / stats.totalGames).toFixed(2);
        const avgPlacement = (stats.totalPlacement / stats.validPlacementGames).toFixed(2);
        const wins = stats.wins;
        const organizerCount = stats.organizerCount;

        displayPlayerStats(player, avgPoints, avgPlacement, wins, organizerCount);
    }
}

function displayPlayerStats(playerName, avgPoints, avgPlacement, wins, organizerCount) {
    const playerCard = document.createElement('div');
    playerCard.className = 'player-card';

    playerCard.innerHTML = `
        <strong>${playerName}</strong><br>
        Avg Points: ${avgPoints}<br>
        Avg Placement: ${avgPlacement}<br>
        Number of Wins: ${wins}<br>
        Organiser: ${organizerCount} times
    `;

    playerList.appendChild(playerCard);
}
