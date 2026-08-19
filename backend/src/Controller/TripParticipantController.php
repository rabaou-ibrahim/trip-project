<?php

namespace App\Controller;

use App\Entity\TripParticipant;
use App\Entity\TripProject;
use App\Entity\DestinationProposal;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\User;

final class TripParticipantController extends AbstractController
{
    /**
     * Adds a user to a trip project as a pending MEMBER.
     *
     * 1. Finds the trip project.
     * 2. Checks that the authenticated user is the OWNER.
     * 3. Gets the invited user's email from the JSON body.
     * 4. Finds the invited user in the database.
     * 5. Checks that the user is not already a participant.
     * 6. Creates a TripParticipant with MEMBER/PENDING status.
     * 7. Saves it with Doctrine.
     */
    #[Route(
        '/api/trip-projects/{id}/participants',
        name: 'api_trip_participant_add',
        methods: ['POST']
    )]
    public function add(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository,
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
            ]);

        if (!$currentParticipation || $currentParticipation->getRole() !== 'OWNER') {
            return $this->json(
                ['message' => 'Seul le propriétaire peut ajouter des participants.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $data = $request->toArray();

        $email = strtolower(trim((string) ($data['email'] ?? '')));

        if ($email === '') {
            return $this->json(
                ['message' => 'L’email est obligatoire.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $invitedUser = $userRepository->findOneBy([
            'email' => $email,
        ]);

        if (!$invitedUser) {
            return $this->json(
                ['message' => 'Utilisateur introuvable.'],
                Response::HTTP_NOT_FOUND
            );
        }

        $existingParticipation = $entityManager
            ->getRepository(TripParticipant::class)
            ->findOneBy([
                'user' => $invitedUser,
                'tripProject' => $tripProject,
            ]);

        if ($existingParticipation) {
            return $this->json(
                ['message' => 'Cet utilisateur participe déjà à ce projet.'],
                Response::HTTP_CONFLICT
            );
        }

        $participant = new TripParticipant();

        $participant
            ->setUser($invitedUser)
            ->setTripProject($tripProject)
            ->setRole('MEMBER')
            ->setStatus('PENDING');

        $entityManager->persist($participant);
        $entityManager->flush();

        return $this->json(
            [
                'message' => 'Invitation envoyée.',
                'participant' => [
                    'id' => $participant->getId(),
                    'userId' => $invitedUser->getId(),
                    'email' => $invitedUser->getEmail(),
                    'role' => $participant->getRole(),
                    'status' => $participant->getStatus(),
                ],
            ],
            Response::HTTP_CREATED
        );
    }

    /**
     * Returns the pending trip invitations of the authenticated user.
    */
    #[Route('/api/invitations', name: 'api_trip_invitations', methods: ['GET'])]
    public function invitations(
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $invitations = $entityManager
            ->getRepository(TripParticipant::class)
            ->findBy([
                'user' => $user,
                'status' => 'PENDING',
            ]);

        $result = [];

        foreach ($invitations as $invitation) {
            $tripProject = $invitation->getTripProject();

            $result[] = [
                'participantId' => $invitation->getId(),
                'tripProjectId' => $tripProject->getId(),
                'title' => $tripProject->getTitle(),
                'description' => $tripProject->getDescription(),
                'role' => $invitation->getRole(),
                'status' => $invitation->getStatus(),
                'createdAt' => $invitation->getCreatedAt(),
            ];
        }

        return $this->json($result);
    }

    #[Route(
        '/api/trip-participants/{id}/accept',
        name: 'api_trip_participant_accept',
        methods: ['PATCH']
    )]
    public function accept(
        int $id,
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $participant = $entityManager
            ->getRepository(TripParticipant::class)
            ->find($id);

        if (!$participant) {
            return $this->json(
                ['message' => 'Invitation introuvable.'],
                Response::HTTP_NOT_FOUND
            );
        }

        if ($participant->getUser() !== $user) {
            return $this->json(
                ['message' => 'Vous ne pouvez pas accepter cette invitation.'],
                Response::HTTP_FORBIDDEN
            );
        }

        if ($participant->getStatus() !== 'PENDING') {
            return $this->json(
                ['message' => 'Cette invitation a déjà été traitée.'],
                Response::HTTP_CONFLICT
            );
        }

        $participant
            ->setStatus('ACCEPTED')
            ->setJoinedAt(new \DateTimeImmutable());

        $entityManager->flush();

        return $this->json([
            'message' => 'Invitation acceptée.',
        ]);
    }

    #[Route(
        '/api/trip-participants/{id}/decline',
        name: 'api_trip_participant_decline',
        methods: ['PATCH']
    )]
    public function decline(
        int $id,
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $participant = $entityManager
            ->getRepository(TripParticipant::class)
            ->find($id);

        if (!$participant) {
            return $this->json(
                ['message' => 'Invitation introuvable.'],
                Response::HTTP_NOT_FOUND
            );
        }

        if ($participant->getUser() !== $user) {
            return $this->json(
                ['message' => 'Vous ne pouvez pas refuser cette invitation.'],
                Response::HTTP_FORBIDDEN
            );
        }

        if ($participant->getStatus() !== 'PENDING') {
            return $this->json(
                ['message' => 'Cette invitation a déjà été traitée.'],
                Response::HTTP_CONFLICT
            );
        }

        $participant->setStatus('DECLINED');

        $entityManager->flush();

        return $this->json([
            'message' => 'Invitation refusée.',
        ]);
    }

    /**
     * Returns the participants of a trip project.
     *
     * 1. Finds the trip project.
     * 2. Checks that the authenticated user belongs to the project.
     * 3. Gets all participants of the project.
     * 4. Returns their user information, role and status.
     */
    #[Route(
        '/api/trip-projects/{id}/participants',
        name: 'api_trip_participant_list',
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

        // Check that the authenticated user belongs to this project
        $currentParticipation = $entityManager
            ->getRepository(TripParticipant::class)
            ->findOneBy([
                'user' => $user,
                'tripProject' => $tripProject,
            ]);

        if (!$currentParticipation || $currentParticipation->getStatus() !== 'ACCEPTED') {
            return $this->json(
                ['message' => 'Vous n’avez pas accès aux participants de ce projet.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $participants = $entityManager
            ->getRepository(TripParticipant::class)
            ->findBy([
                'tripProject' => $tripProject,
            ]);

        $result = [];

        foreach ($participants as $participant) {
            $participantUser = $participant->getUser();

            $result[] = [
                'participantId' => $participant->getId(),
                'userId' => $participantUser->getId(),
                'firstname' => $participantUser->getFirstname(),
                'lastname' => $participantUser->getLastname(),
                'username' => $participantUser->getUsername(),
                'avatar' => $participantUser->getAvatar(),
                'role' => $participant->getRole(),
                'status' => $participant->getStatus(),
                'joinedAt' => $participant->getJoinedAt()?->format('Y-m-d H:i:s'),
            ];
        }

        return $this->json($result);
    }
}