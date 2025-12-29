<?php

namespace App\Repository;

use App\Core\Database;
use PDO;

class ReportRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function getPerformance(int $yearId, string $start, string $end): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM get_academic_performance_summary(?, ?::date, ?::date)");
        $stmt->execute([$yearId, $start, $end]);
        return $stmt->fetchAll();
    }

    public function getTeacherWorkload(int $yearId): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM get_teacher_workload_report(?)");
        $stmt->execute([$yearId]);
        return $stmt->fetchAll();
    }

    public function getStudentMovement(string $start, string $end): string
    {
        $stmt = $this->pdo->prepare("SELECT get_student_movement_report(?::date, ?::date)");
        $stmt->execute([$start, $end]);
        return $stmt->fetchColumn() ?: '{}';
    }
}
