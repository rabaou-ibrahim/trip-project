<?php

namespace App\Controller;

use App\Entity\TripProject;
use App\Entity\TripParticipant;
use App\Entity\User;
use App\Entity\DestinationProposal;
use App\Entity\Vote;
use App\Repository\TripParticipantRepository;
use App\Repository\TripProjectRepository;
use App\Repository\AvailabilityRepository;
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
        $startDate = $data['startDate'] ?? null;
        $endDate = $data['endDate'] ?? null;
        $estimatedBudget = $data['estimatedBudget'] ?? null;

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

        if ($startDate !== null && $startDate !== '') {
            try {
                $tripProject->setStartDate(new \DateTime($startDate));
            } catch (\Exception) {
                return $this->json(
                    ['message' => 'La date de début est invalide.'],
                    Response::HTTP_BAD_REQUEST
                );
            }
        }

        if ($endDate !== null && $endDate !== '') {
            try {
                $tripProject->setEndDate(new \DateTime($endDate));
            } catch (\Exception) {
                return $this->json(
                    ['message' => 'La date de fin est invalide.'],
                    Response::HTTP_BAD_REQUEST
                );
            }
        }

        if ($estimatedBudget !== null && $estimatedBudget !== '') {
            $tripProject->setEstimatedBudget((string) $estimatedBudget);
        }

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
                    'startDate' => $tripProject->getStartDate()?->format('Y-m-d'),
                    'endDate' => $tripProject->getEndDate()?->format('Y-m-d'),
                    'estimatedBudget' => $tripProject->getEstimatedBudget(),
                ],
            ],
            Response::HTTP_CREATED
        );
    }

    #[Route('/api/trip-projects', name: 'api_trip_project_list', methods: ['GET'])]
    public function list(
        TripParticipantRepository $participantRepository,
        #[CurrentUser] User $user
    ): JsonResponse {
        $participations = $participantRepository->findAcceptedForUser($user);
        $tripProjects = array_map(
            static fn (TripParticipant $participation): TripProject =>
                $participation->getTripProject(),
            $participations
        );
        $participantCounts = $participantRepository
            ->countAcceptedByProjects($tripProjects);

        $projects = [];

        foreach ($participations as $participation) {
            $tripProject = $participation->getTripProject();
            $tripProjectId = (int) $tripProject->getId();

            $participantsPreview = $participantRepository
                ->findAcceptedPreview($tripProject, 4);

            $projects[] = array_merge(
                $this->serializeTripProject(
                    $tripProject,
                    $participation,
                    $participantCounts[$tripProjectId] ?? 0
                ),
                [
                    'participantsPreview' => array_map(
                        static function (TripParticipant $participant): array {
                            $participantUser = $participant->getUser();

                            return [
                                'id' => $participant->getId(),
                                'userId' => $participantUser->getId(),
                                'firstname' => $participantUser->getFirstname(),
                                'username' => $participantUser->getUsername(),
                                'avatar' => $participantUser->getAvatar(),
                            ];
                        },
                        $participantsPreview
                    ),
                ]
            );
        }

        return $this->json($projects);
    }

    #[Route('/api/trip-projects/{id}', name: 'api_trip_project_show', methods: ['GET'])]
    public function show(
        int $id,
        EntityManagerInterface $entityManager,
        TripParticipantRepository $participantRepository,
        AvailabilityRepository $availabilityRepository,
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

        $participation = $participantRepository
            ->findAcceptedMembership($user, $tripProject);

        if (!$participation) {
            return $this->json(
                ['message' => 'Vous n’avez pas accès à ce projet.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $participantsPreview = $participantRepository
            ->findAcceptedPreview($tripProject);

        $pendingInvitations = $participantRepository
            ->findPendingForProject($tripProject);
        
            $acceptedParticipantCount =
        $participantRepository->countAcceptedForProject($tripProject);

        $usersWithAvailabilityCount =
        $availabilityRepository->countDistinctUsersForProject($tripProject);

        $availabilitiesStepCompleted =
        $tripProject->isParticipantsStepCompleted()
        && $acceptedParticipantCount > 0
        && $usersWithAvailabilityCount >= $acceptedParticipantCount;

        return $this->json(array_merge(
        $this->serializeTripProject(
            $tripProject,
            $participation,
            $acceptedParticipantCount
        ),
        [
            'availabilitiesStepCompleted' => $availabilitiesStepCompleted,

            'participantsPreview' => array_map(
                static function (TripParticipant $participant) use ($user): array {
                    $participantUser = $participant->getUser();

                    return [
                        'id' => $participant->getId(),
                        'userId' => $participantUser->getId(),
                        'firstname' => $participantUser->getFirstname(),
                        'username' => $participantUser->getUsername(),
                        'avatar' => $participantUser->getAvatar(),
                        'role' => $participant->getRole(),
                        'isCurrentUser' =>
                            $participantUser->getId() === $user->getId(),
                    ];
                },
                $participantsPreview
            ),
            'pendingInvitations' => array_map(
                static function (TripParticipant $participant): array {
                    $participantUser = $participant->getUser();

                    return [
                        'id' => $participant->getId(),
                        'userId' => $participantUser->getId(),
                        'email' => $participantUser->getEmail(),
                        'firstname' => $participantUser->getFirstname(),
                        'username' => $participantUser->getUsername(),
                        'status' => $participant->getStatus(),
                        'createdAt' => $participant->getCreatedAt()?->format(DATE_ATOM),
                        ];
                },
                $pendingInvitations
                ),
        ]
    ));
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

        if (array_key_exists('startDate', $data)) {
        if ($data['startDate'] === null || $data['startDate'] === '') {
            $tripProject->setStartDate(null);
        } else {
            try {
                $tripProject->setStartDate(new \DateTime((string) $data['startDate']));
            } catch (\Exception) {
                return $this->json(
                    ['message' => 'La date de début est invalide.'],
                    Response::HTTP_BAD_REQUEST
                );
            }
        }
    }

    if (array_key_exists('endDate', $data)) {
        if ($data['endDate'] === null || $data['endDate'] === '') {
            $tripProject->setEndDate(null);
        } else {
            try {
                $tripProject->setEndDate(new \DateTime((string) $data['endDate']));
            } catch (\Exception) {
                return $this->json(
                    ['message' => 'La date de fin est invalide.'],
                    Response::HTTP_BAD_REQUEST
                );
            }
        }
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

    /**
     * Closes the destination vote and selects the winning proposal.
     *
     * Only the OWNER can close the vote.
     */
    #[Route(
        '/api/trip-projects/{id}/close-destination-vote',
        name: 'api_trip_project_close_destination_vote',
        methods: ['PATCH']
    )]
    public function closeDestinationVote(
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

        if (!$participation || $participation->getRole() !== 'OWNER') {
            return $this->json(
                ['message' => 'Seul le propriétaire peut clôturer le vote.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $proposals = $entityManager
            ->getRepository(DestinationProposal::class)
            ->findBy([
                'tripProject' => $tripProject,
            ]);

        if (count($proposals) === 0) {
            return $this->json(
                ['message' => 'Aucune destination n’a été proposée.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $winner = null;
        $bestScore = null;
        $tie = false;

        foreach ($proposals as $proposal) {
            $votes = $entityManager
                ->getRepository(Vote::class)
                ->findBy([
                    'destinationProposal' => $proposal,
                ]);

            $score = 0;

            foreach ($votes as $vote) {
                $score += $vote->getValue();
            }

            if ($bestScore === null || $score > $bestScore) {
                $bestScore = $score;
                $winner = $proposal;
                $tie = false;
            } elseif ($score === $bestScore) {
                $tie = true;
            }
        }

        if ($tie) {
            return $this->json(
                ['message' => 'Le vote est à égalité entre plusieurs destinations.'],
                Response::HTTP_CONFLICT
            );
        }

        $tripProject
            ->setSelectedDestination($winner)
            ->setUpdatedAt(new \DateTimeImmutable());

        $entityManager->flush();

        return $this->json([
            'message' => 'Vote clôturé. Destination gagnante sélectionnée.',
            'selectedDestination' => [
                'id' => $winner->getId(),
                'city' => $winner->getCity(),
                'country' => $winner->getCountry(),
                'score' => $bestScore,
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeTripProject(
        TripProject $tripProject,
        TripParticipant $participation,
        int $participantCount
    ): array {
        $selectedDestination = $tripProject->getSelectedDestination();

        return [
            'id' => $tripProject->getId(),
            'title' => $tripProject->getTitle(),
            'description' => $tripProject->getDescription(),
            'status' => $tripProject->getStatus(),
            'startDate' => $tripProject->getStartDate()?->format('Y-m-d'),
            'endDate' => $tripProject->getEndDate()?->format('Y-m-d'),
            'estimatedBudget' => $tripProject->getEstimatedBudget(),
            'role' => $participation->getRole(),
            'participantCount' => $participantCount,
            'selectedDestination' => $selectedDestination === null
                ? null
                : [
                    'id' => $selectedDestination->getId(),
                    'city' => $selectedDestination->getCity(),
                    'country' => $selectedDestination->getCountry(),
                ],
            'createdAt' => $tripProject->getCreatedAt()?->format(DATE_ATOM),
            'updatedAt' => $tripProject->getUpdatedAt()?->format(DATE_ATOM),
            'participantsStepCompleted' => $tripProject->isParticipantsStepCompleted(),
        ];
    }

    #[Route(
        '/api/trip-projects/{id}/participants/invite',
        name: 'api_trip_project_invite_participant',
        methods: ['POST']
    )]
    public function inviteParticipant(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        TripParticipantRepository $participantRepository,
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

        $membership = $participantRepository
            ->findAcceptedMembership($user, $tripProject);

        if (!$membership || $membership->getRole() !== 'OWNER') {
            return $this->json(
                ['message' => 'Seul le propriétaire peut inviter un participant.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $data = $request->toArray();
        $email = trim((string) ($data['email'] ?? ''));

        if ($email === '') {
            return $this->json(
                ['message' => 'L’adresse e-mail est obligatoire.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $invitedUser = $entityManager
            ->getRepository(User::class)
            ->findOneBy(['email' => $email]);

        if (!$invitedUser) {
            return $this->json(
                ['message' => 'Aucun utilisateur ne correspond à cette adresse e-mail.'],
                Response::HTTP_NOT_FOUND
            );
        }

        if ($invitedUser->getId() === $user->getId()) {
            return $this->json(
                ['message' => 'Vous participez déjà à ce projet.'],
                Response::HTTP_CONFLICT
            );
        }

        $existingParticipation = $participantRepository->findOneBy([
            'user' => $invitedUser,
            'tripProject' => $tripProject,
        ]);

        if ($existingParticipation) {
            return $this->json(
                ['message' => 'Cet utilisateur est déjà participant ou invité.'],
                Response::HTTP_CONFLICT
            );
        }

        $invitation = new TripParticipant();

        $invitation
            ->setUser($invitedUser)
            ->setTripProject($tripProject)
            ->setRole('MEMBER')
            ->setStatus('PENDING');

        $entityManager->persist($invitation);
        $entityManager->flush();

        return $this->json(
            [
                'message' => 'Invitation envoyée.',
                'invitation' => [
                    'id' => $invitation->getId(),
                    'userId' => $invitedUser->getId(),
                    'email' => $invitedUser->getEmail(),
                    'firstname' => $invitedUser->getFirstname(),
                    'username' => $invitedUser->getUsername(),
                    'status' => $invitation->getStatus(),
                    'createdAt' => $invitation->getCreatedAt()?->format(DATE_ATOM),
                ],
            ],
            Response::HTTP_CREATED
        );
    }

    #[Route(
        '/api/trip-projects/{id}/participants/complete',
        name: 'api_trip_projects_participants_complete',
        methods: ['PATCH']
    )]
    public function completeParticipantsStep(
        TripProject $tripProject,
        EntityManagerInterface $entityManager,
        TripParticipantRepository $participantRepository,
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'message' => 'Utilisateur non authentifié.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $membership = $participantRepository
            ->findOneBy([
                'tripProject' => $tripProject,
                'user' => $user,
            ]);

        if (
            !$membership ||
            $membership->getRole() !== 'OWNER'
        ) {
            return $this->json([
                'message' => 'Seul le propriétaire peut terminer cette étape.',
            ], Response::HTTP_FORBIDDEN);
        }

        $tripProject->setParticipantsStepCompleted(true);
        $tripProject->setUpdatedAt(new \DateTimeImmutable());

        $entityManager->flush();

        return $this->json([
            'participantsStepCompleted' => true,
        ]);
    }

    #[Route(
        '/api/invitations',
        name: 'api_invitations_list',
        methods: ['GET']
    )]
    public function listInvitations(
        TripParticipantRepository $participantRepository,
        #[CurrentUser] User $user
    ): JsonResponse {
        $invitations = $participantRepository
            ->findPendingForUser($user);

        return $this->json(
            array_map(
                static function (TripParticipant $invitation): array {
                    $tripProject = $invitation->getTripProject();

                    return [
                        'id' => $invitation->getId(),
                        'status' => $invitation->getStatus(),
                        'createdAt' => $invitation->getCreatedAt()?->format(DATE_ATOM),

                        'tripProject' => [
                            'id' => $tripProject->getId(),
                            'title' => $tripProject->getTitle(),
                        ],
                    ];
                },
                $invitations
            )
        );
    }

    #[Route(
        '/api/invitations/{id}/accept',
        name: 'api_invitation_accept',
        methods: ['PATCH']
    )]
    
    public function acceptInvitation(
        string $id,
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $invitation = $entityManager
            ->getRepository(TripParticipant::class)
            ->find($id);

        if (!$invitation) {
            return $this->json(
                ['message' => 'Invitation introuvable.'],
                Response::HTTP_NOT_FOUND
            );
        }

        if ($invitation->getUser()->getId() !== $user->getId()) {
            return $this->json(
                ['message' => 'Cette invitation ne vous appartient pas.'],
                Response::HTTP_FORBIDDEN
            );
        }

        if ($invitation->getStatus() !== 'PENDING') {
            return $this->json(
                ['message' => 'Cette invitation a déjà été traitée.'],
                Response::HTTP_CONFLICT
            );
        }

        $invitation
            ->setStatus('ACCEPTED')
            ->setJoinedAt(new \DateTimeImmutable());

        $entityManager->flush();

        return $this->json([
            'message' => 'Invitation acceptée.',
            'status' => 'ACCEPTED',
            'tripProjectId' => $invitation->getTripProject()->getId(),
        ]);
    }

    #[Route(
        '/api/invitations/{id}/decline',
        name: 'api_invitation_decline',
        methods: ['PATCH']
    )]
    public function declineInvitation(
        int $id,
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $invitation = $entityManager
            ->getRepository(TripParticipant::class)
            ->find($id);

        if (!$invitation) {
            return $this->json(
                ['message' => 'Invitation introuvable.'],
                Response::HTTP_NOT_FOUND
            );
        }

        if ($invitation->getUser()->getId() !== $user->getId()) {
            return $this->json(
                ['message' => 'Cette invitation ne vous appartient pas.'],
                Response::HTTP_FORBIDDEN
            );
        }

        if ($invitation->getStatus() !== 'PENDING') {
            return $this->json(
                ['message' => 'Cette invitation a déjà été traitée.'],
                Response::HTTP_CONFLICT
            );
        }

        $invitation->setStatus('DECLINED');

        $entityManager->flush();

        return $this->json([
            'message' => 'Invitation refusée.',
            'status' => 'DECLINED',
        ]);
    }
}
