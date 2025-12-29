<?php

namespace App\Service;

use App\Repository\TeacherRepository;
use Exception;
use PDOException;

class TeacherService
{
    private TeacherRepository $repository;

    public function __construct()
    {
        $this->repository = new TeacherRepository();
    }

    public function getAllTeachers(): array
    {
        return $this->repository->findAll();
    }

    public function createTeacher(array $data): string
    {
        if (empty($data['last_name']) || empty($data['first_name']) || empty($data['login']) || empty($data['password'])) {
            throw new Exception('Заполните обязательные поля (Фамилия, Имя, Логин, Пароль)', 400);
        }

        try {
            return $this->repository->create($data);
        } catch (PDOException $e) {
            if ($e->getCode() == '23505') {
                throw new Exception('Логин или Email уже занят', 400);
            }
            throw new Exception($e->getMessage(), 500);
        }
    }

    public function updateTeacher(array $data): void
    {
        if (empty($data['id'])) {
            throw new Exception('ID не указан', 400);
        }

        try {
            $this->repository->update($data);
        } catch (PDOException $e) {
            if ($e->getCode() == '23505') {
                throw new Exception('Логин или Email уже занят', 400);
            }
            throw new Exception($e->getMessage(), 500);
        }
    }

    public function deleteTeacher(int $id): void
    {
        if (!$id) {
            throw new Exception('ID не указан', 400);
        }

        try {
            $this->repository->delete($id);
        } catch (PDOException $e) {
            if ($e->getCode() == '23503') {
                throw new Exception('Нельзя удалить учителя, так как за ним закреплена нагрузка или класс.', 400);
            }
            throw new Exception($e->getMessage(), 500);
        }
    }
}
