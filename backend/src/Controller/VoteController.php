<?php

namespace App\Controller;

use App\Entity\DestinationProposal;
use App\Entity\TripParticipant;
use App\Entity\User;
use App\Entity\Vote;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

final class VoteController extends AbstractController
{
    /**
     * Creates a vote for a destination proposal.
     *
     * 1. Finds the destination proposal.
     * 2. Checks that the user is an accepted participant.
     * 3. Validates the vote value.
     * 4. Checks that the user has not already voted.
     * 5. Creates and saves the vote with Doctrine.
     */
    #[Route(
        '/api/destination-proposals/{id}/vote',
        name: 'api_destination_vote',
        methods: ['POST']
    )]
    public function vote(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $proposal = $entityManager
            ->getRepository(DestinationProposal::class)
            ->find($id);

        if (!$proposal) {
            return $this->json(
                ['message' => 'Proposition introuvable.'],
                Response::HTTP_NOT_FOUND
            );
        }

        $tripProject = $proposal->getTripProject();

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

        $value = $data['value'] ?? null;

        if (!in_array($value, [-1, 0, 1], true)) {
            return $this->json(
                ['message' => 'Le vote doit être -1, 0 ou 1.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $existingVote = $entityManager
        ->getRepository(Vote::class)
        ->findOneBy([
            'user' => $user,
            'destinationProposal' => $proposal,
        ]);

    if ($existingVote) {
        return $this->json(
            ['message' => 'Vous avez déjà voté pour cette destination.'],
            Response::HTTP_CONFLICT
        );
    }

    $vote = new Vote();

    $vote
        ->setUser($user)
        ->setDestinationProposal($proposal)
        ->setValue($value);

    $entityManager->persist($vote);
    $entityManager->flush();

    return $this->json(
        [
            'message' => 'Vote enregistré.',
            'vote' => [
                'id' => $vote->getId(),
                'value' => $vote->getValue(),
                'destinationProposalId' => $proposal->getId(),
            ],
        ],
        Response::HTTP_CREATED
    );
    }

    /**
     * Updates the authenticated user's vote
     * for a destination proposal.
     *
     * 1. Finds the destination proposal.
     * 2. Finds the user's existing vote.
     * 3. Validates the new vote value.
     * 4. Updates and saves the vote.
     */
    #[Route(
        '/api/destination-proposals/{id}/vote',
        name: 'api_destination_vote_update',
        methods: ['PATCH']
    )]
    public function updateVote(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $proposal = $entityManager
            ->getRepository(DestinationProposal::class)
            ->find($id);

        if (!$proposal) {
            return $this->json(
                ['message' => 'Proposition introuvable.'],
                Response::HTTP_NOT_FOUND
            );
        }

        $vote = $entityManager
            ->getRepository(Vote::class)
            ->findOneBy([
                'user' => $user,
                'destinationProposal' => $proposal,
            ]);

        if (!$vote) {
            return $this->json(
                ['message' => 'Vous n’avez pas encore voté pour cette destination.'],
                Response::HTTP_NOT_FOUND
            );
        }

        $data = $request->toArray();

        $value = $data['value'] ?? null;

        if (!in_array($value, [-1, 0, 1], true)) {
            return $this->json(
                ['message' => 'Le vote doit être -1, 0 ou 1.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $vote->setValue($value);

        $entityManager->flush();

        return $this->json([
            'message' => 'Vote modifié.',
            'vote' => [
                'id' => $vote->getId(),
                'value' => $vote->getValue(),
                'destinationProposalId' => $proposal->getId(),
            ],
        ]);
    }

    /**
     * Deletes the authenticated user's vote
     * for a destination proposal.
     */
    #[Route(
        '/api/destination-proposals/{id}/vote',
        name: 'api_destination_vote_delete',
        methods: ['DELETE']
    )]
    public function deleteVote(
        int $id,
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $proposal = $entityManager
            ->getRepository(DestinationProposal::class)
            ->find($id);

        if (!$proposal) {
            return $this->json(
                ['message' => 'Proposition introuvable.'],
                Response::HTTP_NOT_FOUND
            );
        }

        $vote = $entityManager
            ->getRepository(Vote::class)
            ->findOneBy([
                'user' => $user,
                'destinationProposal' => $proposal,
            ]);

        if (!$vote) {
            return $this->json(
                ['message' => 'Vous n’avez pas voté pour cette destination.'],
                Response::HTTP_NOT_FOUND
            );
        }

        $entityManager->remove($vote);
        $entityManager->flush();

        return $this->json([
            'message' => 'Vote supprimé.',
        ]);
    }

    /**
     * Returns the voting results for a destination proposal.
     *
     * 1. Finds the destination proposal.
     * 2. Checks that the authenticated user is an accepted participant.
     * 3. Gets all votes for the proposal.
     * 4. Counts positive, neutral and negative votes.
     * 5. Returns the results and the total score.
     */
    #[Route(
        '/api/destination-proposals/{id}/votes',
        name: 'api_destination_vote_results',
        methods: ['GET']
    )]
    public function results(
        int $id,
        EntityManagerInterface $entityManager,
        #[CurrentUser] User $user
    ): JsonResponse {
        $proposal = $entityManager
            ->getRepository(DestinationProposal::class)
            ->find($id);

        if (!$proposal) {
            return $this->json(
                ['message' => 'Proposition introuvable.'],
                Response::HTTP_NOT_FOUND
            );
        }

        $tripProject = $proposal->getTripProject();

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

        $votes = $entityManager
            ->getRepository(Vote::class)
            ->findBy([
                'destinationProposal' => $proposal,
            ]);

        $for = 0;
        $neutral = 0;
        $against = 0;
        $score = 0;
        $details = [];

    foreach ($votes as $vote) {
        $value = $vote->getValue();
        $voteUser = $vote->getUser();

        if ($value === 1) {
            $for++;
        } elseif ($value === 0) {
            $neutral++;
        } elseif ($value === -1) {
            $against++;
        }

        $score += $value;

        $details[] = [
            'userId' => $voteUser->getId(),
            'username' => $voteUser->getUsername(),
            'value' => $value,
        ];
    }

        return $this->json([
            'destinationProposal' => [
                'id' => $proposal->getId(),
                'city' => $proposal->getCity(),
                'country' => $proposal->getCountry(),
            ],
            'votes' => [
                'for' => $for,
                'neutral' => $neutral,
                'against' => $against,
                'total' => count($votes),
                'score' => $score,
            ],
            'details' => $details,
        ]);
    }
}