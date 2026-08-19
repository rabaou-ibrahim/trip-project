<?php

namespace App\Repository;

use App\Entity\TripParticipant;
use App\Entity\TripProject;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TripParticipant>
 */
class TripParticipantRepository extends ServiceEntityRepository
{
    private const ACCEPTED_STATUS = 'ACCEPTED';

    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TripParticipant::class);
    }

    /**
     * @return list<TripParticipant>
     */
    public function findAcceptedForUser(User $user): array
    {
        return $this->createQueryBuilder('membership')
            ->addSelect('tripProject', 'selectedDestination')
            ->innerJoin('membership.tripProject', 'tripProject')
            ->leftJoin('tripProject.selectedDestination', 'selectedDestination')
            ->andWhere('membership.user = :user')
            ->andWhere('membership.status = :status')
            ->setParameter('user', $user)
            ->setParameter('status', self::ACCEPTED_STATUS)
            ->addSelect(
                'CASE
                    WHEN tripProject.updatedAt IS NOT NULL THEN tripProject.updatedAt
                    ELSE tripProject.createdAt
                END AS HIDDEN projectSortDate'
            )
            ->addOrderBy('projectSortDate', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findAcceptedMembership(
        User $user,
        TripProject $tripProject
    ): ?TripParticipant {
        return $this->findOneBy([
            'user' => $user,
            'tripProject' => $tripProject,
            'status' => self::ACCEPTED_STATUS,
        ]);
    }

    /**
     * @param list<TripProject> $tripProjects
     *
     * @return array<int, int>
     */
    public function countAcceptedByProjects(array $tripProjects): array
    {
        if ($tripProjects === []) {
            return [];
        }

        $rows = $this->createQueryBuilder('participant')
            ->select('IDENTITY(participant.tripProject) AS projectId')
            ->addSelect('COUNT(participant.id) AS participantCount')
            ->andWhere('participant.tripProject IN (:tripProjects)')
            ->andWhere('participant.status = :status')
            ->setParameter('tripProjects', $tripProjects)
            ->setParameter('status', self::ACCEPTED_STATUS)
            ->groupBy('participant.tripProject')
            ->getQuery()
            ->getArrayResult();

        $counts = [];

        foreach ($rows as $row) {
            $counts[(int) $row['projectId']] = (int) $row['participantCount'];
        }

        return $counts;
    }

    public function countAcceptedForProject(TripProject $tripProject): int
    {
        return $this->count([
            'tripProject' => $tripProject,
            'status' => self::ACCEPTED_STATUS,
        ]);
    }

    /**
     * @return list<TripParticipant>
     */
    public function findAcceptedPreview(
        TripProject $tripProject,
        int $limit = 5
    ): array {
        return $this->createQueryBuilder('participant')
            ->addSelect(
                "CASE WHEN participant.role = 'OWNER' THEN 0 ELSE 1 END AS HIDDEN roleOrder"
            )
            ->addSelect('user')
            ->innerJoin('participant.user', 'user')
            ->andWhere('participant.tripProject = :tripProject')
            ->andWhere('participant.status = :status')
            ->setParameter('tripProject', $tripProject)
            ->setParameter('status', self::ACCEPTED_STATUS)
            ->addOrderBy('roleOrder', 'ASC')
            ->addOrderBy('participant.joinedAt', 'ASC')
            ->addOrderBy('participant.createdAt', 'ASC')
            ->setMaxResults(max(1, $limit))
            ->getQuery()
            ->getResult();
    }

    public function findPendingForProject(TripProject $tripProject): array
    {
        return $this->createQueryBuilder('tp')
            ->andWhere('tp.tripProject = :tripProject')
            ->andWhere('tp.status = :status')
            ->setParameter('tripProject', $tripProject)
            ->setParameter('status', 'PENDING')
            ->orderBy('tp.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
    
    /**
     * @return list<TripParticipant>
     */
    public function findPendingForUser(User $user): array
    {
        return $this->createQueryBuilder('participant')
            ->addSelect('tripProject')
            ->innerJoin('participant.tripProject', 'tripProject')
            ->andWhere('participant.user = :user')
            ->andWhere('participant.status = :status')
            ->setParameter('user', $user)
            ->setParameter('status', 'PENDING')
            ->orderBy('participant.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
