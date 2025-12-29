<?php

namespace App\Repository;

use App\Core\Database;
use PDO;

class UserRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function findByLogin(string $login): ?array
    {
        $sql = "SELECT * FROM get_user_auth_data_by_login(?)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$login]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public function getAvatarPath(int $userId, string $role): ?string
    {
        $table = match ($role) {
            'student' => 'student',
            'parent' => 'parent',
            default => 'teacher',
        };

        $stmt = $this->pdo->prepare("SELECT avatar_path FROM $table WHERE id = ?");
        $stmt->execute([$userId]);
        return $stmt->fetchColumn() ?: null;
    }

    public function updateAvatar(int $id, string $role, ?string $path): void
    {
        $table = match ($role) {
            'student' => 'student',
            'parent' => 'parent',
            default => 'teacher',
        };
        $stmt = $this->pdo->prepare("UPDATE $table SET avatar_path = ? WHERE id = ?");
        $stmt->execute([$path, $id]);
    }

    public function updatePassword(int $userId, string $role, string $newHash): void
    {
        $pgHash = '\x' . bin2hex($newHash);
        $pgSalt = '\x';
        $stmt = $this->pdo->prepare("SELECT change_user_password(?, ?, ?::bytea, ?::bytea)");
        $stmt->execute([$userId, $role, $pgHash, $pgSalt]);
    }
}
