<?php

namespace App\Controller;

use App\Service\TeacherService;
use Exception;

class TeacherController
{
    private TeacherService $service;

    public function __construct()
    {
        $this->service = new TeacherService();
    }

    public function index()
    {
        echo json_encode($this->service->getAllTeachers());
    }

    public function create(array $data)
    {
        try {
            $id = $this->service->createTeacher($data);
            echo json_encode(['message' => 'Teacher added', 'id' => $id]);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update(array $data)
    {
        try {
            $this->service->updateTeacher($data);
            echo json_encode(['message' => 'Teacher updated']);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete(array $data)
    {
        $id = $data['id'] ?? $_GET['id'] ?? null;

        try {
            $this->service->deleteTeacher((int)$id);
            echo json_encode(['message' => 'Teacher deleted']);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
