<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use JsonException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

final class RegistrationController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $data = $request->toArray();
        } catch (JsonException) {
            return $this->json(
                ['message' => 'Le JSON envoyé est invalide.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $username = mb_strtolower(trim((string) ($data['username'] ?? '')));
        $firstname = trim((string) ($data['firstname'] ?? ''));
        $lastname = trim((string) ($data['lastname'] ?? ''));
        $plainPassword = (string) ($data['password'] ?? '');

        if (
            $email === ''
            || $username === ''
            || $firstname === ''
            || $lastname === ''
            || $plainPassword === ''
        ) {
            return $this->json(
                ['message' => 'Tous les champs obligatoires doivent être renseignés.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(
                ['message' => 'L’adresse email est invalide.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        if (mb_strlen($plainPassword) < 8) {
            return $this->json(
                ['message' => 'Le mot de passe doit contenir au moins 8 caractères.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        if ($userRepository->findOneBy(['email' => $email])) {
            return $this->json(
                ['message' => 'Cette adresse email est déjà utilisée.'],
                Response::HTTP_CONFLICT
            );
        }

        if ($userRepository->findOneBy(['username' => $username])) {
            return $this->json(
                ['message' => 'Ce nom d’utilisateur est déjà utilisé.'],
                Response::HTTP_CONFLICT
            );
        }

        $user = new User();

        $user
            ->setEmail($email)
            ->setUsername($username)
            ->setFirstname($firstname)
            ->setLastname($lastname)
            ->setPassword(
                $passwordHasher->hashPassword($user, $plainPassword)
            );

        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json(
            [
                'message' => 'Compte créé avec succès.',
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'username' => $user->getUsername(),
                    'firstname' => $user->getFirstname(),
                    'lastname' => $user->getLastname(),
                ],
            ],
            Response::HTTP_CREATED
        );
    }
}