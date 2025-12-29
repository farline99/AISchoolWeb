<?php

namespace App\Service;

use App\Repository\DisciplineRepository;
use Exception;
use PDOException;

class DisciplineService
{
    private DisciplineRepository $repository;

    public function __construct()
    {
        $this->repository = new DisciplineRepository();
    }

    public function getAll(): array
    {
        return $this->repository->findAll();
    }

    public function create(array $data): void
    {
        if (empty($data['name'])) {
            throw new Exception('Название обязательно', 400);
        }
        try {
            $this->repository->create($data['name']);
        } catch (PDOException $e) {
            if ($e->getCode() == '23505') throw new Exception('Такой предмет уже есть', 400);
            throw $e;
        }
    }

    public function delete(int $id): void
    {
        try {
            $this->repository->delete($id);
        } catch (PDOException $e) {
            if ($e->getCode() == '23503') {
                throw new Exception('Нельзя удалить предмет, так как он используется в планах или нагрузке.', 400);
            }
            throw $e;
        }
    }
}
