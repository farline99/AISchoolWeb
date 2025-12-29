<?php

namespace App\Repository;

use App\Core\Database;
use PDO;

class JournalRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Database::getConnection();
    }

    public function getClassesForTeacher(int $teacherId): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM get_all_classes_for_teacher(?)");
        $stmt->execute([$teacherId]);
        return $stmt->fetchAll();
    }

    public function getDisciplinesForJournal(int $classId, int $teacherId): array
    {
        $stmt = $this->pdo->prepare("SELECT c.head_teacher_id, p.number FROM class c JOIN parallel p ON c.parallel_id = p.id WHERE c.id = ?");
        $stmt->execute([$classId]);
        $details = $stmt->fetch();

        if ($details && $details['number'] <= 4 && $details['head_teacher_id'] == $teacherId) {
            $yearStmt = $this->pdo->query("SELECT id FROM academic_year WHERE status = 'Current' LIMIT 1");
            $acYearId = $yearStmt->fetchColumn();

            $sql = "SELECT DISTINCT d.id as discipline_id, d.name as discipline_name
            FROM study_plan_item spi
            JOIN study_plan sp ON spi.study_plan_id = sp.id
            JOIN discipline d ON spi.discipline_id = d.id
            JOIN class c ON sp.parallel_id = c.parallel_id
            WHERE c.id = ? AND sp.academic_year_id = ?
            ORDER BY d.name";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$classId, $acYearId]);
        } else {
            $sql = "SELECT DISTINCT d.id as discipline_id, d.name as discipline_name
            FROM workload w
            JOIN discipline d ON w.discipline_id = d.id
            WHERE w.class_id = ? AND w.teacher_id = ?
            ORDER BY d.name";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$classId, $teacherId]);
        }
        return $stmt->fetchAll();
    }

    public function getYearByDate(string $date): ?array
    {
        $stmt = $this->pdo->prepare("SELECT id, status FROM academic_year WHERE ? BETWEEN start_date AND end_date LIMIT 1");
        $stmt->execute([$date]);
        $data = $stmt->fetch();
        if (!$data) {
            $stmt = $this->pdo->query("SELECT id, status FROM academic_year WHERE status = 'Current' LIMIT 1");
            $data = $stmt->fetch();
        }
        return $data ?: null;
    }

    public function getStudents(int $classId, int $yearId, string $yearStatus): array
    {
        if ($yearStatus === 'Current') {
            $stmt = $this->pdo->prepare("SELECT * FROM get_journal_students(?)");
            $stmt->execute([$classId]);
            return $stmt->fetchAll();
        } else {
            $sql = "SELECT DISTINCT s.id as student_id, s.last_name, s.first_name, s.patronymic, (s.last_name || ' ' || s.first_name) as full_name
            FROM student s
            JOIN gradebook gb ON s.id = gb.student_id
            JOIN lesson l ON gb.lesson_id = l.id
            JOIN workload w ON l.workload_id = w.id
            WHERE w.class_id = ? AND w.academic_year_id = ?
            ORDER BY s.last_name, s.first_name";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$classId, $yearId]);
            return $stmt->fetchAll();
        }
    }

    public function getLessons(int $classId, int $discId, int $yearId, string $start, string $end): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM get_journal_lessons(?, ?, ?, ?::date, ?::date)");
        $stmt->execute([$classId, $discId, $yearId, $start, $end]);
        return $stmt->fetchAll();
    }

    public function getGrades(int $classId, int $discId, int $yearId): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM get_journal_grades(?, ?, ?)");
        $stmt->execute([$classId, $discId, $yearId]);
        return $stmt->fetchAll();
    }

    public function saveGrades(array $studentIds, int $lessonId, ?int $grade, string $workType, string $date): void
    {
        $pgArray = "{" . implode(',', $studentIds) . "}";
        $stmt = $this->pdo->prepare("SELECT add_bulk_grades(?::int[], ?, ?, ?, ?::date)");
        $stmt->execute([$pgArray, $lessonId, $grade, $workType, $date]);
    }

    public function updateLesson(int $lessonId, string $date, string $topic): void
    {
        $stmt = $this->pdo->prepare("SELECT update_lesson_details(?, ?::date, ?)");
        $stmt->execute([$lessonId, $date, $topic]);
    }
}
