<?php

namespace App\Service;

use App\Repository\ClassRepository;
use Exception;
use PDOException;

class ClassService
{
    private ClassRepository $repository;

    public function __construct()
    {
        $this->repository = new ClassRepository();
    }

    public function getAllClasses(): array
    {
        return $this->repository->findAll();
    }

    public function createClass(array $data): string
    {
        if (empty($data['letter']) || empty($data['parallel_number'])) {
            throw new Exception('Параллель и Буква обязательны', 400);
        }

        try {
            $headTeacher = !empty($data['head_teacher_id']) ? $data['head_teacher_id'] : null;
            return $this->repository->create($data['letter'], $data['parallel_number'], $headTeacher);
        } catch (PDOException $e) {
            if ($e->getCode() == '23505') {
                throw new Exception('Такой класс уже существует', 400);
            }
            throw new Exception($e->getMessage(), 500);
        }
    }

    public function updateHeadTeacher(array $data): void
    {
        if (empty($data['class_id'])) {
            throw new Exception('Class ID required', 400);
        }

        try {
            $headTeacher = !empty($data['head_teacher_id']) ? $data['head_teacher_id'] : null;
            $this->repository->updateHeadTeacher($data['class_id'], $headTeacher);
        } catch (PDOException $e) {
            if ($e->getCode() == '23505') {
                throw new Exception('Этот учитель уже является классным руководителем', 400);
            }
            throw new Exception($e->getMessage(), 500);
        }
    }
}
