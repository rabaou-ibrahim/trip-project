<?php

namespace App\Controller;

use App\Entity\DestinationProposal;
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

final class DestinationProposalController extends AbstractController
{
    /**
     * Creates a destination proposal for a trip project.
     *
     * 1. Finds the trip project.
     * 2. Checks that the authenticated user is an accepted participant.
     * 3. Reads the destination data from the JSON body.
     * 4. Validates the required fields.
     * 5. Creates the destination proposal.
     * 6. Links it to the user and the trip project.
     * 7. Saves it with Doctrine.
     */
    #[Route(
        '/api/trip-projects/{id}/destination-proposals',
        name: 'api_destination_proposal_create',
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

        $city = trim((string) ($data['city'] ?? ''));
        $country = trim((string) ($data['country'] ?? ''));
        $description = trim((string) ($data['description'] ?? ''));
        $estimatedCost = $data['estimatedCost'] ?? null;

        if ($city === '' || $country === '') {
            return $this->json(
                ['message' => 'La ville et le pays sont obligatoires.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $existingProposal = $entityManager
        ->getRepository(DestinationProposal::class)
        ->findOneBy([
            'tripProject' => $tripProject,
            'city' => $city,
            'country' => $country,
        ]);

    if ($existingProposal) {
        return $this->json(
            ['message' => 'Cette destination a déjà été proposée pour ce projet.'],
            Response::HTTP_CONFLICT
        );
    }

        $proposal = new DestinationProposal();

        $proposal
            ->setCity($city)
            ->setCountry($country)
            ->setDescription($description !== '' ? $description : null)
            ->setEstimatedCost(
                $estimatedCost !== null ? (string) $estimatedCost : null
            )
            ->setProposedBy($user)
            ->setTripProject($tripProject);

        $entityManager->persist($proposal);
        $entityManager->flush();

        return $this->json(
            [
                'message' => 'Destination proposée.',
                'destinationProposal' => [
                    'id' => $proposal->getId(),
                    'city' => $proposal->getCity(),
                    'country' => $proposal->getCountry(),
                    'description' => $proposal->getDescription(),
                    'estimatedCost' => $proposal->getEstimatedCost(),
                    'proposedBy' => [
                        'id' => $user->getId(),
                        'username' => $user->getUsername(),
                    ],
                ],
            ],
            Response::HTTP_CREATED
        );
    }

    /**
     * Returns all destination proposals for a trip project.
     *
     * Only accepted participants can access them.
     */
    #[Route(
        '/api/trip-projects/{id}/destination-proposals',
        name: 'api_destination_proposal_list',
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
                ['message' => 'Vous n’avez pas accès aux propositions de ce projet.'],
                Response::HTTP_FORBIDDEN
            );
        }

        $proposals = $entityManager
            ->getRepository(DestinationProposal::class)
            ->findBy([
                'tripProject' => $tripProject,
            ]);

        $result = [];

        foreach ($proposals as $proposal) {
            $proposedBy = $proposal->getProposedBy();

            $result[] = [
                'id' => $proposal->getId(),
                'city' => $proposal->getCity(),
                'country' => $proposal->getCountry(),
                'description' => $proposal->getDescription(),
                'estimatedCost' => $proposal->getEstimatedCost(),
                'createdAt' => $proposal->getCreatedAt()?->format('Y-m-d H:i:s'),
                'proposedBy' => [
                    'id' => $proposedBy->getId(),
                    'username' => $proposedBy->getUsername(),
                ],
            ];
        }

        return $this->json($result);
    }
}