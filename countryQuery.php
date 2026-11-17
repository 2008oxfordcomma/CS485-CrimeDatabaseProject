<?php
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
try {
    require __DIR__ . '/database.php';
    if (!$pdo) {
        throw new RuntimeException('Database unavailable');
    }
    $countries = $pdo->query('SELECT c.country_id, c.iso_alpha2 AS iso, c.country_name AS name,
        r.region_name AS region FROM countries c LEFT JOIN regions r ON r.region_id = c.region_id
        ORDER BY c.country_name')->fetchAll();
    $editions = $pdo->query('SELECT id, country_id, year, criminality_avg AS criminality,
        criminal_markets_avg AS markets, criminal_actors_avg AS actors, resilience_avg AS resilience
        FROM ocindex_country_year ORDER BY country_id, year')->fetchAll();
    $byCountry = [];
    foreach ($editions as $edition) {
        foreach (['criminality', 'markets', 'actors', 'resilience'] as $field) {
            if ($edition[$field] !== null) {
                $edition[$field] = (float) $edition[$field];
            }
        }
        $byCountry[$edition['country_id']][] = $edition;
    }
    $result = [];
    foreach ($countries as $country) {
        $country['editions'] = $byCountry[$country['country_id']] ?? [];
        $result[$country['iso']] = $country;
    }
    if (isset($_GET['iso'])) {
        $iso = $_GET['iso'];
        if (!is_string($iso) || !isset($result[$iso])) {
            http_response_code(404);
            echo json_encode(['error' => 'Unknown country']);
            exit;
        }
        $country = $result[$iso];
        $latest = end($country['editions']);
        $markets = $pdo->prepare('SELECT m.market_name, s.score FROM ocindex_market_scores s
            JOIN ocindex_market_lookup m ON m.market_id = s.market_id
            WHERE s.country_year_id = ? ORDER BY m.market_name');
        $markets->execute([$latest['id'] ?? null]);
        $records = $pdo->prepare('SELECT year_of_registration AS year, COUNT(*) AS total
            FROM ctdc_victims WHERE exploitation_country_id = ? AND year_of_registration IS NOT NULL
            GROUP BY year_of_registration ORDER BY year_of_registration');
        $records->execute([$country['country_id']]);
        $result = ['markets' => $markets->fetchAll(), 'records' => $records->fetchAll()];
    }
    echo json_encode($result, JSON_THROW_ON_ERROR);
} catch (Throwable $error) {
    error_log($error->getMessage());
    http_response_code(503);
    echo json_encode(['error' => 'Country data is unavailable.']);
}
