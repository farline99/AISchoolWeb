<?php

namespace App\Controller;

use App\Service\ReportService;
use Exception;

class ReportController
{
    private ReportService $service;

    public function __construct()
    {
        $this->service = new ReportService();
    }

    public function index()
    {
        $type = $_GET['type'] ?? '';
        try {
            $data = $this->service->getReport($type, $_GET);
            echo json_encode($data);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
