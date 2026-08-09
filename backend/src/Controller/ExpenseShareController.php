<?php

namespace App\Controller;

use App\Entity\Expense;
use App\Entity\ExpenseShare;
use App\Entity\TripParticipant;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

final class ExpenseShareController extends AbstractController
{
    /**
     * Splits an expense between trip participants.
     *
     * 1. Finds the expense.
     * 2. Checks that the authenticated user belongs to the trip.
     * 3. Validates the provided shares.
     * 4. Checks that each user is an accepted participant.
     * 5. Checks that the total of the shares matches the expense amount.
     * 6. Creates the ExpenseShare rows.
     */
    #[Route(
        '/api/expenses/{id}/shares',
        name: 'api_expense_share_create',
        methods: ['POST']
    )]
    public function create(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $expense = $entityManager
            ->getRepository(Expense::class)
            ->find($id);

        if (!$expense) {
            return $this->json(
                ['message' => 'Dépense introuvable.'],
                Response::HTTP_NOT_FOUND
            );
        }

        $tripProject = $expense->getTripProject();

        $currentParticipation = $entityManager
            ->getRepository(TripParticipant::class)
            ->findOneBy([
                'user' => $user,
                'tripProject' => $tripProject,
                'status' => 'ACCEPTED',
            ]);

        if (!$currentParticipation) {
            return $this->json(
                ['message' => 'Vous ne participez pas à ce projet.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $data = $request->toArray();
        $sharesData = $data['shares'] ?? null;

        if (!is_array($sharesData) || count($sharesData) === 0) {
            return $this->json(
                ['message' => 'Au moins une répartition est obligatoire.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $total = 0.0;
        $shares = [];

        foreach ($sharesData as $shareData) {
            $userId = $shareData['userId'] ?? null;
            $amount = $shareData['amount'] ?? null;

            if (!$userId || !is_numeric($amount) || (float) $amount <= 0) {
                return $this->json(
                    ['message' => 'Chaque répartition doit contenir un userId et un montant valide.'],
                    Response::HTTP_BAD_REQUEST
                );
            }

            $shareUser = $entityManager
                ->getRepository(User::class)
                ->find($userId);

            if (!$shareUser) {
                return $this->json(
                    ['message' => 'Utilisateur introuvable.'],
                    Response::HTTP_NOT_FOUND
                );
            }

            $participation = $entityManager
                ->getRepository(TripParticipant::class)
                ->findOneBy([
                    'user' => $shareUser,
                    'tripProject' => $tripProject,
                    'status' => 'ACCEPTED',
                ]);

            if (!$participation) {
                return $this->json(
                    ['message' => 'Un utilisateur de la répartition ne participe pas à ce projet.'],
                    Response::HTTP_BAD_REQUEST
                );
            }

            $existingShare = $entityManager
                ->getRepository(ExpenseShare::class)
                ->findOneBy([
                    'user' => $shareUser,
                    'expense' => $expense,
                ]);

            if ($existingShare) {
                return $this->json(
                    ['message' => 'Une répartition existe déjà pour cet utilisateur.'],
                    Response::HTTP_CONFLICT
                );
            }

            $share = new ExpenseShare();

            $share
                ->setUser($shareUser)
                ->setExpense($expense)
                ->setAmount((string) $amount);

            $shares[] = $share;
            $total += (float) $amount;
        }

        if (abs($total - (float) $expense->getAmount()) > 0.001) {
            return $this->json(
                ['message' => 'Le total des répartitions doit être égal au montant de la dépense.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        foreach ($shares as $share) {
            $entityManager->persist($share);
        }

        $entityManager->flush();

        return $this->json(
            [
                'message' => 'Dépense répartie avec succès.',
                'expenseId' => $expense->getId(),
                'total' => number_format($total, 2, '.', ''),
            ],
            Response::HTTP_CREATED
        );
    }

    #[Route(
        '/api/expenses/{id}/shares',
        name: 'api_expense_share_list',
        methods: ['GET']
    )]
    public function list(
        int $id,
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $expense = $entityManager
            ->getRepository(Expense::class)
            ->find($id);

        if (!$expense) {
            return $this->json(
                ['message' => 'Dépense introuvable.'],
                Response::HTTP_NOT_FOUND
            );
        }

        $tripProject = $expense->getTripProject();

        $participation = $entityManager
            ->getRepository(TripParticipant::class)
            ->findOneBy([
                'user' => $user,
                'tripProject' => $tripProject,
                'status' => 'ACCEPTED',
            ]);

        if (!$participation) {
            return $this->json(
                ['message' => 'Vous n’avez pas accès à cette dépense.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $shares = $entityManager
            ->getRepository(ExpenseShare::class)
            ->findBy([
                'expense' => $expense,
            ]);

        $result = [];

        foreach ($shares as $share) {
            $shareUser = $share->getUser();

            $result[] = [
                'id' => $share->getId(),
                'userId' => $shareUser->getId(),
                'firstname' => $shareUser->getFirstname(),
                'amount' => $share->getAmount(),
            ];
        }

        return $this->json([
            'expense' => [
                'id' => $expense->getId(),
                'title' => $expense->getTitle(),
                'amount' => $expense->getAmount(),
                'paidBy' => [
                    'id' => $expense->getPaidBy()->getId(),
                    'firstname' => $expense->getPaidBy()->getFirstname(),
                ],
            ],
            'shares' => $result,
        ]);
    }
}