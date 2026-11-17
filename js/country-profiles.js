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

    if (!canvas || !window.Chart) {
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

if (marketCanvas && window.Chart) {

    marketChart = new Chart(marketCanvas, {

        type: "bar",

        data: {
            labels: [],

            datasets: [{
                label: "Market Score",
                data: [],

                backgroundColor: "rgba(0, 0, 0, 0.10)",
                borderRadius: 4
            }]
        },

        options: {
            ...getChartOptions(false),
            scales: { x: { min: 0, max: 10 } },

            indexAxis: "y"
        }
    });

} else {
    console.error("Market chart canvas not found.");
}


// ========================================
const select = document.getElementById('countrySelect');
const search = document.getElementById('countrySearch');
const region = document.getElementById('countryRegion');
let countries = {};
let revision = 0;

function plot(chart, labels, values) {
    if (!chart) return;
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update();
}

async function showProfile() {
    const request = ++revision;
    const country = countries[select.value];
    const editions = country?.editions ?? [];
    const latest = editions.at(-1);
    document.getElementById('countryName').textContent = country?.name ?? 'No matching country';
    region.textContent = country ? 'Region: ' + (country.region ?? 'N/A') +
        (latest ? ' · OCI ' + latest.year : ' · No OCI edition available') : '';
    for (const key of ['criminality', 'markets', 'actors', 'resilience']) {
        document.getElementById(key + 'Score').textContent = latest?.[key]?.toFixed(2) ?? 'N/A';
    }
    const years = editions.map(row => row.year);
    plot(criminalityChart, years, editions.map(row => row.criminality));
    plot(resilienceChart, years, editions.map(row => row.resilience));
    plot(marketChart, [], []);
    plot(traffickingChart, [], []);
    if (!country) return;
    try {
        const {markets, records} = await loadCountryData(country.iso);
        if (request !== revision) return;
        plot(marketChart, markets.map(row => row.market_name), markets.map(row => row.score));
        plot(traffickingChart, records.map(row => row.year), records.map(row => row.total));
        if (!markets.length) region.textContent += ' · No market scores';
        if (!records.length) region.textContent += ' · No dated CTDC records';
    } catch {
        if (request === revision) region.textContent += ' · Unable to load market and trafficking data.';
    }
}

function filterCountries(preferred) {
    const matches = Object.values(countries).filter(country =>
        country.name.toLowerCase().includes(search.value.trim().toLowerCase()));
    fillCountryList(select, matches, preferred);
    showProfile();
}
select.addEventListener('change', showProfile);
search.addEventListener('input', () => filterCountries(select.value));
loadCountryData().then(data => {
    countries = data;
    filterCountries(new URLSearchParams(location.search).get('iso') || 'CA');
}).catch(() => { region.textContent = 'Unable to load countries. Check the database connection.'; });
