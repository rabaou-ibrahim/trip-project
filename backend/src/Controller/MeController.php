<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use libphonenumber\PhoneNumberFormat;
use libphonenumber\PhoneNumberUtil;
use libphonenumber\NumberParseException;

final class MeController extends AbstractController
{
    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(#[CurrentUser] User $user): JsonResponse
    {
        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'username' => $user->getUsername(),
            'firstname' => $user->getFirstname(),
            'lastname' => $user->getLastname(),
            'avatar' => $user->getAvatar(),
            'phoneNumber' => $user->getPhoneNumber(),
            'birthdate' => $user->getBirthdate()?->format('Y-m-d'),
        ]);
    }

    #[Route('/api/me', name: 'api_me_update', methods: ['PATCH'])]
    public function update(
        Request $request,
        #[CurrentUser] User $user,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json(
                ['message' => 'Données invalides.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        if (array_key_exists('firstname', $data)) {
            $user->setFirstname(trim((string) $data['firstname']));
        }

        if (array_key_exists('lastname', $data)) {
            $user->setLastname(trim((string) $data['lastname']));
        }

        if (array_key_exists('username', $data)) {
            $username = trim((string) $data['username']);

            if ($username === '') {
                return $this->json(
                    ['message' => 'Le nom d’utilisateur ne peut pas être vide.'],
                    Response::HTTP_BAD_REQUEST
                );
            }

            if (array_key_exists('username', $data)) {
                $username = trim((string) $data['username']);

                if ($username === '') {
                    return $this->json(
                        ['message' => 'Le nom d’utilisateur ne peut pas être vide.'],
                        Response::HTTP_BAD_REQUEST
                    );
                }

                $existingUser = $entityManager
                    ->getRepository(User::class)
                    ->findOneBy(['username' => $username]);

                if (
                    $existingUser !== null &&
                    $existingUser->getId() !== $user->getId()
                ) {
                    return $this->json(
                        ['message' => 'Ce nom d’utilisateur est déjà utilisé.'],
                        Response::HTTP_CONFLICT
                    );
                }

                $user->setUsername($username);
            }
        }

        if (array_key_exists('phoneNumber', $data)) {
            $phoneNumber = trim((string) ($data['phoneNumber'] ?? ''));

            if ($phoneNumber === '') {
                $user->setPhoneNumber(null);
            } else {
                $phoneUtil = PhoneNumberUtil::getInstance();

                try {
                    $parsedPhone = $phoneUtil->parse($phoneNumber, 'FR');

                    if (!$phoneUtil->isValidNumber($parsedPhone)) {
                        return $this->json(
                            ['message' => 'Le numéro de téléphone est invalide.'],
                            Response::HTTP_BAD_REQUEST
                        );
                    }

                    $normalizedPhone = $phoneUtil->format(
                        $parsedPhone,
                        PhoneNumberFormat::E164
                    );

                    $user->setPhoneNumber($normalizedPhone);
                } catch (NumberParseException) {
                    return $this->json(
                        ['message' => 'Le numéro de téléphone est invalide.'],
                        Response::HTTP_BAD_REQUEST
                    );
                }
            }
        }

        if (array_key_exists('birthdate', $data)) {
            $birthdate = $data['birthdate'];

            if ($birthdate === null || $birthdate === '') {
                $user->setBirthdate(null);
            } else {
                try {
                    $user->setBirthdate(
                        new \DateTime((string) $birthdate)
                    );
                } catch (\Exception) {
                    return $this->json(
                        ['message' => 'Date de naissance invalide.'],
                        Response::HTTP_BAD_REQUEST
                    );
                }
            }
        }

        if (array_key_exists('avatar', $data)) {
            $avatar = $data['avatar'];

            $user->setAvatar(
                $avatar === null || trim((string) $avatar) === ''
                    ? null
                    : trim((string) $avatar)
            );
        }

        $user->setUpdatedAt(new \DateTimeImmutable());

        $entityManager->flush();

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'username' => $user->getUsername(),
            'firstname' => $user->getFirstname(),
            'lastname' => $user->getLastname(),
            'phoneNumber' => $user->getPhoneNumber(),
            'birthdate' => $user->getBirthdate()?->format('Y-m-d'),
            'avatar' => $user->getAvatar(),
        ]);
    }

    #[Route('/api/me/avatar', name: 'api_me_avatar', methods: ['POST'])]
    public function uploadAvatar(
        Request $request,
        #[CurrentUser] User $user,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $file = $request->files->get('avatar');

        if (!$file) {
            return $this->json(
                ['message' => 'Aucune image reçue.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        if (!str_starts_with((string) $file->getMimeType(), 'image/')) {
            return $this->json(
                ['message' => 'Le fichier doit être une image.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $extension = $file->guessExtension() ?: 'jpg';
        $filename = sprintf(
            'avatar_%d_%s.%s',
            $user->getId(),
            bin2hex(random_bytes(6)),
            $extension
        );

        $uploadDirectory = $this->getParameter('kernel.project_dir')
            . '/public/uploads/avatars';

        $file->move($uploadDirectory, $filename);

        $avatarPath = '/uploads/avatars/' . $filename;

        $user->setAvatar($avatarPath);

        $entityManager->flush();

        return $this->json([
            'avatar' => $avatarPath,
        ]);
    }
}