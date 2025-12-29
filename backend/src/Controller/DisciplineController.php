<?php

namespace App\Controller;

use App\Service\DisciplineService;
use Exception;

class DisciplineController
{
    private DisciplineService $service;

    public function __construct()
    {
        $this->service = new DisciplineService();
    }

    public function index()
    {
        echo json_encode($this->service->getAll());
    }

    public function create(array $data)
    {
        try {
            $this->service->create($data);
            echo json_encode(['message' => 'Discipline created']);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete(array $data)
    {
        $id = $data['id'] ?? $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID required']);
            return;
        }
        try {
            $this->service->delete((int)$id);
            echo json_encode(['message' => 'Discipline deleted']);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
