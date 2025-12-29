<?php

namespace App\Controller;

use App\Service\AcademicYearService;
use Exception;

class AcademicYearController
{
    private AcademicYearService $service;

    public function __construct()
    {
        $this->service = new AcademicYearService();
    }

    public function index()
    {
        echo json_encode($this->service->getAll());
    }

    public function create(array $data)
    {
        try {
            if (isset($data['action']) && $data['action'] === 'promote') {
                $this->service->promoteStudents($data);
                echo json_encode(['message' => 'Students promoted successfully']);
                return;
            }

            $this->service->create($data);
            echo json_encode(['message' => 'Year created']);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update(array $data)
    {
        try {
            $this->service->updateStatus($data);
            echo json_encode(['message' => 'Status updated']);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
