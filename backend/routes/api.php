<?php

use App\Controller\AuthController;
use App\Controller\TeacherController;
use App\Controller\ClassController;
use App\Controller\StudentController;
use App\Controller\AcademicYearController;
use App\Controller\DisciplineController;
use App\Controller\StudyPlanController;
use App\Controller\WorkloadController;
use App\Controller\ReportController;
use App\Controller\ParentController;
use App\Controller\UserController;
use App\Controller\JournalController;
use App\Controller\ProfileController;
use App\Controller\AchievementController;

$router->add('POST', 'auth/login', [AuthController::class, 'login']);
$router->add('GET', 'auth/logout', [AuthController::class, 'logout']);
$router->add('GET', 'auth/me', [AuthController::class, 'me']);

$router->add('GET', 'teachers', [TeacherController::class, 'index']);
$router->add('POST', 'teachers', [TeacherController::class, 'create']);
$router->add('PUT', 'teachers', [TeacherController::class, 'update']);
$router->add('DELETE', 'teachers', [TeacherController::class, 'delete']);

$router->add('GET', 'classes', [ClassController::class, 'index']);
$router->add('POST', 'classes', [ClassController::class, 'create']);
$router->add('PUT', 'classes', [ClassController::class, 'update']);

$router->add('GET', 'students', [StudentController::class, 'index']);
$router->add('POST', 'students', [StudentController::class, 'create']);
$router->add('PUT', 'students', [StudentController::class, 'update']);
$router->add('DELETE', 'students', [StudentController::class, 'delete']);

$router->add('GET', 'academic_years', [AcademicYearController::class, 'index']);
$router->add('POST', 'academic_years', [AcademicYearController::class, 'create']);
$router->add('PUT', 'academic_years', [AcademicYearController::class, 'update']);

$router->add('GET', 'disciplines', [DisciplineController::class, 'index']);
$router->add('POST', 'disciplines', [DisciplineController::class, 'create']);
$router->add('DELETE', 'disciplines', [DisciplineController::class, 'delete']);

$router->add('GET', 'study_plans', [StudyPlanController::class, 'index']);
$router->add('POST', 'study_plans', [StudyPlanController::class, 'create']);
$router->add('DELETE', 'study_plans', [StudyPlanController::class, 'delete']);

$router->add('GET', 'workload', [WorkloadController::class, 'index']);
$router->add('POST', 'workload', [WorkloadController::class, 'create']);
$router->add('DELETE', 'workload', [WorkloadController::class, 'delete']);

$router->add('GET', 'reports', [ReportController::class, 'index']);

$router->add('GET', 'parents', [ParentController::class, 'index']);
$router->add('POST', 'parents', [ParentController::class, 'create']);

$router->add('GET', 'student_parents', [ParentController::class, 'getLinked']);
$router->add('POST', 'student_parents', [ParentController::class, 'link']);
$router->add('DELETE', 'student_parents', [ParentController::class, 'unlink']);

$router->add('POST', 'auth/change_password', [UserController::class, 'changePassword']);
$router->add('POST', 'upload_avatar', [UserController::class, 'uploadAvatar']);
$router->add('POST', 'delete_avatar', [UserController::class, 'deleteAvatar']);

$router->add('GET', 'teacher/data', [JournalController::class, 'getData']);
$router->add('GET', 'teacher/journal', [JournalController::class, 'index']);
$router->add('POST', 'teacher/journal', [JournalController::class, 'save']);
$router->add('PUT', 'teacher/journal', [JournalController::class, 'updateTopic']);

$router->add('GET', 'student/profile/info', [ProfileController::class, 'getInfo']);
$router->add('GET', 'student/profile/grades', [ProfileController::class, 'getGrades']);
$router->add('GET', 'student/profile/achievements', [ProfileController::class, 'getAchievements']);

$router->add('POST', 'achievements', [AchievementController::class, 'create']);
$router->add('PUT', 'achievements', [AchievementController::class, 'update']);
$router->add('DELETE', 'achievements', [AchievementController::class, 'delete']);
