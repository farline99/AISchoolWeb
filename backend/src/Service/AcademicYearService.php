<?php

namespace App\Service;

use App\Repository\AcademicYearRepository;
use Exception;

class AcademicYearService
{
    private AcademicYearRepository $repository;

    public function __construct()
    {
        $this->repository = new AcademicYearRepository();
    }

    public function getAll(): array
    {
        return $this->repository->findAll();
    }

    public function create(array $data): void
    {
        if (empty($data['name']) || empty($data['start_date']) || empty($data['end_date'])) {
            throw new Exception('Заполните все поля', 400);
        }
        $this->repository->create($data['name'], $data['start_date'], $data['end_date']);
    }

    public function updateStatus(array $data): void
    {
        if (empty($data['id']) || empty($data['status'])) {
            throw new Exception('ID and Status required', 400);
        }

        if ($data['status'] === 'Current') {
            if ($this->repository->countActiveYearsExcluding((int)$data['id']) > 0) {
                throw new Exception('В системе уже есть активный учебный год. Сначала архивируйте его.', 400);
            }
        }

        $this->repository->updateStatus($data['id'], $data['status']);
    }

    public function promoteStudents(array $data): void
    {
        if (empty($data['current_year_id']) || empty($data['next_year_id'])) {
            throw new Exception('IDs required', 400);
        }
        $this->repository->promoteStudents($data['current_year_id'], $data['next_year_id']);
    }
}
