<?php

namespace App\Service;

use App\Repository\StudyPlanRepository;
use Exception;

class StudyPlanService
{
    private StudyPlanRepository $repository;

    public function __construct()
    {
        $this->repository = new StudyPlanRepository();
    }

    public function getPlans(): array
    {
        return $this->repository->findAll();
    }

    public function getPlanItems(int $planId): array
    {
        return $this->repository->findItems($planId);
    }

    public function handlePost(array $data): array
    {
        if (!empty($data['discipline_id'])) {
            $this->repository->upsertItem(
                $data['study_plan_id'],
                $data['discipline_id'],
                $data['lessons_count']
            );
            return ['message' => 'Item added/updated'];
        } else {
            $id = $this->repository->createPlan(
                $data['name'],
                $data['academic_year_id'],
                $data['parallel_number']
            );
            return ['message' => 'Plan created', 'id' => $id];
        }
    }

    public function deleteItem(int $itemId): void
    {
        $this->repository->deleteItem($itemId);
    }
}
