<?php

namespace App\Entity;

use App\Repository\AvailabilityRepository;
use App\Entity\TripProject;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\DBAL\Types\Types;

#[ORM\Entity(repositoryClass: AvailabilityRepository::class)]
class Availability
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    private ?\DateTimeImmutable $startDate = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    private ?\DateTimeImmutable $endDate = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?TripProject $tripProject = null;

    public function __construct() { 
        $this->createdAt = new \DateTimeImmutable(); 
    }

    public function getId(): ?int { 
        return $this->id; 
    }
    public function getStartDate(): ?\DateTimeImmutable { 
        return $this->startDate; 
    }

    public function setStartDate(\DateTimeImmutable $startDate): static { 
        $this->startDate = $startDate; return $this; 
    }

    public function getEndDate(): ?\DateTimeImmutable { 
        return $this->endDate; 
    }

    public function setEndDate(\DateTimeImmutable $endDate): static { 
        $this->endDate = $endDate; return $this; 
    }

    public function getCreatedAt(): ?\DateTimeImmutable { 
        return $this->createdAt; 
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static { 
        $this->createdAt = $createdAt; return $this; 
    }
    
    public function getUpdatedAt(): ?\DateTimeImmutable { 
        return $this->updatedAt; 
    }
    
    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static { 
        $this->updatedAt = $updatedAt; return $this; 
    }
    
    public function getUser(): ?User { 
        return $this->user; 
    }

    public function setUser(User $user): static { 
        $this->user = $user; return $this; 
    }
    public function getTripProject(): ?TripProject { 
        return $this->tripProject; 
    }

    public function setTripProject(TripProject $tripProject): static { 
        $this->tripProject = $tripProject; return $this; 
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
