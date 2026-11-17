// Author: Dre Harm
// Date: 11/13/26

// I got the svg from this website https://simplemaps.com/resources/svg-world
// it includes some of the country codes already but I did have to map the missing ones.
// due to the way the svg was made, there are some countries drawn in multiple pieces so I made them into a classes
const CLASS_TO_ISO = {
    "American Samoa": "AS", 
    "Angola": "AO", 
    "Antigua and Barbuda": "AG",
    "Argentina": "AR", 
    "Australia": "AU", 
    "Azerbaijan": "AZ", 
    "Bahamas": "BS",
    "Canada": "CA", 
    "Canary Islands (Spain)": "ES", 
    "Cape Verde": "CV",
    "Cayman Islands": "KY", 
    "Chile": "CL", 
    "China": "CN", 
    "Comoros": "KM",
    "Cyprus": "CY", 
    "Denmark": "DK", 
    "Faeroe Islands": "FO", 
    "Falkland Islands": "FK",
    "Federated States of Micronesia": "FM", 
    "Fiji": "FJ", 
    "France": "FR",
    "French Polynesia": "PF", 
    "Greece": "GR", 
    "Guadeloupe": "GP", 
    "Indonesia": "ID",
    "Italy": "IT", 
    "Japan": "JP", 
    "Malaysia": "MY", 
    "Malta": "MT", 
    "Mauritius": "MU",
    "New Caledonia": "NC", 
    "New Zealand": "NZ", 
    "Northern Mariana Islands": "MP",
    "Norway": "NO", 
    "Oman": "OM", 
    "Papua New Guinea": "PG", 
    "Philippines": "PH",
    "Puerto Rico": "PR", 
    "Russian Federation": "RU", 
    "Saint Kitts and Nevis": "KN",
    "Samoa": "WS", 
    "Seychelles": "SC", 
    "Solomon Islands": "SB",
    "São Tomé and Principe": "ST", 
    "Tonga": "TO", 
    "Trinidad and Tobago": "TT",
    "Turkey": "TR", 
    "Turks and Caicos Islands": "TC", 
    "United Kingdom": "GB",
    "United States": "US", 
    "United States Virgin Islands": "VI", 
    "Vanuatu": "VU",
};

const gap = 15; 
const map = document.getElementById("worldMap");
const popup = document.getElementById("mapPopup");
const shapesByIso = {}; // i'm using a key values pair whose key is the iso and the value is a list of paths that draws that country

map.querySelectorAll("path").forEach((path) => { // based on each contries shape, it maps the country in the database
    const iso = path.id || CLASS_TO_ISO[path.getAttribute("class")];
    if (!iso || !COUNTRY_DATA[iso]) return;

    path.dataset.iso = iso;
    path.classList.add("in-db");
    (shapesByIso[iso] ||= []).push(path);
});


function showPopup(iso) {
    const country = COUNTRY_DATA[iso];
    popup.replaceChildren();

    const name = document.createElement("div");
    name.className = "popup-name";
    name.textContent = country.name;
    popup.append(name);

    const label = document.createElement("div");
    label.className = "popup-label";
    const value = document.createElement("div");
    value.className = "popup-value";

    if (country.criminality !== null) {
        label.textContent = `Criminality score (${LATEST_YEAR})`;
        value.textContent = `${Number(country.criminality).toFixed(2)} / 10`;
    } else label.textContent = "Not scored by the OC Index";
    
    popup.append(label, value);
    popup.hidden = false;
}

// this just moves the popup away from the where the cursor is
function movePopup(event) {
    popup.style.left = `${event.clientX + gap}px`;
    popup.style.top = `${event.clientY + gap}px`;
}

// changes the css tag of the country, gotta love compact functions in js
const setHighlight = (iso, on) => shapesByIso[iso].forEach((p) => p.classList.toggle("hovered", on)); 

map.addEventListener("mouseover", (event) => {
    const path = event.target.closest("path.in-db");
    if (!path) return;
    setHighlight(path.dataset.iso, true);
    showPopup(path.dataset.iso);
    movePopup(event);
});

map.addEventListener("mousemove", (event) => {
    if (!popup.hidden) movePopup(event);
});

map.addEventListener("mouseout", (event) => {
    const path = event.target.closest("path.in-db");
    if (!path) return;
    setHighlight(path.dataset.iso, false);
    popup.hidden = true;
});

map.addEventListener('click', event => {
    const path = event.target.closest('path.in-db');
    if (path) location.href = 'index.html?iso=' + encodeURIComponent(path.dataset.iso);
});
