<?php

namespace App\Service;

use App\Repository\StudentRepository;
use Exception;
use PDOException;

class StudentService
{
    private StudentRepository $repository;

    public function __construct()
    {
        $this->repository = new StudentRepository();
    }

    public function getStudent(int $id): ?array
    {
        return $this->repository->findById($id);
    }

    public function getStudentsByClass(int $classId): array
    {
        return $this->repository->findByClass($classId);
    }

    public function createStudent(array $data): string
    {
        if (empty($data['last_name']) || empty($data['first_name']) || empty($data['class_id']) || empty($data['birth_date'])) {
            throw new Exception('Заполните обязательные поля', 400);
        }
        return $this->repository->create($data);
    }

    public function updateStudent(array $data): void
    {
        if (isset($data['action']) && $data['action'] === 'credentials') {
            if (empty($data['id']) || empty($data['login'])) {
                throw new Exception('Login required', 400);
            }
            try {
                $this->repository->updateCredentials($data['id'], $data['login'], $data['password'] ?? null);
            } catch (PDOException $e) {
                if ($e->getCode() == '23505') throw new Exception('Логин уже занят', 400);
                throw $e;
            }
            return;
        }

        if (!empty($data['new_class_id'])) {
            $this->repository->transfer($data['id'], $data['new_class_id']);
            return;
        }

        $this->repository->update($data);
    }

    public function deleteStudent(int $id): void
    {
        $this->repository->expel($id);
    }
}
