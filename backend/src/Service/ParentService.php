<?php

namespace App\Service;

use App\Repository\ParentRepository;
use Exception;
use PDOException;

class ParentService
{
    private ParentRepository $repository;

    public function __construct()
    {
        $this->repository = new ParentRepository();
    }

    public function getAvailableParents(int $studentId): array
    {
        return $this->repository->findAvailableForStudent($studentId);
    }

    public function getLinkedParents(int $studentId): array
    {
        return $this->repository->findLinkedToStudent($studentId);
    }

    public function createParent(array $data): string
    {
        if (empty($data['last_name']) || empty($data['first_name']) || empty($data['login']) || empty($data['password'])) {
            throw new Exception('Required fields missing', 400);
        }
        try {
            return $this->repository->create($data);
        } catch (PDOException $e) {
            if ($e->getCode() == '23505') throw new Exception('Login/Email/Phone already taken', 400);
            throw $e;
        }
    }

    public function linkStudent(int $studentId, int $parentId): void
    {
        $this->repository->link($studentId, $parentId);
    }

    public function unlinkStudent(array $data): void
    {
        $payload = $data['data'] ?? $data;
        $studentId = $payload['student_id'] ?? null;
        $parentId = $payload['parent_id'] ?? null;

        if (!$studentId || !$parentId) {
            throw new Exception('IDs required', 400);
        }
        $this->repository->unlink($studentId, $parentId);
    }
}
