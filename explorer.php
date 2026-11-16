<?php
// Author: Dre Harm
// Date: 11/15/26

require __DIR__ . '/database.php';
require __DIR__ . '/explorerQuery.php';

function h($text) {
    return htmlspecialchars((string) $text, ENT_QUOTES, 'UTF-8');
}

function dropdown($name, $label, $options, $firstChoice = 'All') {
    $current = $_GET[$name] ?? '';
    echo '<label class="filter-label" for="' . $name . '">' . $label . '</label>';
    echo '<select class="filter-select" id="' . $name . '" name="' . $name . '">';
    echo '<option value="">' . $firstChoice . '</option>';
    foreach ($options as $value => $text) {
        $selected = ((string) $value === $current) ? ' selected' : '';
        echo '<option value="' . h($value) . '"' . $selected . '>' . h($text) . '</option>';
    }
    echo '</select>';
}

function link_with($key, $value) {
    $params = $_GET;
    $params[$key] = $value;
    return 'explorer.php?' . http_build_query($params);
}

if (!$pdo) exit('Could not connect to the database.');

$dataset = ($_GET['dataset'] ?? '') === 'goci' ? 'goci' : 'ctdc';
$options = getDropdownOptions($pdo);

if ($dataset === 'ctdc') $query = CTDCQuery();
else $query = GOCIQuery($options['markets']);

$columns = $query['columns'];
$sql = "SELECT {$query['select']} {$query['from']} ORDER BY {$query['order']}";

// this was taken/adapted from w3schools php exporting sections
if (($_GET['export'] ?? '') === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $dataset . '_export.csv"');

    $stmt = $pdo->prepare($sql);
    $stmt->execute($query['params']);

    $file = fopen('php://output', 'w');
    fputcsv($file, array_values($columns), ',', '"', '');
    foreach ($stmt as $row) {
        $line = [];
        foreach ($columns as $key => $heading) {
            $line[] = $row[$key];
        }
        fputcsv($file, $line, ',', '"', '');
    }
    exit;
}

// we just need to show one page at a time
$stmt = $pdo->prepare("SELECT COUNT(*) {$query['from']}");
$stmt->execute($query['params']);
$total = (int) $stmt->fetchColumn();

$lastPage = max(1, (int) ceil($total / PAGE_SIZE));
$page = getInt1('page') ?? 1;
$page = max(1, min($page, $lastPage));
$offset = ($page - 1) * PAGE_SIZE;

$stmt = $pdo->prepare($sql . ' LIMIT ' . PAGE_SIZE . ' OFFSET ' . $offset);
$stmt->execute($query['params']);
$rows = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="author" content="Dre Harm">
    <title>Data Explorer</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body class="explorer-page">
    <nav class="navbar">
        <div class="container">
            <div class="nav-content">
                <a class="site-title" href="index.php">Crime Aggregation</a>
                <div class="nav-buttons">
                    <button class="nav-btn">Country Profiles</button>
                    <button class="nav-btn">Country Comparison</button>
                    <a class="nav-btn active" href="explorer.php">Data Explorer</a>
                </div>
                <button class="nav-btn">Login / Signup</button>
            </div>
        </div>
    </nav>
    <main class="main-content">
        <form class="explorer-layout" method="get" action="explorer.php">

            <div class="explorer-top">
                <fieldset class="dataset-choice">
                    <legend>Databases:</legend>
                    <label>
                        <input type="radio" name="dataset" value="ctdc" <?= $dataset === 'ctdc' ? 'checked' : '' ?>>
                        CTDC
                    </label>
                    <label title="Global Organized Crime Index (GI-TOC)">
                        <input type="radio" name="dataset" value="goci" <?= $dataset === 'goci' ? 'checked' : '' ?>>
                        GOCI
                    </label>
                </fieldset>
                <a class="outline-btn" href="<?= h(link_with('export', 'csv')) ?>">Export as CSV</a>
            </div>
            <aside class="filter-panel">
                <h2 class="panel-title">Filter:</h2>
                <?php if ($dataset === 'ctdc'): ?>
                    <?php dropdown('citizenship', 'Citizenship', $options['countries']); ?>
                    <?php dropdown('exploited_in', 'Country of exploitation', $options['countries']); ?>
                    <?php dropdown('year', 'Year of registration', $options['ctdc_years']); ?>
                    <?php dropdown('exploit_type', 'Exploitation type', $options['exploit']); ?>
                    <?php dropdown('gender', 'Gender', $options['genders']); ?>
                    <?php dropdown('age', 'Age group', $options['ages']); ?>
                    <?php dropdown('majority', 'Majority status', $options['majority']); ?>
                <?php else: ?>
                    <?php dropdown('country', 'Country', $options['countries']); ?>
                    <?php dropdown('region', 'Region', $options['regions']); ?>
                    <?php dropdown('year', 'Year', $options['oc_years']); ?>
                    <?php dropdown('market', 'Criminal market score', $options['markets'], 'None'); ?>
                <?php endif; ?>
                <button type="submit" class="submit-btn">Apply filters</button>
                <a class="reset-link" href="explorer.php?dataset=<?= $dataset ?>">Clear filters</a>
            </aside>
            <section class="table-panel">
                <div class="table-scroll">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <?php foreach ($columns as $heading): ?>
                                    <th><?= h($heading) ?></th>
                                <?php endforeach; ?>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($rows as $row): ?>
                                <tr>
                                    <?php foreach ($columns as $key => $heading): ?>
                                        <td><?= h($row[$key] ?? '—') ?></td>
                                    <?php endforeach; ?>
                                </tr>
                            <?php endforeach; ?>
                            <?php if (count($rows) === 0): ?>
                                <tr><td class="no-results" colspan="<?= count($columns) ?>">there are no matching records</td></tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
                <div class="pager">
                    <span>
                        Showing <?= number_format(count($rows) ? $offset + 1 : 0) ?>–<?= number_format($offset + count($rows)) ?>
                        of <?= number_format($total) ?>
                    </span>
                    <span class="pager-links">
                        <?php if ($page > 1): ?>
                            <a class="outline-btn" href="<?= h(link_with('page', $page - 1)) ?>">Previous</a>
                        <?php endif; ?>
                        <span>Page <?= $page ?> of <?= number_format($lastPage) ?></span>
                        <?php if ($page < $lastPage): ?>
                            <a class="outline-btn" href="<?= h(link_with('page', $page + 1)) ?>">Next</a>
                        <?php endif; ?>
                    </span>
                </div>
            </section>
        </form>
    </main>
    <script src="js/explorer.js"></script>
</body>
</html>
