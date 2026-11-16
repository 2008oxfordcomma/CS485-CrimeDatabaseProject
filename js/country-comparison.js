

// Author: Benjamin Nguyen
// Date: 11/16/26

// =====================================
// COUNTRY COMPARISON PAGE
// Demonstration data only
// Replace with database values later
// =====================================

const comparisonData = {
    "Canada": {
    region: "Americas",
    criminality: 4.5,
    markets: 4.2,
    actors: 4.8,
    resilience: 6.9
    },

    "United States": {
    region: "Americas",
    criminality: 5.8,
    markets: 6.1,
    actors: 5.5,
    resilience: 6.4
    },

    "Germany": {
    region: "Europe",
    criminality: 4.2,
    markets: 4.0,
    actors: 4.4,
    resilience: 7.2
    },

    "Japan": {
    region: "Asia",
    criminality: 3.8,
    markets: 3.5,
    actors: 4.1,
    resilience: 7.8
    }
};


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
        return value.toFixed(1);
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
        comparisonData[firstCountry]?.[field.key]
    );

    const secondValue = document.createElement("div");
    secondValue.className = "comparison-value";
    secondValue.textContent = formatValue(
        comparisonData[secondCountry]?.[field.key]
    );

    row.appendChild(fieldName);
    row.appendChild(firstValue);
    row.appendChild(secondValue);

    return row;
}


// Display comparison data
function displayComparison() {
    const firstCountry = countryOne.value;
    const secondCountry = countryTwo.value;

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


// Initial display
displayComparison();
