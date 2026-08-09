<?php

namespace App\Controller;

use App\Entity\Expense;
use App\Entity\ExpenseShare;
use App\Entity\TripParticipant;
use App\Entity\TripProject;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

final class ExpenseController extends AbstractController
{
    /**
     * Creates an expense for a trip project.
     *
     * 1. Finds the trip project.
     * 2. Checks that the authenticated user is an accepted participant.
     * 3. Reads and validates the expense data.
     * 4. Creates the Expense.
     * 5. Links it to the payer and the trip project.
     * 6. Saves it with Doctrine.
     */
    #[Route(
        '/api/trip-projects/{id}/expenses',
        name: 'api_expense_create',
        methods: ['POST']
    )]
    public function create(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $tripProject = $entityManager
            ->getRepository(TripProject::class)
            ->find($id);

        if (!$tripProject) {
            return $this->json(
                ['message' => 'Projet introuvable.'],
                Response::HTTP_NOT_FOUND
            );
        }

        $participation = $entityManager
            ->getRepository(TripParticipant::class)
            ->findOneBy([
                'user' => $user,
                'tripProject' => $tripProject,
                'status' => 'ACCEPTED',
            ]);

        if (!$participation) {
            return $this->json(
                ['message' => 'Vous ne participez pas à ce projet.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $data = $request->toArray();

        $title = trim((string) ($data['title'] ?? ''));
        $description = trim((string) ($data['description'] ?? ''));
        $amount = $data['amount'] ?? null;
        $paidAtValue = $data['paidAt'] ?? null;

        if ($title === '' || $amount === null) {
            return $this->json(
                ['message' => 'Le titre et le montant sont obligatoires.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        if (!is_numeric($amount) || (float) $amount <= 0) {
            return $this->json(
                ['message' => 'Le montant doit être supérieur à 0.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $paidAt = null;

        if ($paidAtValue) {
            try {
                $paidAt = new \DateTimeImmutable($paidAtValue);
            } catch (\Exception) {
                return $this->json(
                    ['message' => 'Format de date invalide.'],
                    Response::HTTP_BAD_REQUEST
                );
            }
        }

        $expense = new Expense();

        $expense
            ->setTitle($title)
            ->setDescription($description !== '' ? $description : null)
            ->setAmount((string) $amount)
            ->setPaidAt($paidAt)
            ->setPaidBy($user)
            ->setTripProject($tripProject);

        $entityManager->persist($expense);
        $entityManager->flush();

        return $this->json(
            [
                'message' => 'Dépense ajoutée.',
                'expense' => [
                    'id' => $expense->getId(),
                    'title' => $expense->getTitle(),
                    'description' => $expense->getDescription(),
                    'amount' => $expense->getAmount(),
                    'paidAt' => $expense->getPaidAt()?->format('Y-m-d H:i:s'),
                    'paidBy' => [
                        'id' => $user->getId(),
                        'firstname' => $user->getFirstname(),
                    ],
                ],
            ],
            Response::HTTP_CREATED
        );
    }

    /**
     * Returns all expenses for a trip project.
     *
     * Only accepted participants can access them.
     */
    #[Route(
        '/api/trip-projects/{id}/expenses',
        name: 'api_expense_list',
        methods: ['GET']
    )]
    public function list(
        int $id,
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $tripProject = $entityManager
            ->getRepository(TripProject::class)
            ->find($id);

        if (!$tripProject) {
            return $this->json(
                ['message' => 'Projet introuvable.'],
                Response::HTTP_NOT_FOUND
            );
        }

        $participation = $entityManager
            ->getRepository(TripParticipant::class)
            ->findOneBy([
                'user' => $user,
                'tripProject' => $tripProject,
                'status' => 'ACCEPTED',
            ]);

        if (!$participation) {
            return $this->json(
                ['message' => 'Vous n’avez pas accès aux dépenses de ce projet.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $expenses = $entityManager
            ->getRepository(Expense::class)
            ->findBy([
                'tripProject' => $tripProject,
            ]);

        $result = [];

        foreach ($expenses as $expense) {
            $paidBy = $expense->getPaidBy();

            $result[] = [
                'id' => $expense->getId(),
                'title' => $expense->getTitle(),
                'description' => $expense->getDescription(),
                'amount' => $expense->getAmount(),
                'paidAt' => $expense->getPaidAt()?->format('Y-m-d H:i:s'),
                'paidBy' => [
                    'id' => $paidBy->getId(),
                    'firstname' => $paidBy->getFirstname(),
                ],
            ];
        }

        return $this->json($result);
    }

    #[Route(
        '/api/expenses/{id}',
        name: 'api_expense_update',
        methods: ['PATCH']
    )]
    public function update(
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

        if ($expense->getPaidBy() !== $user) {
            return $this->json(
                ['message' => 'Vous ne pouvez modifier que vos propres dépenses.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $data = $request->toArray();

        if (isset($data['title'])) {
            $title = trim((string) $data['title']);

            if ($title === '') {
                return $this->json(
                    ['message' => 'Le titre ne peut pas être vide.'],
                    Response::HTTP_BAD_REQUEST
                );
            }

            $expense->setTitle($title);
        }

        if (array_key_exists('description', $data)) {
            $description = trim((string) ($data['description'] ?? ''));

            $expense->setDescription(
                $description !== '' ? $description : null
            );
        }

        if (isset($data['amount'])) {
            if (!is_numeric($data['amount']) || (float) $data['amount'] <= 0) {
                return $this->json(
                    ['message' => 'Le montant doit être supérieur à 0.'],
                    Response::HTTP_BAD_REQUEST
                );
            }

            $expense->setAmount((string) $data['amount']);
        }

        if (array_key_exists('paidAt', $data)) {
            $expense->setPaidAt(
                $data['paidAt'] !== null
                    ? new \DateTimeImmutable($data['paidAt'])
                    : null
            );
        }

        $entityManager->flush();

        return $this->json([
            'message' => 'Dépense modifiée.',
            'expense' => [
                'id' => $expense->getId(),
                'title' => $expense->getTitle(),
                'amount' => $expense->getAmount(),
                'paidAt' => $expense->getPaidAt()?->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    #[Route(
        '/api/expenses/{id}',
        name: 'api_expense_delete',
        methods: ['DELETE']
    )]
    public function delete(
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

        if ($expense->getPaidBy() !== $user) {
            return $this->json(
                ['message' => 'Vous ne pouvez supprimer que vos propres dépenses.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $entityManager->remove($expense);
        $entityManager->flush();

        return $this->json([
            'message' => 'Dépense supprimée.',
        ]);
    }

    /**
     * Calculates the balance of each participant for a trip project.
     *
     * Balance = total paid - total owed.
     *
     * A positive balance means the participant should receive money.
     * A negative balance means the participant owes money.
     */
    #[Route(
        '/api/trip-projects/{id}/balances',
        name: 'api_trip_project_balances',
        methods: ['GET']
    )]
    public function balances(
        int $id,
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $tripProject = $entityManager
            ->getRepository(TripProject::class)
            ->find($id);

        if (!$tripProject) {
            return $this->json(
                ['message' => 'Projet introuvable.'],
                Response::HTTP_NOT_FOUND
            );
        }

        // The authenticated user must be an accepted participant.
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

        // Get all accepted participants.
        $participants = $entityManager
            ->getRepository(TripParticipant::class)
            ->findBy([
                'tripProject' => $tripProject,
                'status' => 'ACCEPTED',
            ]);

        $balances = [];

        // Start everyone at 0.
        foreach ($participants as $participant) {
            $participantUser = $participant->getUser();

            $balances[$participantUser->getId()] = [
                'userId' => $participantUser->getId(),
                'firstname' => $participantUser->getFirstname(),
                'paid' => 0.0,
                'owed' => 0.0,
            ];
        }

        // Get all expenses for the project.
        $expenses = $entityManager
            ->getRepository(Expense::class)
            ->findBy([
                'tripProject' => $tripProject,
            ]);

        foreach ($expenses as $expense) {
            $payer = $expense->getPaidBy();

            // Money actually paid by this user.
            if (isset($balances[$payer->getId()])) {
                $balances[$payer->getId()]['paid'] +=
                    (float) $expense->getAmount();
            }

            // Money each participant owes for this expense.
            $shares = $entityManager
                ->getRepository(ExpenseShare::class)
                ->findBy([
                    'expense' => $expense,
                ]);

            foreach ($shares as $share) {
                $shareUser = $share->getUser();

                if (isset($balances[$shareUser->getId()])) {
                    $balances[$shareUser->getId()]['owed'] +=
                        (float) $share->getAmount();
                }
            }
        }

        $result = [];

        foreach ($balances as $balance) {
            $paid = $balance['paid'];
            $owed = $balance['owed'];

            $result[] = [
                'userId' => $balance['userId'],
                'firstname' => $balance['firstname'],
                'paid' => number_format($paid, 2, '.', ''),
                'owed' => number_format($owed, 2, '.', ''),
                'balance' => number_format(
                    $paid - $owed,
                    2,
                    '.',
                    ''
                ),
            ];
        }

        return $this->json([
            'tripProjectId' => $tripProject->getId(),
            'balances' => $result,
        ]);
    }

    /**
     * Calculates who should reimburse whom for a trip project.
     */
    #[Route(
        '/api/trip-projects/{id}/settlements',
        name: 'api_trip_project_settlements',
        methods: ['GET']
    )]
    public function settlements(
        int $id,
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $tripProject = $entityManager
            ->getRepository(TripProject::class)
            ->find($id);

        if (!$tripProject) {
            return $this->json(
                ['message' => 'Projet introuvable.'],
                Response::HTTP_NOT_FOUND
            );
        }

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

        $participants = $entityManager
            ->getRepository(TripParticipant::class)
            ->findBy([
                'tripProject' => $tripProject,
                'status' => 'ACCEPTED',
            ]);

        $balances = [];

        foreach ($participants as $participant) {
            $participantUser = $participant->getUser();

            $balances[$participantUser->getId()] = [
                'user' => $participantUser,
                'paid' => 0.0,
                'owed' => 0.0,
            ];
        }

        $expenses = $entityManager
            ->getRepository(Expense::class)
            ->findBy([
                'tripProject' => $tripProject,
            ]);

        foreach ($expenses as $expense) {
            $payer = $expense->getPaidBy();

            if (isset($balances[$payer->getId()])) {
                $balances[$payer->getId()]['paid'] += (float) $expense->getAmount();
            }

            $shares = $entityManager
                ->getRepository(ExpenseShare::class)
                ->findBy([
                    'expense' => $expense,
                ]);

            foreach ($shares as $share) {
                $shareUser = $share->getUser();

                if (isset($balances[$shareUser->getId()])) {
                    $balances[$shareUser->getId()]['owed'] += (float) $share->getAmount();
                }
            }
        }

        $creditors = [];
        $debtors = [];

        foreach ($balances as $balanceData) {
            $balance = $balanceData['paid'] - $balanceData['owed'];

            if ($balance > 0.001) {
                $creditors[] = [
                    'user' => $balanceData['user'],
                    'amount' => $balance,
                ];
            } elseif ($balance < -0.001) {
                $debtors[] = [
                    'user' => $balanceData['user'],
                    'amount' => abs($balance),
                ];
            }
        }

        $settlements = [];

        $creditorIndex = 0;
        $debtorIndex = 0;

        while (
            $creditorIndex < count($creditors)
            && $debtorIndex < count($debtors)
        ) {
            $creditor = &$creditors[$creditorIndex];
            $debtor = &$debtors[$debtorIndex];

            $amount = min($creditor['amount'], $debtor['amount']);

            $settlements[] = [
                'from' => [
                    'userId' => $debtor['user']->getId(),
                    'firstname' => $debtor['user']->getFirstname(),
                ],
                'to' => [
                    'userId' => $creditor['user']->getId(),
                    'firstname' => $creditor['user']->getFirstname(),
                ],
                'amount' => number_format($amount, 2, '.', ''),
            ];

            $creditor['amount'] -= $amount;
            $debtor['amount'] -= $amount;

            if ($creditor['amount'] <= 0.001) {
                $creditorIndex++;
            }

            if ($debtor['amount'] <= 0.001) {
                $debtorIndex++;
            }
        }

        return $this->json([
            'tripProjectId' => $tripProject->getId(),
            'settlements' => $settlements,
        ]);
    }
}