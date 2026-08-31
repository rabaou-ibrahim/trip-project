<?php

namespace App\Repository;

use App\Entity\Availability;
use App\Entity\TripProject;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Availability>
 */
class AvailabilityRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Availability::class);
    }

    public function countDistinctUsersForProject(TripProject $tripProject): int
    {
        return (int) $this->createQueryBuilder('availability')
            ->select('COUNT(DISTINCT IDENTITY(availability.user))')
            ->andWhere('availability.tripProject = :tripProject')
            ->setParameter('tripProject', $tripProject)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
