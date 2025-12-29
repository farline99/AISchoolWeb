<?php

namespace App\Controller;

use App\Repository\JournalRepository;
use Exception;

class JournalController
{
    private JournalRepository $repo;

    public function __construct()
    {
        $this->repo = new JournalRepository();
    }

    public function getData()
    {
        if (empty($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            return;
        }
        $teacherId = $_SESSION['user_id'];
        $action = $_GET['action'] ?? '';

        if ($action === 'classes') {
            echo json_encode($this->repo->getClassesForTeacher($teacherId));
        } elseif ($action === 'disciplines') {
            $classId = $_GET['class_id'] ?? null;
            if (!$classId) {
                echo json_encode([]);
                return;
            }
            echo json_encode($this->repo->getDisciplinesForJournal((int)$classId, $teacherId));
        }
    }

    public function index()
    {
        $classId = $_GET['class_id'];
        $disciplineId = $_GET['discipline_id'];
        $month = $_GET['month'] ?? date('m');
        $year = $_GET['year'] ?? date('Y');
        $startDate = "$year-$month-01";
        $endDate = date("Y-m-t", strtotime($startDate));

        try {
            $yearInfo = $this->repo->getYearByDate($startDate);
            if (!$yearInfo) throw new Exception('Нет активного учебного года');

            $students = $this->repo->getStudents($classId, $yearInfo['id'], $yearInfo['status']);
            $lessons = $this->repo->getLessons($classId, $disciplineId, $yearInfo['id'], $startDate, $endDate);
            $grades = $this->repo->getGrades($classId, $disciplineId, $yearInfo['id']);

            echo json_encode([
                'students' => $students,
                'lessons' => $lessons,
                'grades' => $grades,
                'year_id' => $yearInfo['id']
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function save(array $data)
    {
        try {
            $action = $data['action'] ?? 'single';

            $grade = is_numeric($data['value'] ?? '') ? (int)$data['value'] : null;
            $workType = ($data['value'] === 'Н' || $data['value'] === 'H') ? 'Н' : 'Работа на уроке';
            if (($data['value'] ?? '') === '') $grade = 0;

            if ($action === 'bulk') {
                $grade = $data['grade'];
                $workType = $data['work_type'];
                $students = $data['student_ids'];
            } else {
                $students = [$data['student_id']];
            }

            $this->repo->saveGrades($students, $data['lesson_id'], $grade, $workType, $data['lesson_date']);
            echo json_encode(['message' => 'Saved']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function updateTopic(array $data)
    {
        try {
            $this->repo->updateLesson($data['lesson_id'], $data['lesson_date'], $data['topic']);
            echo json_encode(['message' => 'Lesson updated']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
