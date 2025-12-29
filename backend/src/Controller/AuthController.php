<?php

namespace App\Controller;

use App\Service\AuthService;
use Exception;

class AuthController
{
    private AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    public function login(array $data)
    {
        $login = $data['login'] ?? '';
        $password = $data['password'] ?? '';
        $remember = !empty($data['remember']);

        if (!$login || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Введите логин и пароль']);
            return;
        }

        try {
            $user = $this->authService->authenticate($login, $password);

            session_regenerate_id(true);
            if ($remember) {
                $params = session_get_cookie_params();
                setcookie(
                    session_name(),
                    session_id(),
                    time() + (60 * 60 * 24 * 30),
                    $params["path"],
                    $params["domain"],
                    $params["secure"],
                    $params["httponly"]
                );
            }

            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['name'] = $user['full_name'];
            if ($user['related_student_id']) {
                $_SESSION['related_student_id'] = $user['related_student_id'];
            }

            $avatar = $this->authService->getUserAvatar($user['id'], $user['role']);

            echo json_encode([
                'id' => $user['id'],
                'role' => $user['role'],
                'name' => $user['full_name'],
                'related_student_id' => $user['related_student_id'],
                'avatar' => $avatar
            ]);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function logout()
    {
        session_destroy();
        echo json_encode(['message' => 'Logged out']);
    }

    public function me()
    {
        if (isset($_SESSION['user_id'])) {
            $avatar = $this->authService->getUserAvatar($_SESSION['user_id'], $_SESSION['role']);

            echo json_encode([
                'id' => $_SESSION['user_id'],
                'role' => $_SESSION['role'],
                'name' => $_SESSION['name'] ?? 'User',
                'related_student_id' => $_SESSION['related_student_id'] ?? null,
                'avatar' => $avatar
            ]);
        } else {
            echo json_encode(null);
        }
    }
}
