<?php

namespace App\Repository;

use App\Core\Database;
use PDO;

class WorkloadRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function findByClassAndYear(int $classId, int $yearId): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM get_workload_for_class(?, ?::integer)");
        $stmt->execute([$classId, $yearId]);
        return $stmt->fetchAll();
    }

    public function upsert(int $classId, int $disciplineId, int $teacherId, int $yearId): void
    {
        $stmt = $this->pdo->prepare("SELECT upsert_workload(?, ?, ?, ?::integer)");
        $stmt->execute([$classId, $disciplineId, $teacherId, $yearId]);
    }

    public function delete(int $classId, int $disciplineId, int $yearId): void
    {
        $stmt = $this->pdo->prepare("SELECT delete_workload(?, ?, ?::integer)");
        $stmt->execute([$classId, $disciplineId, $yearId]);
    }
}
