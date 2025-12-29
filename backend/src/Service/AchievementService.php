<?php

namespace App\Service;

use App\Repository\AchievementRepository;
use Exception;

class AchievementService
{
    private AchievementRepository $repository;

    public function __construct()
    {
        $this->repository = new AchievementRepository();
    }

    public function create(array $data): int
    {
        if (empty($data['student_id']) || empty($data['event_name']) || empty($data['event_date'])) {
            throw new Exception('Обязательные поля: Ученик, Название события, Дата', 400);
        }

        return $this->repository->create(
            (int)$data['student_id'],
            $data['event_name'],
            $data['event_date'],
            $data['level'] ?? null,
            !empty($data['place']) ? (int)$data['place'] : null
        );
    }

    public function update(array $data): void
    {
        if (empty($data['id']) || empty($data['event_name']) || empty($data['event_date'])) {
            throw new Exception('Обязательные поля: ID, Название события, Дата', 400);
        }

        $this->repository->update(
            (int)$data['id'],
            $data['event_name'],
            $data['event_date'],
            $data['level'] ?? null,
            !empty($data['place']) ? (int)$data['place'] : null
        );
    }

    public function delete(int $id): void
    {
        $this->repository->delete($id);
    }
}
