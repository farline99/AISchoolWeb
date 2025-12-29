<?php

namespace App\Controller;

use App\Service\ParentService;
use Exception;

class ParentController
{
    private ParentService $service;

    public function __construct()
    {
        $this->service = new ParentService();
    }

    public function index()
    {
        $studentId = $_GET['student_id'] ?? null;
        if ($studentId) {
            echo json_encode($this->service->getAvailableParents((int)$studentId));
        } else {
            echo json_encode([]);
        }
    }

    public function create(array $data)
    {
        try {
            $id = $this->service->createParent($data);
            echo json_encode(['message' => 'Parent created', 'id' => $id]);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getLinked()
    {
        $studentId = $_GET['student_id'] ?? null;
        if ($studentId) {
            echo json_encode($this->service->getLinkedParents((int)$studentId));
        } else {
            echo json_encode([]);
        }
    }

    public function link(array $data)
    {
        try {
            $this->service->linkStudent($data['student_id'], $data['parent_id']);
            echo json_encode(['message' => 'Linked']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function unlink(array $data)
    {
        try {
            $this->service->unlinkStudent($data);
            echo json_encode(['message' => 'Unlinked']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
