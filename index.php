<?php
// Author: Dre Harm
// Date: 11/13/2026

require __DIR__ . '/database.php';

$countries = [];
$latestYear = null;

if ($pdo) {
    $latestYear = (int) $pdo->query('SELECT MAX(year) FROM ocindex_country_year') -> fetchColumn();

    $stmt = $pdo -> prepare(
        'SELECT c.iso_alpha2, c.country_name, y.criminality_avg
         FROM countries c
         LEFT JOIN ocindex_country_year y ON y.country_id = c.country_id AND y.year = ?'
    );

    $stmt->execute([$latestYear]);

    foreach ($stmt as $row) {
        $countries[$row['iso_alpha2']] = [
            'name' => $row['country_name'],
            'criminality' => $row['criminality_avg'],
        ];
    }
}

// the map starts with a declaration and a licence comment so I have to drop those, also the fixed size had to go so now it scales with the page
$svg = file_get_contents(__DIR__ . '/world.svg');
$svg = substr($svg, strpos($svg, '<svg'));
$svg = preg_replace('/\s(width|height)="\d+"/', '', $svg, 2);
$svg = str_replace('<svg ', '<svg id="worldMap" ', $svg);
$svg = str_replace('viewbox=', 'viewBox=', $svg);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="author" content="Dre Harm">
    <meta name="author" content="Benjamin Nguyen">
    <title>Global Crime Data Explorer</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="nav-content">
                <a class="site-title" href="index.php">Crime Aggreggator</a>
                <div class="nav-buttons">
                    <button class="nav-btn">Country Profiles</button>
                    <button class="nav-btn">Country Comparison</button>
                    <a class="nav-btn" href="explorer.php">Data Explorer</a>
                </div>
                <button class="nav-btn">Login / Signup</button>
            </div>
        </div>
    </nav>
    <main class="main-content">
        <section class="map-panel">
            <?php if (!$pdo):?>
                <p class="form-error">couldn't connect to the db</p>
            <?php endif; ?>
            <?= $svg ?>
        </section>
    </main>
    <div id="mapPopup" class="map-popup" hidden></div>
    <script>
        // i needed these to run before anything else does so before loading map.js these go
        const COUNTRY_DATA = <?= json_encode($countries, JSON_HEX_TAG | JSON_HEX_AMP) ?>;
        const LATEST_YEAR = <?= json_encode($latestYear) ?>;
    </script>
    <script src="js/map.js"></script>
</body>
</html>
