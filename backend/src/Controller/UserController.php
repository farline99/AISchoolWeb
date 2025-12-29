<?php

namespace App\Controller;

use App\Repository\UserRepository;
use App\Service\FileService;
use Exception;

class UserController
{
    private UserRepository $repo;
    private FileService $fileService;

    public function __construct()
    {
        $this->repo = new UserRepository();
        $this->fileService = new FileService();
    }

    public function changePassword(array $data)
    {
        if (empty($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $newPass = $data['password'] ?? '';
        if (empty($newPass)) {
            http_response_code(400);
            echo json_encode(['error' => 'Password required']);
            return;
        }

        try {
            $hash = password_hash($newPass, PASSWORD_DEFAULT);
            $this->repo->updatePassword($_SESSION['user_id'], $_SESSION['role'], $hash);
            echo json_encode(['message' => 'Password changed successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function uploadAvatar()
    {
        if (empty($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $role = $_POST['role'] ?? $_SESSION['role'];
        $id = $_POST['id'] ?? $_SESSION['user_id'];

        $isSelf = ($role === $_SESSION['role'] && $id == $_SESSION['user_id']);
        $isAdmin = ($_SESSION['role'] === 'admin');

        if (!$isSelf && !$isAdmin) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'File upload error']);
            return;
        }

        try {
            $oldPath = $this->repo->getAvatarPath($id, $role);
            if ($oldPath) {
                $this->fileService->deleteFile($oldPath);
            }

            $newPath = $this->fileService->uploadAvatar($_FILES['avatar'], $role, $id);
            $this->repo->updateAvatar($id, $role, $newPath);

            echo json_encode(['url' => $newPath]);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function deleteAvatar(array $data)
    {
        if (empty($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $role = $data['role'] ?? $_SESSION['role'];
        $id = $data['id'] ?? $_SESSION['user_id'];

        $isSelf = ($role === $_SESSION['role'] && $id == $_SESSION['user_id']);
        $isAdmin = ($_SESSION['role'] === 'admin');

        if (!$isSelf && !$isAdmin) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        try {
            $oldPath = $this->repo->getAvatarPath($id, $role);
            if ($oldPath) {
                $this->fileService->deleteFile($oldPath);
            }
            $this->repo->updateAvatar($id, $role, null);
            echo json_encode(['message' => 'Avatar deleted']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
