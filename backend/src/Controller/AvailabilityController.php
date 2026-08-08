<?php

namespace App\Controller;

use App\Entity\Availability;
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

final class AvailabilityController extends AbstractController
{
    /**
     * Adds an availability period for the authenticated user.
     *
     * 1. Finds the trip project.
     * 2. Checks that the user is an accepted participant.
     * 3. Reads startDate and endDate from the JSON body.
     * 4. Validates the dates.
     * 5. Creates and saves the availability.
     */
    #[Route(
        '/api/trip-projects/{id}/availabilities',
        name: 'api_availability_create',
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

        $startDateValue = $data['startDate'] ?? null;
        $endDateValue = $data['endDate'] ?? null;

        if (!$startDateValue || !$endDateValue) {
            return $this->json(
                ['message' => 'Les dates de début et de fin sont obligatoires.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        try {
            $startDate = new \DateTimeImmutable($startDateValue);
            $endDate = new \DateTimeImmutable($endDateValue);
        } catch (\Exception) {
            return $this->json(
                ['message' => 'Format de date invalide.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        if ($startDate > $endDate) {
            return $this->json(
                ['message' => 'La date de début doit être antérieure à la date de fin.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $availability = new Availability();

        $availability
            ->setUser($user)
            ->setTripProject($tripProject)
            ->setStartDate($startDate)
            ->setEndDate($endDate);

        $entityManager->persist($availability);
        $entityManager->flush();

        return $this->json(
            [
                'message' => 'Disponibilité ajoutée.',
                'availability' => [
                    'id' => $availability->getId(),
                    'startDate' => $availability->getStartDate()?->format('Y-m-d'),
                    'endDate' => $availability->getEndDate()?->format('Y-m-d'),
                ],
            ],
            Response::HTTP_CREATED
        );
    }

    /**
     * Returns all availabilities for a trip project.
     *
     * Only accepted participants can access them.
     */
    #[Route(
        '/api/trip-projects/{id}/availabilities',
        name: 'api_availability_list',
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

        // Check that the authenticated user is an accepted participant
        $participation = $entityManager
            ->getRepository(TripParticipant::class)
            ->findOneBy([
                'user' => $user,
                'tripProject' => $tripProject,
                'status' => 'ACCEPTED',
            ]);

        if (!$participation) {
            return $this->json(
                ['message' => 'Vous n’avez pas accès aux disponibilités de ce projet.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $availabilities = $entityManager
            ->getRepository(Availability::class)
            ->findBy([
                'tripProject' => $tripProject,
            ]);

        $result = [];

        foreach ($availabilities as $availability) {
            $availabilityUser = $availability->getUser();

            $result[] = [
                'id' => $availability->getId(),
                'userId' => $availabilityUser->getId(),
                'username' => $availabilityUser->getUsername(),
                'firstname' => $availabilityUser->getFirstname(),
                'lastname' => $availabilityUser->getLastname(),
                'startDate' => $availability->getStartDate()?->format('Y-m-d'),
                'endDate' => $availability->getEndDate()?->format('Y-m-d'),
            ];
        }

        return $this->json($result);
    }

    /**
     * Calculates the periods where all accepted participants are available.
     */
    #[Route(
        '/api/trip-projects/{id}/common-availability',
        name: 'api_common_availability',
        methods: ['GET']
    )]
    public function commonAvailability(
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

        // Check that the authenticated user belongs to the project
        $currentParticipation = $entityManager
            ->getRepository(TripParticipant::class)
            ->findOneBy([
                'user' => $user,
                'tripProject' => $tripProject,
                'status' => 'ACCEPTED',
            ]);

        if (!$currentParticipation) {
            return $this->json(
                ['message' => 'Vous n’avez pas accès à ce projet.'],
                Response::HTTP_FORBIDDEN
            );
        }

        // Get all accepted participants
        $participants = $entityManager
            ->getRepository(TripParticipant::class)
            ->findBy([
                'tripProject' => $tripProject,
                'status' => 'ACCEPTED',
            ]);

        $commonPeriods = null;

        foreach ($participants as $participant) {
            $participantUser = $participant->getUser();

            $availabilities = $entityManager
                ->getRepository(Availability::class)
                ->findBy(
                    [
                        'tripProject' => $tripProject,
                        'user' => $participantUser,
                    ],
                    [
                        'startDate' => 'ASC',
                    ]
                );

            // If one accepted participant has given no availability,
            // we cannot calculate a common period yet.
            if (count($availabilities) === 0) {
                return $this->json([
                    'message' => 'Tous les participants n’ont pas encore renseigné leurs disponibilités.',
                    'commonPeriods' => [],
                ]);
            }

            $userPeriods = [];

            foreach ($availabilities as $availability) {
                $userPeriods[] = [
                    'start' => $availability->getStartDate(),
                    'end' => $availability->getEndDate(),
                ];
            }

            // First participant: use their periods as the starting point
            if ($commonPeriods === null) {
                $commonPeriods = $userPeriods;
                continue;
            }

            $intersections = [];

            // Compare the current common periods
            // with this participant's periods
            foreach ($commonPeriods as $commonPeriod) {
                foreach ($userPeriods as $userPeriod) {
                    $start = $commonPeriod['start'] > $userPeriod['start']
                        ? $commonPeriod['start']
                        : $userPeriod['start'];

                    $end = $commonPeriod['end'] < $userPeriod['end']
                        ? $commonPeriod['end']
                        : $userPeriod['end'];

                    if ($start <= $end) {
                        $intersections[] = [
                            'start' => $start,
                            'end' => $end,
                        ];
                    }
                }
            }

            $commonPeriods = $intersections;

            // No need to continue if there is already no common period
            if (count($commonPeriods) === 0) {
                break;
            }
        }

        $result = [];

        foreach ($commonPeriods ?? [] as $period) {
            $result[] = [
                'startDate' => $period['start']->format('Y-m-d'),
                'endDate' => $period['end']->format('Y-m-d'),
            ];
        }

        return $this->json([
            'commonPeriods' => $result,
        ]);
    }

    #[Route(
        '/api/availabilities/{id}',
        name: 'api_availability_update',
        methods: ['PATCH']
    )]
    public function update(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $availability = $entityManager
            ->getRepository(Availability::class)
            ->find($id);

        if (!$availability) {
            return $this->json(
                ['message' => 'Disponibilité introuvable.'],
                Response::HTTP_NOT_FOUND
            );
        }

        if ($availability->getUser() !== $user) {
            return $this->json(
                ['message' => 'Vous ne pouvez modifier que vos propres disponibilités.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $data = $request->toArray();

        $startDate = $availability->getStartDate();
        $endDate = $availability->getEndDate();

        if (isset($data['startDate'])) {
            $startDate = new \DateTimeImmutable($data['startDate']);
        }

        if (isset($data['endDate'])) {
            $endDate = new \DateTimeImmutable($data['endDate']);
        }

        if ($startDate > $endDate) {
            return $this->json(
                ['message' => 'La date de début doit être antérieure à la date de fin.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $availability
            ->setStartDate($startDate)
            ->setEndDate($endDate)
            ->setUpdatedAt(new \DateTimeImmutable());

        $entityManager->flush();

        return $this->json([
            'message' => 'Disponibilité modifiée.',
            'availability' => [
                'id' => $availability->getId(),
                'startDate' => $availability->getStartDate()->format('Y-m-d'),
                'endDate' => $availability->getEndDate()->format('Y-m-d'),
            ],
        ]);
    }

    #[Route(
        '/api/availabilities/{id}',
        name: 'api_availability_delete',
        methods: ['DELETE']
    )]
    public function delete(
        int $id,
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $availability = $entityManager
            ->getRepository(Availability::class)
            ->find($id);

        if (!$availability) {
            return $this->json(
                ['message' => 'Disponibilité introuvable.'],
                Response::HTTP_NOT_FOUND
            );
        }

        if ($availability->getUser() !== $user) {
            return $this->json(
                ['message' => 'Vous ne pouvez supprimer que vos propres disponibilités.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $entityManager->remove($availability);
        $entityManager->flush();

        return $this->json([
            'message' => 'Disponibilité supprimée.',
        ]);
    }
}