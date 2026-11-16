
// Author: Benjamin Nguyen
// Date: 11/16/26

// ========================================
// 1. DEMONSTRATION DATA
// Replace these values with MySQL data later.
// OCI assessment years: 2021, 2023, 2025
// All numerical values below are illustrative.
// ========================================

const countryData = {
    Canada: {
        region: "Americas",
        criminality: 4.5,
        markets: 4.2,
        actors: 4.8,
        resilience: 6.9,

        years: [2021, 2023, 2025],
        criminalityTrend: [4.3, 4.5, 4.5],
        resilienceTrend: [6.7, 6.8, 6.9],

        marketScores: [5.2, 4.8, 4.1, 6.3, 5.5, 4.7],
        trafficking: [120, 160, 190]
    },

    "United States": {
        region: "Americas",
        criminality: 5.8,
        markets: 6.1,
        actors: 5.5,
        resilience: 6.4,

        years: [2021, 2023, 2025],
        criminalityTrend: [5.5, 5.7, 5.8],
        resilienceTrend: [6.5, 6.4, 6.4],

        marketScores: [6.2, 5.8, 5.1, 7.0, 6.5, 5.7],
        trafficking: [210, 250, 300]
    },

    Germany: {
        region: "Europe",
        criminality: 4.2,
        markets: 4.0,
        actors: 4.4,
        resilience: 7.2,

        years: [2021, 2023, 2025],
        criminalityTrend: [4.0, 4.2, 4.2],
        resilienceTrend: [7.0, 7.1, 7.2],

        marketScores: [4.5, 4.0, 3.8, 4.5, 4.2, 4.0],
        trafficking: [90, 120, 150]
    },

    Japan: {
        region: "Asia",
        criminality: 3.8,
        markets: 3.5,
        actors: 4.1,
        resilience: 7.8,

        years: [2021, 2023, 2025],
        criminalityTrend: [3.7, 3.8, 3.8],
        resilienceTrend: [7.6, 7.7, 7.8],

        marketScores: [3.8, 3.5, 3.2, 3.9, 3.7, 3.5],
        trafficking: [70, 95, 125]
    }
};


// ========================================
// 2. COUNTRY SELECTOR
// ========================================

const countrySelect = document.getElementById("countrySelect");
const countrySearch = document.getElementById("countrySearch");

function populateCountries(search = "") {

    const currentSelection = countrySelect.value;

    countrySelect.innerHTML =
        '<option value="">Select a country</option>';

    Object.keys(countryData)
        .filter(country =>
            country.toLowerCase().includes(search.toLowerCase())
        )
        .forEach(country => {

            const option = document.createElement("option");

            option.value = country;
            option.textContent = country;

            countrySelect.appendChild(option);
        });

    // Preserve the selected country if it is still visible.
    if (Object.keys(countryData).includes(currentSelection) &&
        currentSelection.toLowerCase().includes(search.toLowerCase())) {

        countrySelect.value = currentSelection;
    }
}

// Filter countries as the user types.
countrySearch.addEventListener("input", function () {
    populateCountries(this.value);
});


// ========================================
// 3. CHART CONFIGURATION
// ========================================

// Create separate chart options for each chart.
function getChartOptions(isScoreChart = true) {

    return {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                display: false
            }
        },

        scales: {
            x: {
                ticks: {
                    color: "#94a3b8"
                },
                grid: {
                    display: false
                }
            },

            y: {
                beginAtZero: true,
                max: isScoreChart ? 10 : undefined,

                ticks: {
                    color: "#94a3b8"
                },

                grid: {
                    color: "rgba(148,163,184,0.1)"
                }
            }
        }
    };
}


// ========================================
// 4. CREATE LINE CHARTS
// ========================================

function createLineChart(id, label, color, isScoreChart = true) {

    const canvas = document.getElementById(id);

    if (!canvas) {
        console.error("Chart canvas not found:", id);
        return null;
    }

    return new Chart(canvas, {

        type: "line",

        data: {
            labels: [],

            datasets: [{
                label: label,
                data: [],

                borderColor: color,
                backgroundColor: "rgba(0, 0, 0, 0.10)",

                borderWidth: 2,
                fill: true,
                tension: 0.3,

                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },

        options: getChartOptions(isScoreChart)
    });
}


// ========================================
// 5. INITIALIZE CHARTS
// ========================================

// Criminality trend
const criminalityChart = createLineChart(
    "criminalityChart",
    "Criminality",
    "#000000"
);

// Resilience trend
const resilienceChart = createLineChart(
    "resilienceChart",
    "Resilience",
    "#000000"
);

// Human trafficking records
const traffickingChart = createLineChart(
    "victimRegistrationChart",
    "CTDC Records",
    "#000000",
    false
);


// Criminal market distribution
const marketCanvas = document.getElementById("marketDistributionChart");

let marketChart = null;

if (marketCanvas) {

    marketChart = new Chart(marketCanvas, {

        type: "bar",

        data: {
            labels: [
                "Human Trafficking",
                "Human Smuggling",
                "Arms Trafficking",
                "Drug Trafficking",
                "Financial Crimes",
                "Cyber-Dependent Crimes"
            ],

            datasets: [{
                label: "Market Score",
                data: [],

                backgroundColor: "rgba(0, 0, 0, 0.10)",
                borderRadius: 4
            }]
        },

        options: {
            ...getChartOptions(),

            indexAxis: "y"
        }
    });

} else {
    console.error("Market chart canvas not found.");
}


// ========================================
// 6. DISPLAY SELECTED COUNTRY
// ========================================

function displayCountry(country) {

    const data = countryData[country];

    if (!data) {
        console.error("Country data not found:", country);
        return;
    }

    // Update country information.
    document.getElementById("countryName").textContent = country;

    document.getElementById("countryRegion").textContent =
        "Region: " + data.region;

    // Update summary statistics.
    document.getElementById("criminalityScore").textContent =
        data.criminality.toFixed(1);

    document.getElementById("marketsScore").textContent =
        data.markets.toFixed(1);

    document.getElementById("actorsScore").textContent =
        data.actors.toFixed(1);

    document.getElementById("resilienceScore").textContent =
        data.resilience.toFixed(1);


    // Update criminality chart.
    if (criminalityChart) {

        criminalityChart.data.labels = data.years;

        criminalityChart.data.datasets[0].data =
            data.criminalityTrend;

        criminalityChart.update();
    }


    // Update resilience chart.
    if (resilienceChart) {

        resilienceChart.data.labels = data.years;

        resilienceChart.data.datasets[0].data =
            data.resilienceTrend;

        resilienceChart.update();
    }


    // Update criminal market chart.
    if (marketChart) {

        marketChart.data.datasets[0].data =
            data.marketScores;

        marketChart.update();
    }


    // Update trafficking records chart.
    if (traffickingChart) {

        traffickingChart.data.labels = data.years;

        traffickingChart.data.datasets[0].data =
            data.trafficking;

        traffickingChart.update();
    }

    console.log("Displayed country:", country);
}


// ========================================
// 7. COUNTRY SELECTION
// ========================================

countrySelect.addEventListener("change", function () {

    if (this.value) {
        displayCountry(this.value);
    }
});


// ========================================
// 8. INITIALIZE PAGE
// ========================================

populateCountries();

// Display Canada by default.
countrySelect.value = "Canada";

displayCountry("Canada");
