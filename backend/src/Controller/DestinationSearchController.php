<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class DestinationSearchController extends AbstractController
{
    #[Route('/api/destinations/search', methods: ['GET'])]
    public function search(
        Request $request,
        HttpClientInterface $httpClient,
    ): JsonResponse {
        $query = trim((string) $request->query->get('q', ''));

        if (mb_strlen($query) < 2) {
            return $this->json([]);
        }

        $response = $httpClient->request(
            'GET',
            'https://geocoding-api.open-meteo.com/v1/search',
            [
                'query' => [
                    'name' => $query,
                    'count' => 5,
                    'language' => 'fr',
                    'format' => 'json',
                ],
            ],
        );

        $data = $response->toArray(false);

        $results = array_map(
            static fn(array $place) => [
                'id' => $place['id'],
                'city' => $place['name'],
                'country' => $place['country'] ?? null,
                'countryCode' => $place['country_code'] ?? null,
                'latitude' => $place['latitude'],
                'longitude' => $place['longitude'],
                'timezone' => $place['timezone'] ?? null,
                'admin1' => $place['admin1'] ?? null,
            ],
            $data['results'] ?? [],
        );

        return $this->json($results);
    }

    #[Route('/api/destinations/photo', methods: ['GET'])]
    public function photo(
        Request $request,
        HttpClientInterface $httpClient,
    ): JsonResponse {
        $city = trim((string) $request->query->get('city', ''));
        $country = trim((string) $request->query->get('country', ''));

        if ($city === '') {
            return $this->json(
                ['message' => 'Ville obligatoire.'],
                400,
            );
        }

        $apiKey = $_ENV['PEXELS_API_KEY'] ?? null;

        if (!$apiKey) {
            return $this->json(
                ['message' => 'Clé Pexels manquante.'],
                500,
            );
        }

        $response = $httpClient->request(
            'GET',
            'https://api.pexels.com/v1/search',
            [
                'headers' => [
                    'Authorization' => $apiKey,
                ],
                'query' => [
                    'query' => trim("$city $country"),
                    'orientation' => 'landscape',
                    'locale' => 'fr-FR',
                    'per_page' => 1,
                ],
            ],
        );

        $data = $response->toArray(false);
        $photo = $data['photos'][0] ?? null;

        if (!$photo) {
            return $this->json(['imageUrl' => null]);
        }

        return $this->json([
            'imageUrl' => $photo['src']['landscape'] ?? $photo['src']['large'] ?? null,
            'photographer' => $photo['photographer'] ?? null,
            'pexelsUrl' => $photo['url'] ?? null,
        ]);
    }
}