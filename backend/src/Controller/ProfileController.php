<?php

namespace App\Controller;

use App\Repository\ProfileRepository;
use Exception;

class ProfileController
{
    private ProfileRepository $repo;

    public function __construct()
    {
        $this->repo = new ProfileRepository();
    }

    private function getTargetStudentId(): int
    {
        $role = $_SESSION['role'] ?? '';

        if ($role === 'student') return $_SESSION['user_id'];
        if ($role === 'parent') return $_SESSION['related_student_id'];
        if (($role === 'teacher' || $role === 'admin') && !empty($_GET['student_id'])) return (int)$_GET['student_id'];

        throw new Exception('Access Denied', 403);
    }

    public function getInfo()
    {
        try {
            $id = $this->getTargetStudentId();
            echo json_encode($this->repo->getInfo($id));
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getGrades()
    {
        try {
            $id = $this->getTargetStudentId();
            $yearId = !empty($_GET['year_id']) ? (int)$_GET['year_id'] : $this->repo->getCurrentYearId();

            $raw = $this->repo->getGrades($id, $yearId);

            $result = [];
            foreach ($raw as $row) {
                $disc = $row['discipline'];
                if (!isset($result[$disc])) $result[$disc] = [];
                $result[$disc][] = [
                    'date' => $row['lesson_date'],
                    'topic' => $row['topic'],
                    'grade' => $row['work_type'] === 'Н' ? 'Н' : $row['grade'],
                    'type' => $row['work_type']
                ];
            }
            $final = [];
            foreach ($result as $disc => $items) {
                $sum = 0;
                $count = 0;
                foreach ($items as $i) {
                    if (is_numeric($i['grade'])) {
                        $sum += $i['grade'];
                        $count++;
                    }
                }
                $avg = $count > 0 ? round($sum / $count, 2) : '-';
                $final[] = ['discipline' => $disc, 'grades' => $items, 'average' => $avg];
            }
            echo json_encode($final);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getAchievements()
    {
        try {
            $id = $this->getTargetStudentId();
            echo json_encode($this->repo->getAchievements($id));
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
