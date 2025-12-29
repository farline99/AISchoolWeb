<?php

namespace App\Repository;

use App\Core\Database;
use PDO;

class AcademicYearRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function findAll(): array
    {
        return $this->pdo->query("SELECT * FROM academic_year ORDER BY start_date DESC")->fetchAll();
    }

    public function create(string $name, string $start, string $end): void
    {
        $stmt = $this->pdo->prepare("INSERT INTO academic_year (name, start_date, end_date) VALUES (?, ?, ?)");
        $stmt->execute([$name, $start, $end]);
    }

    public function updateStatus(int $id, string $status): void
    {
        $stmt = $this->pdo->prepare("UPDATE academic_year SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);
    }

    public function countActiveYearsExcluding(int $excludeId): int
    {
        $stmt = $this->pdo->query("SELECT count(*) FROM academic_year WHERE status = 'Current' AND id != " . $excludeId);
        return $stmt->fetchColumn();
    }

    public function promoteStudents(int $currentYearId, int $nextYearId): void
    {
        $stmt = $this->pdo->prepare("SELECT promote_students_to_next_year(?, ?)");
        $stmt->execute([$currentYearId, $nextYearId]);
    }
}
