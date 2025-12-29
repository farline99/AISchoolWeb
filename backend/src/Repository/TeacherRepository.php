<?php

namespace App\Repository;

use App\Core\Database;
use PDO;

class TeacherRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function findAll(): array
    {
        $stmt = $this->pdo->query("SELECT * FROM get_all_teachers()");
        return $stmt->fetchAll();
    }

    public function create(array $data): string
    {
        $passwordHashString = password_hash($data['password'], PASSWORD_DEFAULT);
        $pgHash = '\x' . bin2hex($passwordHashString);
        $pgSalt = '\x';

        $sql = "SELECT add_teacher(?, ?, ?, ?, ?, ?, ?::bytea, ?::bytea, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            $data['last_name'],
            $data['first_name'],
            $data['patronymic'] ?? null,
            $data['phone'] ?? null,
            $data['email'] ?? null,
            $data['login'],
            $pgHash,
            $pgSalt,
            $data['role'] ?? 'teacher',
            $data['notes'] ?? null
        ]);

        return $stmt->fetchColumn();
    }

    public function update(array $data): void
    {
        $sql = "SELECT update_teacher(?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            $data['id'],
            $data['last_name'],
            $data['first_name'],
            $data['patronymic'] ?? null,
            $data['phone'] ?? null,
            $data['email'] ?? null,
            $data['login'],
            $data['role'],
            $data['notes'] ?? null
        ]);
    }

    public function delete(int $id): void
    {
        $stmt = $this->pdo->prepare("SELECT delete_teacher(?)");
        $stmt->execute([$id]);
    }
}
