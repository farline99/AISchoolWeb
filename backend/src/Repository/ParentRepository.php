<?php

namespace App\Repository;

use App\Core\Database;
use PDO;

class ParentRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function findAvailableForStudent(int $studentId): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM get_all_parents_for_linking(?)");
        $stmt->execute([$studentId]);
        return $stmt->fetchAll();
    }

    public function findLinkedToStudent(int $studentId): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM get_parents_for_student(?)");
        $stmt->execute([$studentId]);
        return $stmt->fetchAll();
    }

    public function create(array $data): string
    {
        $passwordHashString = password_hash($data['password'], PASSWORD_DEFAULT);
        $pgHash = '\x' . bin2hex($passwordHashString);
        $pgSalt = '\x';

        $sql = "SELECT add_parent(?, ?, ?, ?, ?, ?, ?::bytea, ?::bytea)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            $data['last_name'],
            $data['first_name'],
            $data['patronymic'] ?? null,
            $data['phone'] ?? null,
            $data['email'] ?? null,
            $data['login'],
            $pgHash,
            $pgSalt
        ]);
        return $stmt->fetchColumn();
    }

    public function link(int $studentId, int $parentId): void
    {
        $stmt = $this->pdo->prepare("SELECT link_student_to_parent(?, ?)");
        $stmt->execute([$studentId, $parentId]);
    }

    public function unlink(int $studentId, int $parentId): void
    {
        $stmt = $this->pdo->prepare("SELECT unlink_student_from_parent(?, ?)");
        $stmt->execute([$studentId, $parentId]);
    }
}
