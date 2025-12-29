<?php

namespace App\Repository;

use App\Core\Database;
use PDO;

class StudentRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM student WHERE id = ?");
        $stmt->execute([$id]);
        $student = $stmt->fetch();
        if ($student) {
            unset($student['password_hash'], $student['password_salt']);
        }
        return $student ?: null;
    }

    public function findByClass(int $classId): array
    {
        $stmt = $this->pdo->prepare("SELECT id, last_name, first_name, patronymic FROM student WHERE class_id = ? AND status = 'Active' ORDER BY last_name, first_name");
        $stmt->execute([$classId]);
        return $stmt->fetchAll();
    }

    public function create(array $data): string
    {
        $sql = "SELECT add_student(?, ?, ?, ?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            $data['last_name'],
            $data['first_name'],
            $data['patronymic'] ?? null,
            $data['class_id'],
            $data['birth_date'],
            $data['notes'] ?? null
        ]);
        return $stmt->fetchColumn();
    }

    public function update(array $data): void
    {
        $sql = "SELECT update_student(?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            $data['id'],
            $data['last_name'],
            $data['first_name'],
            $data['patronymic'] ?? null,
            $data['class_id'],
            $data['birth_date'],
            $data['notes'] ?? null
        ]);
    }

    public function transfer(int $id, int $newClassId): void
    {
        $stmt = $this->pdo->prepare("SELECT transfer_student(?, ?)");
        $stmt->execute([$id, $newClassId]);
    }

    public function expel(int $id): void
    {
        $stmt = $this->pdo->prepare("SELECT expel_student(?)");
        $stmt->execute([$id]);
    }

    public function updateCredentials(int $id, string $login, ?string $password): void
    {
        $sqlPart = "UPDATE student SET login = ?";
        $params = [$login];

        if (!empty($password)) {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $pgHash = '\x' . bin2hex($hash);
            $sqlPart .= ", password_hash = ?::bytea";
            $params[] = $pgHash;
        }

        $sqlPart .= " WHERE id = ?";
        $params[] = $id;

        $stmt = $this->pdo->prepare($sqlPart);
        $stmt->execute($params);
    }
}
