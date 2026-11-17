async function loadCountryData(iso) {
    const query = iso ? '?iso=' + encodeURIComponent(iso) : '';
    const response = await fetch('countryQuery.php' + query);
    if (!response.ok) throw new Error('Country data is unavailable.');
    return response.json();
}

function fillCountryList(select, countries, preferred) {
    select.replaceChildren(...countries.map(country => new Option(country.name, country.iso)));
    if (countries.some(country => country.iso === preferred)) select.value = preferred;
}
