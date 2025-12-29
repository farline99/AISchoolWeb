<?php

namespace App\Repository;

use App\Core\Database;
use PDO;

class DisciplineRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function findAll(): array
    {
        return $this->pdo->query("SELECT * FROM discipline ORDER BY name")->fetchAll();
    }

    public function create(string $name): void
    {
        $stmt = $this->pdo->prepare("INSERT INTO discipline (name) VALUES (?)");
        $stmt->execute([$name]);
    }

    public function delete(int $id): void
    {
        $stmt = $this->pdo->prepare("DELETE FROM discipline WHERE id = ?");
        $stmt->execute([$id]);
    }
}
