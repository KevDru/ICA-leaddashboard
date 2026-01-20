<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

ensure_authenticated();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Total budget across all leads that have a value
$totalBudget = (float)($pdo->query('SELECT COALESCE(SUM(value), 0) FROM leads WHERE value IS NOT NULL')->fetchColumn());

// Group assignments per lead so we can distribute budgets without double counting
$assignmentsStmt = $pdo->query('
    SELECT lt.lead_id, lt.tag_id, lt.percentage, t.name AS tag_name, t.color AS tag_color,
           l.value, l.column_id, l.title AS lead_title, l.customer AS lead_customer
    FROM lead_tags lt
    JOIN leads l ON lt.lead_id = l.id
    JOIN tags t ON lt.tag_id = t.id
    WHERE l.value IS NOT NULL
    ORDER BY lt.lead_id
');

$byLead = [];
while ($row = $assignmentsStmt->fetch(PDO::FETCH_ASSOC)) {
    $leadId = (int)$row['lead_id'];
    if (!isset($byLead[$leadId])) {
        $byLead[$leadId] = [];
    }
    $byLead[$leadId][] = $row;
}

$tagTotals = [];
$columnTagTotals = [];
$columnLeads = [];
foreach ($byLead as $leadId => $assignments) {
    if (empty($assignments)) {
        continue;
    }

    $value = (float)$assignments[0]['value'];
    if ($value === 0.0) {
        continue;
    }

    $withPct = array_filter($assignments, function ($item) {
        return $item['percentage'] !== null;
    });
    $withoutPct = array_filter($assignments, function ($item) {
        return $item['percentage'] === null;
    });

    $allocatedPct = 0.0;
    $leadTagsBreakdown = [];
    foreach ($withPct as $item) {
        $tagId = (int)$item['tag_id'];
        $pct = max(0.0, (float)$item['percentage']);
        $share = $value * ($pct / 100);
        $allocatedPct += $pct;

        if (!isset($tagTotals[$tagId])) {
            $tagTotals[$tagId] = [
                'id' => $tagId,
                'name' => $item['tag_name'],
                'color' => $item['tag_color'],
                'budget' => 0.0
            ];
        }

        $tagTotals[$tagId]['budget'] += $share;

        $colId = (int)$item['column_id'];
        if (!isset($columnTagTotals[$colId])) $columnTagTotals[$colId] = [];
        if (!isset($columnTagTotals[$colId][$tagId])) {
            $columnTagTotals[$colId][$tagId] = [
                'id' => $tagId,
                'name' => $item['tag_name'],
                'color' => $item['tag_color'],
                'budget' => 0.0
            ];
        }
        $columnTagTotals[$colId][$tagId]['budget'] += $share;

        // Per-lead tag breakdown (percentage-based)
        $leadTagsBreakdown[$tagId] = [
            'id' => $tagId,
            'name' => $item['tag_name'],
            'color' => $item['tag_color'],
            'budget' => round($share, 2),
            'percentage' => round($pct, 2)
        ];
    }

    $remainingPct = max(0.0, 100.0 - $allocatedPct);
    $fallbackCount = count($withoutPct);

    foreach ($withoutPct as $item) {
        $tagId = (int)$item['tag_id'];
        $share = $fallbackCount > 0 ? ($value * ($remainingPct / 100) / $fallbackCount) : 0.0;

        if (!isset($tagTotals[$tagId])) {
            $tagTotals[$tagId] = [
                'id' => $tagId,
                'name' => $item['tag_name'],
                'color' => $item['tag_color'],
                'budget' => 0.0
            ];
        }

        $tagTotals[$tagId]['budget'] += $share;

        $colId = (int)$item['column_id'];
        if (!isset($columnTagTotals[$colId])) $columnTagTotals[$colId] = [];
        if (!isset($columnTagTotals[$colId][$tagId])) {
            $columnTagTotals[$colId][$tagId] = [
                'id' => $tagId,
                'name' => $item['tag_name'],
                'color' => $item['tag_color'],
                'budget' => 0.0
            ];
        }
        $columnTagTotals[$colId][$tagId]['budget'] += $share;

        // Per-lead tag breakdown (fallback percentage share)
        $leadTagsBreakdown[$tagId] = [
            'id' => $tagId,
            'name' => $item['tag_name'],
            'color' => $item['tag_color'],
            'budget' => round($share, 2),
            'percentage' => $fallbackCount > 0 ? round($remainingPct / $fallbackCount, 2) : 0.0
        ];
    }

    // Store this lead into its column list
    $first = $assignments[0];
    $colId = (int)$first['column_id'];
    if (!isset($columnLeads[$colId])) $columnLeads[$colId] = [];
    $columnLeads[$colId][] = [
        'id' => $leadId,
        'title' => $first['lead_title'],
        'customer' => $first['lead_customer'],
        'value' => round($value, 2),
        'tags' => array_values($leadTagsBreakdown)
    ];
}

// Leads with a budget but without any tags
$untaggedBudget = (float)($pdo->query('
    SELECT COALESCE(SUM(l.value), 0)
    FROM leads l
    WHERE l.value IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM lead_tags lt WHERE lt.lead_id = l.id
    )
')->fetchColumn());

if ($untaggedBudget > 0) {
    $tagTotals[0] = [
        'id' => 0,
        'name' => 'Niet gelabeld',
        'color' => '#6b7280',
        'budget' => $untaggedBudget
    ];
}

$tags = array_values(array_map(function ($tag) use ($totalBudget) {
    $budget = round((float)$tag['budget'], 2);
    $percentage = $totalBudget > 0 ? round(($budget / $totalBudget) * 100, 2) : 0;
    return [
        'id' => (int)$tag['id'],
        'name' => $tag['name'],
        'color' => $tag['color'],
        'budget' => $budget,
        'percentage' => $percentage
    ];
}, $tagTotals));

usort($tags, function ($a, $b) {
    return $b['budget'] <=> $a['budget'];
});

// Column totals
$columnStmt = $pdo->query('
    SELECT lc.id, lc.name, lc.color, COALESCE(SUM(l.value), 0) AS budget
    FROM lead_columns lc
    LEFT JOIN leads l ON l.column_id = lc.id AND l.value IS NOT NULL
    GROUP BY lc.id, lc.name, lc.color
');

$columns = [];
$columnBudgets = [];
while ($row = $columnStmt->fetch(PDO::FETCH_ASSOC)) {
    $budget = round((float)$row['budget'], 2);
    $percentage = $totalBudget > 0 ? round(($budget / $totalBudget) * 100, 2) : 0;
    $columnBudgets[(int)$row['id']] = $budget;
    $columns[] = [
        'id' => (int)$row['id'],
        'name' => $row['name'],
        'color' => $row['color'],
        'budget' => $budget,
        'percentage' => $percentage
    ];
}

// Attach per-column tag percentages
foreach ($columns as &$col) {
    $cid = $col['id'];
    $colTotal = $columnBudgets[$cid] ?? 0.0;
    $tagsForCol = array_values($columnTagTotals[$cid] ?? []);
    $tagsForCol = array_map(function ($item) use ($colTotal) {
        $b = round((float)$item['budget'], 2);
        $p = $colTotal > 0 ? round(($b / $colTotal) * 100, 2) : 0;
        return [
            'id' => (int)$item['id'],
            'name' => $item['name'],
            'color' => $item['color'],
            'budget' => $b,
            'percentage' => $p
        ];
    }, $tagsForCol);
    usort($tagsForCol, function ($a, $b) { return $b['budget'] <=> $a['budget']; });
    $col['tags'] = $tagsForCol;
    // Attach per-column leads (including untagged, added below) sorted by value
    $leadsForCol = array_values($columnLeads[$cid] ?? []);
    usort($leadsForCol, function ($a, $b) { return $b['value'] <=> $a['value']; });
    $col['leads'] = $leadsForCol;
}
unset($col);

usort($columns, function ($a, $b) {
    return $b['budget'] <=> $a['budget'];
});

// Ensure untagged leads are included in leads tables
$allLeadsStmt = $pdo->query('
    SELECT id, title, customer, value, column_id
    FROM leads
    WHERE value IS NOT NULL
');
while ($lr = $allLeadsStmt->fetch(PDO::FETCH_ASSOC)) {
    $cid = (int)$lr['column_id'];
    if (!isset($columnLeads[$cid])) $columnLeads[$cid] = [];
    $exists = false;
    foreach ($columnLeads[$cid] as $existing) {
        if ($existing['id'] === (int)$lr['id']) { $exists = true; break; }
    }
    if (!$exists) {
        $columnLeads[$cid][] = [
            'id' => (int)$lr['id'],
            'title' => $lr['title'],
            'customer' => $lr['customer'],
            'value' => round((float)$lr['value'], 2),
            'tags' => []
        ];
    }
}

// Reattach updated leads arrays with untagged entries
foreach ($columns as &$col2) {
    $cid = $col2['id'];
    $leadsForCol = array_values($columnLeads[$cid] ?? []);
    usort($leadsForCol, function ($a, $b) { return $b['value'] <=> $a['value']; });
    $col2['leads'] = $leadsForCol;
}
unset($col2);

echo json_encode([
    'totalBudget' => $totalBudget,
    'tags' => $tags,
    'columns' => $columns
]);
