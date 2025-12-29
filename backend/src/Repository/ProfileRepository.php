<?php

namespace App\Repository;

use App\Core\Database;
use PDO;

class ProfileRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function getInfo(int $studentId): array
    {
        $sql = "SELECT s.id, s.avatar_path, s.last_name, s.first_name, s.patronymic, s.birth_date, s.notes,
        (p.number || ' \"' || c.letter || '\"') as class_name
        FROM student s
        JOIN class c ON s.class_id = c.id
        JOIN parallel p ON c.parallel_id = p.id
        WHERE s.id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$studentId]);
        return $stmt->fetch() ?: [];
    }

    public function getGrades(int $studentId, int $yearId): array
    {
        $sql = "SELECT d.name as discipline, l.lesson_date, l.topic, gb.grade, gb.work_type
        FROM gradebook gb
        JOIN lesson l ON gb.lesson_id = l.id
        JOIN workload w ON l.workload_id = w.id
        JOIN discipline d ON w.discipline_id = d.id
        WHERE gb.student_id = ? AND w.academic_year_id = ?
        ORDER BY d.name, l.lesson_date DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$studentId, $yearId]);
        return $stmt->fetchAll();
    }

    public function getAchievements(int $studentId): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM achievement WHERE student_id = ? ORDER BY event_date DESC");
        $stmt->execute([$studentId]);
        return $stmt->fetchAll();
    }

    public function getCurrentYearId(): int
    {
        return $this->pdo->query("SELECT id FROM academic_year WHERE status = 'Current' LIMIT 1")->fetchColumn();
    }
}
