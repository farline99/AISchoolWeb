<?php

namespace App\Service;

use App\Repository\UserRepository;
use Exception;

class AuthService
{
    private UserRepository $userRepository;

    public function __construct()
    {
        $this->userRepository = new UserRepository();
    }

    public function authenticate(string $login, string $password): array
    {
        $user = $this->userRepository->findByLogin($login);

        if (!$user) {
            throw new Exception('Неверный логин или пароль', 401);
        }

        $dbHash = stream_get_contents($user['password_hash']);
        if (strpos($dbHash, '\\x') === 0) {
            $hex = substr($dbHash, 2);
            $validHash = hex2bin($hex);
        } else {
            $validHash = $dbHash;
        }

        if (!password_verify($password, $validHash)) {
            throw new Exception('Неверный логин или пароль', 401);
        }

        return $user;
    }

    public function getUserAvatar(int $id, string $role): ?string
    {
        return $this->userRepository->getAvatarPath($id, $role);
    }
}
