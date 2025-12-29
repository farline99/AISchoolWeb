<?php

namespace App\Repository;

use App\Core\Database;
use PDO;

class AchievementRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function create(int $studentId, string $eventName, string $eventDate, ?string $level, ?int $place): int
    {
        $stmt = $this->pdo->prepare("SELECT add_achievement(?, ?, ?::timestamp, ?, ?)");
        $stmt->execute([$studentId, $eventName, $eventDate, $level, $place]);
        return $stmt->fetchColumn();
    }

    public function update(int $id, string $eventName, string $eventDate, ?string $level, ?int $place): void
    {
        $stmt = $this->pdo->prepare("SELECT update_achievement(?, ?, ?::timestamp, ?, ?)");
        $stmt->execute([$id, $eventName, $eventDate, $level, $place]);
    }

    public function delete(int $id): void
    {
        $stmt = $this->pdo->prepare("SELECT delete_achievement(?)");
        $stmt->execute([$id]);
    }
}
