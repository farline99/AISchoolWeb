<?php

namespace App\Repository;

use App\Core\Database;
use PDO;

class StudyPlanRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function findAll(): array
    {
        return $this->pdo->query("SELECT * FROM get_all_study_plans()")->fetchAll();
    }

    public function findItems(int $planId): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM get_study_plan_items(?)");
        $stmt->execute([$planId]);
        return $stmt->fetchAll();
    }

    public function createPlan(string $name, int $yearId, int $parallel): string
    {
        $stmt = $this->pdo->prepare("SELECT add_study_plan(?::text, ?::integer, ?::integer)");
        $stmt->execute([$name, $yearId, $parallel]);
        return $stmt->fetchColumn();
    }

    public function upsertItem(int $planId, int $disciplineId, int $count): void
    {
        $stmt = $this->pdo->prepare("SELECT upsert_study_plan_item(?, ?, ?)");
        $stmt->execute([$planId, $disciplineId, $count]);
    }

    public function deleteItem(int $itemId): void
    {
        $stmt = $this->pdo->prepare("SELECT delete_study_plan_item(?)");
        $stmt->execute([$itemId]);
    }
}
