<?php

namespace App\Controller;

use App\Service\StudyPlanService;
use Exception;

class StudyPlanController
{
    private StudyPlanService $service;

    public function __construct()
    {
        $this->service = new StudyPlanService();
    }

    public function index()
    {
        $planId = $_GET['plan_id'] ?? null;
        try {
            if ($planId) {
                echo json_encode($this->service->getPlanItems((int)$planId));
            } else {
                echo json_encode($this->service->getPlans());
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function create(array $data)
    {
        try {
            $result = $this->service->handlePost($data);
            echo json_encode($result);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete(array $data)
    {
        $itemId = $data['item_id'] ?? $_GET['item_id'] ?? null;
        if (!$itemId) {
            http_response_code(400);
            echo json_encode(['error' => 'Item ID required']);
            return;
        }
        try {
            $this->service->deleteItem((int)$itemId);
            echo json_encode(['message' => 'Item deleted']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
