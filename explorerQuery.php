<?php
// Author: Dre Harm
// Date: 11/15/26

const PAGE_SIZE = 50;

function getInt1($name) { // php has a function named getInt already so I needed a different name but don't know what else to call it
    $value = $_GET[$name] ?? '';
    return (is_string($value) && ctype_digit($value)) ? (int) $value : null;
}

// gets the filter to use from the url
function getText($name) {
    $value = $_GET[$name] ?? '';
    return (is_string($value) && $value !== '') ? $value : null;
}

function fetchOptions($pdo, $sql) {
    return $pdo->query($sql)->fetchAll(PDO::FETCH_KEY_PAIR);
}

function getDropdownOptions($pdo) {
    return [
        'countries' => fetchOptions($pdo, 'SELECT country_id, country_name FROM countries ORDER BY country_name'),
        'regions' => fetchOptions($pdo, 'SELECT region_id, region_name FROM regions ORDER BY region_name'),
        'oc_years' => fetchOptions($pdo, 'SELECT DISTINCT year, year FROM ocindex_country_year ORDER BY year DESC'),
        'markets' => fetchOptions($pdo, 'SELECT market_id, market_name FROM ocindex_market_lookup ORDER BY market_name'),
        'exploit' => fetchOptions($pdo, 'SELECT exploit_type_id, exploit_type_name FROM ctdc_exploitation_types ORDER BY exploit_type_name'),
        'ctdc_years' => fetchOptions($pdo, 'SELECT DISTINCT year_of_registration, year_of_registration FROM ctdc_victims WHERE year_of_registration IS NOT NULL ORDER BY year_of_registration'),
        'genders' => fetchOptions($pdo, 'SELECT DISTINCT gender, gender FROM ctdc_victims WHERE gender IS NOT NULL ORDER BY gender'),
        'ages' => fetchOptions($pdo, 'SELECT DISTINCT age_broad, age_broad FROM ctdc_victims WHERE age_broad IS NOT NULL ORDER BY age_broad'),
        'majority' => fetchOptions($pdo, 'SELECT DISTINCT majority_status, majority_status FROM ctdc_victims WHERE majority_status IS NOT NULL ORDER BY majority_status')
    ];
}

function CTDCQuery() {
    $where = [];
    $params = [];

    if (getInt1('citizenship') !== null) {
        $where[] = 'v.citizenship_id = :citizenship';
        $params[':citizenship'] = getInt1('citizenship');
    }

    if (getInt1('exploited_in') !== null) {
        $where[] = 'v.exploitation_country_id = :exploited_in';
        $params[':exploited_in'] = getInt1('exploited_in');
    }

    if (getInt1('year') !== null) {
        $where[] = 'v.year_of_registration = :year';
        $params[':year'] = getInt1('year');
    }

    if (getText('gender') !== null) {
        $where[] = 'v.gender = :gender';
        $params[':gender'] = getText('gender');
    }

    if (getText('age') !== null) {
        $where[] = 'v.age_broad = :age';
        $params[':age'] = getText('age');
    }

    if (getText('majority') !== null) {
        $where[] = 'v.majority_status = :majority';
        $params[':majority'] = getText('majority');
    }

    if (getInt1('exploit_type') !== null) {
        $where[] = 'v.victim_id IN (SELECT victim_id FROM ctdc_victim_exploitation WHERE exploit_type_id = :exploit_type)';
        $params[':exploit_type'] = getInt1('exploit_type');
    }

    $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    return [
        'columns' => [
            'victim_id' => 'Victim ID',
            'year' => 'Year',
            'datasource' => 'Data source',
            'gender' => 'Gender',
            'age_broad' => 'Age group',
            'majority' => 'Majority status',
            'citizenship' => 'Citizenship',
            'exploited_in' => 'Country of exploitation',
            'exploitation' => 'Exploitation type'
        ],
        'select' => "v.victim_id,
                     v.year_of_registration AS year,
                     v.datasource,
                     v.gender,
                     v.age_broad,
                     v.majority_status AS majority,
                     cc.country_name AS citizenship,
                     ce.country_name AS exploited_in,
                     (SELECT GROUP_CONCAT(t.exploit_type_name ORDER BY t.exploit_type_name SEPARATOR ', ')
                      FROM ctdc_victim_exploitation ve
                      JOIN ctdc_exploitation_types t ON t.exploit_type_id = ve.exploit_type_id
                      WHERE ve.victim_id = v.victim_id) AS exploitation",
        'from'   => "FROM ctdc_victims v
                     LEFT JOIN countries cc ON cc.country_id = v.citizenship_id
                     LEFT JOIN countries ce ON ce.country_id = v.exploitation_country_id
                     $whereSql",
        'order'  => 'v.victim_id',
        'params' => $params,
    ];
}

function GOCIQuery($markets) {
    $where = [];
    $params = [];

    if (getInt1('country') !== null) {
        $where[] = 'c.country_id = :country';
        $params[':country'] = getInt1('country');
    }
    if (getInt1('region') !== null) {
        $where[] = 'c.region_id = :region';
        $params[':region'] = getInt1('region');
    }

    if (getInt1('year') !== null) {
        $where[] = 'y.year = :year';
        $params[':year'] = getInt1('year');
    }

    $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $columns = [
        'country' => 'Country',
        'region' => 'Region',
        'year' => 'Year',
        'criminality' => 'Criminality',
        'criminal_markets' => 'Criminal markets',
        'criminal_actors' => 'Criminal actors',
        'resilience' => 'Resilience',
    ];
    $select = 'c.country_name AS country,
               r.region_name AS region,
               y.year,
               y.criminality_avg AS criminality,
               y.criminal_markets_avg AS criminal_markets,
               y.criminal_actors_avg AS criminal_actors,
               y.resilience_avg AS resilience';
    $marketJoin = '';

    $marketId = getInt1('market');
    if ($marketId !== null && isset($markets[$marketId])) {
        $columns['market_score'] = $markets[$marketId];
        $select .= ', ms.score AS market_score';
        $marketJoin = 'LEFT JOIN ocindex_market_scores ms ON ms.country_year_id = y.id AND ms.market_id = :market';
        $params[':market'] = $marketId;
    }

    return [
        'columns' => $columns,
        'select'  => $select,
        'from'    => "FROM ocindex_country_year y JOIN countries c ON c.country_id = y.country_id 
                      LEFT JOIN regions r ON r.region_id = c.region_id $marketJoin $whereSql",
        'order'   => 'c.country_name, y.year DESC',
        'params'  => $params,
    ];
}
?>
