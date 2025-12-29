<?php

namespace App\Service;

use Exception;

class FileService
{
    private string $uploadDir;

    public function __construct()
    {
        $this->uploadDir = __DIR__ . '/../../public';
    }

    public function uploadAvatar(array $file, string $role, int $id): string
    {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $maxSize = 2 * 1024 * 1024;

        if (!in_array($file['type'], $allowedTypes)) {
            throw new Exception('Только JPG, PNG или WEBP', 400);
        }
        if ($file['size'] > $maxSize) {
            throw new Exception('Файл слишком большой (макс 2МБ)', 400);
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid($role . '_' . $id . '_') . '.' . $ext;
        $relativePath = '/uploads/avatars/' . $filename;

        $targetPath = $this->uploadDir . $relativePath;

        if (!is_dir(dirname($targetPath))) {
            mkdir(dirname($targetPath), 0777, true);
        }

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new Exception('Ошибка сохранения файла на сервере', 500);
        }

        return $relativePath;
    }

    public function deleteFile(string $relativePath): void
    {
        $fullPath = $this->uploadDir . $relativePath;
        if (file_exists($fullPath)) {
            unlink($fullPath);
        }
    }
}
