<?php

namespace App\Service;

use App\Repository\WorkloadRepository;
use Exception;

class WorkloadService
{
    private WorkloadRepository $repository;

    public function __construct()
    {
        $this->repository = new WorkloadRepository();
    }

    public function getWorkload(int $classId, int $yearId): array
    {
        return $this->repository->findByClassAndYear($classId, $yearId);
    }

    public function assignTeacher(array $data): void
    {
        if (empty($data['class_id']) || empty($data['discipline_id']) || empty($data['teacher_id']) || empty($data['year_id'])) {
            throw new Exception('Все поля обязательны', 400);
        }
        $this->repository->upsert(
            $data['class_id'],
            $data['discipline_id'],
            $data['teacher_id'],
            $data['year_id']
        );
    }

    public function removeTeacher(array $data): void
    {
        $payload = $data['data'] ?? $data;

        $classId = $payload['class_id'] ?? $_GET['class_id'] ?? null;
        $disciplineId = $payload['discipline_id'] ?? $_GET['discipline_id'] ?? null;
        $yearId = $payload['year_id'] ?? $_GET['year_id'] ?? null;

        if (!$classId || !$disciplineId || !$yearId) {
            throw new Exception('Missing parameters', 400);
        }

        $this->repository->delete($classId, $disciplineId, $yearId);
    }
}
