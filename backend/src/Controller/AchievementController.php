<?php

namespace App\Controller;

use App\Service\AchievementService;
use Exception;

class AchievementController
{
    private AchievementService $service;

    public function __construct()
    {
        $this->service = new AchievementService();
    }

    public function create(array $data)
    {
        try {
            $id = $this->service->create($data);
            echo json_encode(['message' => 'Achievement created', 'id' => $id]);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update(array $data)
    {
        try {
            $this->service->update($data);
            echo json_encode(['message' => 'Achievement updated']);
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
            echo json_encode(['message' => 'Achievement deleted']);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
