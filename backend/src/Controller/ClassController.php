<?php

namespace App\Controller;

use App\Service\ClassService;
use Exception;

class ClassController
{
    private ClassService $service;

    public function __construct()
    {
        $this->service = new ClassService();
    }

    public function index()
    {
        echo json_encode($this->service->getAllClasses());
    }

    public function create(array $data)
    {
        try {
            $id = $this->service->createClass($data);
            echo json_encode(['message' => 'Class created', 'id' => $id]);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update(array $data)
    {
        try {
            $this->service->updateHeadTeacher($data);
            echo json_encode(['message' => 'Head teacher updated']);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
