<?php

namespace App\Controller;

use App\Entity\TripProject;
use App\Entity\TripParticipant;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

final class TripProjectController extends AbstractController
{
    /**
     * Creates a new trip project.
     *
     * 1. Gets the JSON data sent by the frontend.
     * 2. Checks that the title is provided.
     * 3. Creates and fills a TripProject object.
     * 4. Gets the authenticated user from the JWT.
     * 5. Automatically adds this user to the project
     *    as a participant with the OWNER role.
     * 6. Saves the project and the participant to the database using Doctrine.
     * 7. Returns the created project as JSON.
    */
    #[Route('/api/trip-projects', name: 'api_trip_project_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $data = $request->toArray();

        $title = trim((string) ($data['title'] ?? ''));
        $description = trim((string) ($data['description'] ?? ''));

        if ($title === '') {
            return $this->json(
                ['message' => 'Le titre est obligatoire.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $tripProject = new TripProject();

        $tripProject
            ->setTitle($title)
            ->setDescription($description !== '' ? $description : null)
            ->setStatus('draft');

        $participant = new TripParticipant();

        $participant
            ->setUser($user)
            ->setTripProject($tripProject)
            ->setRole('OWNER')
            ->setStatus('ACCEPTED')
            ->setJoinedAt(new \DateTimeImmutable());

        $entityManager->persist($tripProject);
        $entityManager->persist($participant);

        $entityManager->flush();

        return $this->json(
            [
                'message' => 'Projet créé avec succès.',
                'tripProject' => [
                    'id' => $tripProject->getId(),
                    'title' => $tripProject->getTitle(),
                    'description' => $tripProject->getDescription(),
                    'status' => $tripProject->getStatus(),
                ],
            ],
            Response::HTTP_CREATED
        );
    }

    #[Route('/api/trip-projects', name: 'api_trip_project_list', methods: ['GET'])]
    public function list(
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $participations = $entityManager
            ->getRepository(TripParticipant::class)
            ->findBy(['user' => $user]);

        $projects = [];

        foreach ($participations as $participation) {
            $tripProject = $participation->getTripProject();

            $projects[] = [
                'id' => $tripProject->getId(),
                'title' => $tripProject->getTitle(),
                'description' => $tripProject->getDescription(),
                'status' => $tripProject->getStatus(),
                'startDate' => $tripProject->getStartDate()?->format('Y-m-d'),
                'endDate' => $tripProject->getEndDate()?->format('Y-m-d'),
                'estimatedBudget' => $tripProject->getEstimatedBudget(),
                'role' => $participation->getRole(),
            ];
        }

        return $this->json($projects);
    }

    #[Route('/api/trip-projects/{id}', name: 'api_trip_project_show', methods: ['GET'])]
    public function show(
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
            ]);

        if (!$participation) {
            return $this->json(
                ['message' => 'Vous n’avez pas accès à ce projet.'],
                Response::HTTP_FORBIDDEN
            );
        }

        return $this->json([
            'id' => $tripProject->getId(),
            'title' => $tripProject->getTitle(),
            'description' => $tripProject->getDescription(),
            'status' => $tripProject->getStatus(),
            'startDate' => $tripProject->getStartDate()?->format('Y-m-d'),
            'endDate' => $tripProject->getEndDate()?->format('Y-m-d'),
            'estimatedBudget' => $tripProject->getEstimatedBudget(),
            'role' => $participation->getRole(),
        ]);
    }

    #[Route('/api/trip-projects/{id}', name: 'api_trip_project_update', methods: ['PATCH'])]
    public function update(
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
            ]);

        if (!$participation) {
            return $this->json(
                ['message' => 'Vous n’avez pas accès à ce projet.'],
                Response::HTTP_FORBIDDEN
            );
        }

        if ($participation->getRole() !== 'OWNER') {
            return $this->json(
                ['message' => 'Seul le propriétaire peut modifier ce projet.'],
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

            $tripProject->setTitle($title);
        }

        if (array_key_exists('description', $data)) {
            $description = trim((string) ($data['description'] ?? ''));

            $tripProject->setDescription(
                $description !== '' ? $description : null
            );
        }

        if (isset($data['status'])) {
            $tripProject->setStatus((string) $data['status']);
        }

        if (array_key_exists('estimatedBudget', $data)) {
            $tripProject->setEstimatedBudget(
                $data['estimatedBudget'] !== null
                    ? (string) $data['estimatedBudget']
                    : null
            );
        }

        $tripProject->setUpdatedAt(new \DateTimeImmutable());

        $entityManager->flush();

        return $this->json([
            'message' => 'Projet modifié avec succès.',
            'tripProject' => [
                'id' => $tripProject->getId(),
                'title' => $tripProject->getTitle(),
                'description' => $tripProject->getDescription(),
                'status' => $tripProject->getStatus(),
                'estimatedBudget' => $tripProject->getEstimatedBudget(),
                'updatedAt' => $tripProject->getUpdatedAt()?->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    #[Route('/api/trip-projects/{id}', name: 'api_trip_project_delete', methods: ['DELETE'])]
    public function delete(
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
            ]);

        if (!$participation) {
            return $this->json(
                ['message' => 'Vous n’avez pas accès à ce projet.'],
                Response::HTTP_FORBIDDEN
            );
        }

        if ($participation->getRole() !== 'OWNER') {
            return $this->json(
                ['message' => 'Seul le propriétaire peut supprimer ce projet.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $entityManager->remove($tripProject);
        $entityManager->flush();

        return $this->json([
            'message' => 'Projet supprimé avec succès.',
        ]);
    }
}