<?php

namespace App\Service;

use App\Repository\ReportRepository;
use Exception;

class ReportService
{
    private ReportRepository $repository;

    public function __construct()
    {
        $this->repository = new ReportRepository();
    }

    public function getReport(string $type, array $params): mixed
    {
        switch ($type) {
            case 'performance':
                if (empty($params['year_id']) || empty($params['start']) || empty($params['end'])) {
                    throw new Exception('Missing parameters for performance report', 400);
                }
                return $this->repository->getPerformance($params['year_id'], $params['start'], $params['end']);

            case 'teachers':
                if (empty($params['year_id'])) {
                    throw new Exception('Year ID required', 400);
                }
                return $this->repository->getTeacherWorkload($params['year_id']);

            case 'movement':
                if (empty($params['start']) || empty($params['end'])) {
                    throw new Exception('Dates required', 400);
                }
                $jsonStr = $this->repository->getStudentMovement($params['start'], $params['end']);
                return json_decode($jsonStr, true);

            default:
                throw new Exception('Unknown report type', 400);
        }
    }
}
