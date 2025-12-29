<?php

namespace App\Repository;

use App\Core\Database;
use PDO;

class ClassRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function findAll(): array
    {
        $stmt = $this->pdo->query("SELECT * FROM get_all_classes_with_details()");
        return $stmt->fetchAll();
    }

    public function create(string $letter, int $parallel, ?int $headTeacherId): string
    {
        $sql = "SELECT add_class(?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$letter, $parallel, $headTeacherId]);
        return $stmt->fetchColumn();
    }

    public function updateHeadTeacher(int $classId, ?int $headTeacherId): void
    {
        $sql = "SELECT update_class_head_teacher(?, ?)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$classId, $headTeacherId]);
    }
}
