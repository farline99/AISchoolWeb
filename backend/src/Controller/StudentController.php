<?php

namespace App\Controller;

use App\Service\StudentService;
use Exception;

class StudentController
{
    private StudentService $service;

    public function __construct()
    {
        $this->service = new StudentService();
    }

    public function index()
    {
        $classId = $_GET['class_id'] ?? null;
        $studentId = $_GET['student_id'] ?? null;

        try {
            if ($studentId) {
                echo json_encode($this->service->getStudent((int)$studentId));
            } elseif ($classId) {
                echo json_encode($this->service->getStudentsByClass((int)$classId));
            } else {
                echo json_encode([]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function create(array $data)
    {
        try {
            $id = $this->service->createStudent($data);
            echo json_encode(['message' => 'Student added', 'id' => $id]);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update(array $data)
    {
        try {
            $this->service->updateStudent($data);
            $msg = ($data['action'] ?? '') === 'credentials' ? 'Credentials updated' : 'Student updated';
            if (!empty($data['new_class_id'])) $msg = 'Student transferred';

            echo json_encode(['message' => $msg]);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete(array $data)
    {
        $id = $data['id'] ?? $_GET['id'] ?? null;
        try {
            $this->service->deleteStudent((int)$id);
            echo json_encode(['message' => 'Student expelled']);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
