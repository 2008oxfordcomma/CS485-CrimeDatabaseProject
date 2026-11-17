let countries = {};
let trend;
// Fields displayed in the comparison table
const comparisonFields = [
    { label: "Region", key: "region" },
    { label: "Criminality Average", key: "criminality" },
    { label: "Criminal Markets Average", key: "markets" },
    { label: "Criminal Actors Average", key: "actors" },
    { label: "Resilience Average", key: "resilience" },
];


// HTML elements
const countryOne = document.getElementById("countryOne");
const countryTwo = document.getElementById("countryTwo");
const comparisonSearch = document.getElementById("comparisonSearch");
const comparisonRows = document.getElementById("comparisonRows");
const noResults = document.getElementById("noComparisonResults");


// Format displayed values
function formatValue(value) {
    if (value === null || value === undefined || value === "") {
        return "N/A";
    }

    if (typeof value === "number") {
        return value.toFixed(2);
    }

    return value;
}


// Create one comparison row
function createComparisonRow(field, firstCountry, secondCountry) {
    const row = document.createElement("div");
    row.className = "comparison-row";

    const fieldName = document.createElement("div");
    fieldName.className = "comparison-field";
    fieldName.textContent = field.label;

    const firstValue = document.createElement("div");
    firstValue.className = "comparison-value";
    firstValue.textContent = formatValue(
        firstCountry?.[field.key]
    );

    const secondValue = document.createElement("div");
    secondValue.className = "comparison-value";
    secondValue.textContent = formatValue(
        secondCountry?.[field.key]
    );

    row.appendChild(fieldName);
    row.appendChild(firstValue);
    row.appendChild(secondValue);

    return row;
}


// Display comparison data
function displayComparison() {
    const first = countries[countryOne.value];
    const second = countries[countryTwo.value];
    if (!first || !second) return;
    const year = first.editions.filter(a => second.editions.some(b => b.year === a.year)).at(-1)?.year;
    const summary = country => ({ region: country.region, ...country.editions.find(row => row.year === year) });
    const firstCountry = summary(first);
    const secondCountry = summary(second);
    document.querySelector('.comparison-note').textContent = year
        ? 'Comparing OCI scores for ' + year + '.'
        : 'These countries have no shared OCI edition.';
    if (trend) {
        const years = [...new Set([...first.editions, ...second.editions].map(row => row.year))].sort();
        trend.data.labels = years;
        trend.data.datasets = [first, second].map((country, i) => ({
            label: country.name, borderColor: ['#245486', '#ac542e'][i],
            data: years.map(y => country.editions.find(row => row.year === y)?.criminality ?? null)
        }));
        document.getElementById('trendCard').hidden = !years.length;
        trend.update();
    }

    const searchTerm = comparisonSearch.value.toLowerCase().trim();

    comparisonRows.innerHTML = "";

    const filteredFields = comparisonFields.filter(field =>
        field.label.toLowerCase().includes(searchTerm)
    );

    filteredFields.forEach(field => {
        const row = createComparisonRow(
            field,
            firstCountry,
            secondCountry
        );

        comparisonRows.appendChild(row);
    });

    noResults.hidden = filteredFields.length !== 0;
}


// Event listeners
countryOne.addEventListener("change", displayComparison);
countryTwo.addEventListener("change", displayComparison);
comparisonSearch.addEventListener("input", displayComparison);


loadCountryData().then(data => {
    countries = data;
    const list = Object.values(data);
    fillCountryList(countryOne, list, 'CA');
    fillCountryList(countryTwo, list, list.some(row => row.iso === 'US') ? 'US' : list[1]?.iso);
    if (!list.length) document.querySelector('.comparison-note').textContent = 'No countries available.';
    if (window.Chart) trend = new Chart(document.getElementById('comparisonTrend'), {
        type: 'line', data: {labels: [], datasets: []}, options: {scales: {y: {min: 0, max: 10}}}
    });
    displayComparison();
}).catch(() => {
    document.querySelector('.comparison-note').textContent = 'Unable to load countries. Check the database connection.';
});
