<?php

namespace App\Controller;

use App\Service\WorkloadService;
use Exception;

class WorkloadController
{
    private WorkloadService $service;

    public function __construct()
    {
        $this->service = new WorkloadService();
    }

    public function index()
    {
        $classId = $_GET['class_id'] ?? null;
        $yearId = $_GET['year_id'] ?? null;

        if (!$classId || !$yearId) {
            echo json_encode([]);
            return;
        }

        try {
            echo json_encode($this->service->getWorkload((int)$classId, (int)$yearId));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function create(array $data)
    {
        try {
            $this->service->assignTeacher($data);
            echo json_encode(['message' => 'Teacher assigned']);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete(array $data)
    {
        try {
            $this->service->removeTeacher($data);
            echo json_encode(['message' => 'Teacher removed']);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
