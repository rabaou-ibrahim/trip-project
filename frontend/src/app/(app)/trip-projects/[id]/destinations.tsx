import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  Alert,
  Image,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getTripProject } from '@/services/tripProjectService';
import type { TripProjectDetail } from '@/types/tripProject';
import {
  searchDestinations,
  getDestinationPhoto,
  type DestinationSearchResult,
} from '@/services/destinationSearchService';

import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import {
  DestinationProposalCard,
  type DestinationProposal,
} from '@/components/destination/DestinationProposalCard';
import { colors, radius, spacing, typography } from '@/theme';
import { apiRequest } from '@/services/apiClient';
import { ApiError } from '@/services/apiClient';

const DESKTOP_BREAKPOINT = 1024;


export default function DestinationsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const tripProjectId = Array.isArray(id) ? id[0] : id;
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const [proposals, setProposals] = useState<DestinationProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  const [summaryVisible, setSummaryVisible] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [destinationResults, setDestinationResults] = useState<
    DestinationSearchResult[]
  >([]);

  const [selectedDestination, setSelectedDestination] =
    useState<DestinationSearchResult | null>(null);

  const [isSearchingDestination, setIsSearchingDestination] =
    useState(false);
  const [description, setDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<'votes' | 'budgetAsc' | 'budgetDesc'>(
    'votes',
  );

  const [project, setProject] = useState<TripProjectDetail | null>(null);
  const [isClosingVote, setIsClosingVote] = useState(false);
  const [closeVoteError, setCloseVoteError] = useState<string | null>(null);
  const [tiedProposals, setTiedProposals] = useState<
    { id: number; city: string; country: string; votes: number }[]
  >([]);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await Promise.all([
        loadProposals(),
        loadProject(),
  ]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Impossible de charger les destinations.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [tripProjectId]);

  useEffect(() => {
  if (city.trim().length < 2 || selectedDestination) {
    setDestinationResults([]);
    return;
  }

  const timeout = setTimeout(async () => {
    try {
      setIsSearchingDestination(true);

      const results = await searchDestinations(city.trim());

      setDestinationResults(results);
    } catch (error) {
      console.error('DESTINATION SEARCH ERROR:', error);
      setDestinationResults([]);
    } finally {
      setIsSearchingDestination(false);
    }
  }, 350);

  return () => clearTimeout(timeout);
}, [city, selectedDestination]);

  const loadProposals = async () => {
    if (!tripProjectId) {
      return;
    }

    const data = await apiRequest<any[]>(
      `/api/trip-projects/${tripProjectId}/destination-proposals`,
    );

    const mappedProposals: DestinationProposal[] = data.map((proposal) => ({
      id: String(proposal.id),
      city: proposal.city,
      country: proposal.country,
      estimatedBudget: Number(proposal.estimatedCost ?? 0),
      votes: proposal.votes,
      hasVoted: proposal.hasVoted,

      flagUrl: proposal.countryCode
      ? `https://flagcdn.com/w80/${proposal.countryCode.toLowerCase()}.png`
      : undefined,

      imageUrl: proposal.imageUrl ?? undefined,

      accentColor: '#2563EB',
      accentSoftColor: '#EAF1FF',
    }));

    setProposals(mappedProposals);
  };

  const loadProject = async () => {
    if (!tripProjectId) {
      return;
    }

    const data = await getTripProject(Number(tripProjectId));
    setProject(data);
  };

  const confirmCloseVote = () => {
    Alert.alert(
      'Clôturer le vote ?',
      'La destination ayant le plus de votes deviendra la destination finale.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Clôturer',
          style: 'destructive',
          onPress: () => void handleCloseVote(),
        },
      ],
    );
  };

  const leadingProposal = [...proposals].sort(
  (first, second) => second.votes - first.votes,
  )[0];

  const currentVote = proposals.find((proposal) => proposal.hasVoted) ?? null;

  const selectedProposal = proposals.find((proposal) => proposal.id === selectedProposalId,) ?? null;

  const summaryProposal =
  selectedProposal ?? currentVote ?? leadingProposal ?? null;

  const totalVotes = proposals.reduce(
    (total, proposal) => total + proposal.votes,
    0,
  );

  const selectedVoteShare =
    selectedProposal && totalVotes > 0
      ? Math.round((selectedProposal.votes / totalVotes) * 100)
      : 0;

  const handleSelectProposal = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    setSummaryVisible(true);
  };

  const handleBack = () => {
    if (!tripProjectId) {
      router.replace('/');
      return;
    }

    router.replace({
      pathname: '/trip-projects/[id]',
      params: { id: tripProjectId },
    });
  };

  const handleCreateProposal = async () => {
    if (!tripProjectId || isCreating) {
      return;
    }

    if (!city.trim() || !country.trim()) {
      setCreateError('La ville et le pays sont obligatoires.');
      return;
    }

    try {
      setIsCreating(true);
      setCreateError(null);
      const photo = await getDestinationPhoto(
        city.trim(),
        country.trim(),
      );

      await apiRequest(
        `/api/trip-projects/${tripProjectId}/destination-proposals`,
        {
          method: 'POST',
          body: {
            city: city.trim(),
            country: country.trim(),
            countryCode: selectedDestination?.countryCode ?? null,
            description: description.trim(),
            estimatedCost:
              estimatedCost.trim() !== ''
                ? estimatedCost.trim()
                : null,

            latitude: selectedDestination?.latitude ?? null,
            longitude: selectedDestination?.longitude ?? null,
            imageUrl: photo.imageUrl,
          },
        },
      );

      await loadProposals();

      setCity('');
      setCountry('');
      setDescription('');
      setEstimatedCost('');
      setSelectedDestination(null);
      setDestinationResults([]);
      setIsAddModalOpen(false);
    } catch (error) {
      setCreateError(
        error instanceof ApiError
          ? error.message
          : 'Impossible d’ajouter cette destination.',
      );
    } finally {
      setIsCreating(false);
    }
  };

 const handleVote = async (proposalId: string) => {
    if (!tripProjectId) {
      return;
    }

    try {
      await apiRequest(
        `/api/trip-projects/${tripProjectId}/destination-proposals/${proposalId}/vote`,
        {
          method: 'PUT',
        },
      );

      await loadProposals();
    } catch (error) {
      console.error('VOTE ERROR:', error);
    }
  };

const handleCloseVote = async () => {
  if (
    !tripProjectId ||
    isClosingVote ||
    project?.role !== 'OWNER'
  ) {
    return;
  }

  try {
    setIsClosingVote(true);
    setCloseVoteError(null);
    setTiedProposals([]);

    await apiRequest(
      `/api/trip-projects/${tripProjectId}/close-destination-vote`,
      {
        method: 'PATCH',
      },
    );

    await Promise.all([
      loadProposals(),
      loadProject(),
    ]);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.data?.tie === true &&
      Array.isArray(error.data?.proposals)
    ) {
      setTiedProposals(error.data.proposals);
      return;
    }

    setCloseVoteError(
      error instanceof ApiError
        ? error.message
        : 'Impossible de clôturer le vote.',
    );
  } finally {
    setIsClosingVote(false);
  }
};

const handleSelectTieWinner = async (proposalId: number) => {
  if (!tripProjectId) return;

  try {
    setCloseVoteError(null);

    await apiRequest(
      `/api/trip-projects/${tripProjectId}/select-destination`,
      {
        method: 'PATCH',
        body: {
          destinationProposalId: proposalId,
        },
      },
    );

    setTiedProposals([]);

    await Promise.all([
      loadProposals(),
      loadProject(),
    ]);
  } catch (error) {
    setCloseVoteError(
      error instanceof ApiError
        ? error.message
        : 'Impossible de sélectionner la destination.',
    );
  }
};

  const countries = Array.from(
  new Set(proposals.map(proposal => proposal.country)),
).sort((a, b) => a.localeCompare(b, 'fr'));

const filteredProposals = proposals
  .filter(proposal => {
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      query === '' ||
      proposal.city.toLowerCase().includes(query) ||
      proposal.country.toLowerCase().includes(query);

    const matchesCountry =
      selectedCountry === null ||
      proposal.country === selectedCountry;

    return matchesSearch && matchesCountry;
  })
  .sort((a, b) => {
    if (sortMode === 'budgetAsc') {
      return a.estimatedBudget - b.estimatedBudget;
    }

    if (sortMode === 'budgetDesc') {
      return b.estimatedBudget - a.estimatedBudget;
    }

    return b.votes - a.votes;
  });

  const cards = (
  <View style={styles.cards}>
    {isLoading ? (
      <Text style={styles.emptyText}>
        Chargement des destinations...
      </Text>
    ) : error ? (
      <Text style={styles.errorText}>
        {error}
      </Text>
    ) : filteredProposals.length === 0 ? (
      <Text style={styles.emptyText}>
        Aucune destination ne correspond à votre recherche.
      </Text>
    ) : (
      filteredProposals.map((proposal) => (
        <DestinationProposalCard
          key={proposal.id}
          proposal={proposal}
          isDesktop={isDesktop}
          onPress={() => handleSelectProposal(proposal.id)}
          onVote={() => void handleVote(proposal.id)}
        />
      ))
    )}
  </View>
);

  const voteSummary = summaryVisible && summaryProposal ? (
    <View
      style={[
        styles.summaryCard,
        !isDesktop && styles.mobileSummaryCard,
      ]}
    >
      <View style={styles.summaryHeaderRow}>
        <View style={styles.summaryIcon}>
          <Ionicons
            name="stats-chart-outline"
            size={22}
            color={colors.primary}
          />
        </View>

        <Pressable
          onPress={() => setSummaryVisible(false)}
          accessibilityRole="button"
          accessibilityLabel="Masquer le résumé du vote"
          style={({ pressed }) => [
            styles.summaryCloseButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="close"
            size={20}
            color={colors.textSecondary}
          />
        </Pressable>
      </View>

      <Text style={styles.summaryTitle}>
        PROPOSITION CONSULTÉE
      </Text>

      <Text style={styles.summaryCity}>
        {summaryProposal.city}
      </Text>

      <View style={styles.summaryCountryRow}>
        {summaryProposal.flagUrl && (
          <Image
            source={{ uri: summaryProposal.flagUrl }}
            style={styles.summaryFlag}
            resizeMode="cover"
          />
        )}

        <Text style={styles.summaryCountry}>
          {summaryProposal.country}
        </Text>
      </View>

      <View style={styles.summaryDivider} />

      <Text style={styles.summaryVotes}>
        {summaryProposal.votes} vote
        {summaryProposal.votes > 1 ? 's' : ''} actuellement
      </Text>

      <Text style={styles.summaryText}>
        {leadingProposal
          ? `${leadingProposal.city} est actuellement en tête.`
          : 'Aucune proposition en tête.'}
      </Text>

      <View style={styles.currentVoteBox}>
        <Ionicons
          name={
            currentVote
              ? 'checkmark-circle'
              : 'remove-circle-outline'
          }
          size={20}
          color={
            currentVote ? colors.secondary : colors.textMuted
          }
        />

        <View>
          <Text style={styles.currentVoteLabel}>
            Votre vote
          </Text>

          <Text style={styles.currentVoteCity}>
            {currentVote?.city ?? 'Aucun vote enregistré'}
          </Text>
        </View>
      </View>
    </View>
  ) : (
    <Pressable
      onPress={() => setSummaryVisible(true)}
      accessibilityRole="button"
      accessibilityLabel="Afficher le résumé du vote"
      style={({ pressed }) => [
        styles.reopenSummaryButton,
        !isDesktop && styles.mobileReopenSummaryButton,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name="stats-chart-outline"
        size={18}
        color={colors.primary}
      />

      <Text style={styles.reopenSummaryText}>
        Afficher le vote
      </Text>
    </Pressable>
  );

  const pageContent = (
    <>
      <Pressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Retour au projet"
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="arrow-back"
          size={19}
          color={colors.textPrimary}
        />
        <Text style={styles.backButtonText}>Retour au projet</Text>
      </Pressable>

      <View style={[styles.header, isDesktop && styles.desktopHeader]}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>
            {project?.title?.toUpperCase() ?? 'VOYAGE'}
          </Text>
          <Text style={[styles.title, isDesktop && styles.desktopTitle]}>
            Destinations proposées
          </Text>
          <Text style={styles.subtitle}>
            {proposals.length} propositions · Votez pour votre destination préférée. Vous pouvez également en ajouter
          </Text>
        </View>

        <View style={styles.headerActions}>
  {project?.selectedDestination ? (
    <View style={styles.voteClosedBadge}>
      <Ionicons
        name="checkmark-circle"
        size={15}
        color={colors.secondary}
      />

      <Text style={styles.voteClosedText}>
        Vote terminé
      </Text>
    </View>
  ) : (
    <View style={styles.voteOpenBadge}>
      <View style={styles.voteOpenDot} />
      <Text style={styles.voteOpenText}>
        Vote ouvert
      </Text>
    </View>
  )}

  <Pressable
    onPress={() => {
      setCreateError(null);
      setIsAddModalOpen(true);
    }}
    style={({ pressed }) => [
      styles.addDestinationButton,
      pressed && styles.pressed,
    ]}
  >
    <Ionicons name="add" size={18} color="#FFFFFF" />

    <Text style={styles.addDestinationButtonText}>
      Ajouter une destination
    </Text>
  </Pressable>

  {project?.role === 'OWNER' &&
    !project.selectedDestination && (
      <Pressable
        onPress={confirmCloseVote}
        disabled={isClosingVote}
        style={({ pressed }) => [
          styles.closeVoteButton,
          pressed && styles.pressed,
          isClosingVote && styles.disabledButton,
        ]}
      >
        <Ionicons
          name="flag-outline"
          size={17}
          color={colors.primary}
        />

        <Text style={styles.closeVoteButtonText}>
          {isClosingVote
            ? 'Clôture…'
            : 'Clôturer le vote'}
        </Text>
      </Pressable>
    )}
</View>
      </View>

      {project?.selectedDestination && (
  <View style={styles.finalDestinationCard}>
    <View style={styles.finalDestinationIcon}>
      <Ionicons
        name="flag"
        size={21}
        color={colors.secondary}
      />
    </View>

    <View style={styles.finalDestinationContent}>
      <Text style={styles.finalDestinationEyebrow}>
        DESTINATION FINALE
      </Text>

      <Text style={styles.finalDestinationTitle}>
        {project.selectedDestination.city}
      </Text>

      <Text style={styles.finalDestinationCountry}>
        {project.selectedDestination.country}
      </Text>
    </View>
  </View>
)}

{tiedProposals.length > 0 && (
  <View style={styles.tieBox}>
    <Text style={styles.tieTitle}>
      Égalité
    </Text>

    <Text style={styles.tieText}>
      Choisissez la destination finale parmi les ex æquo :
    </Text>

    {tiedProposals.map((proposal) => (
      <Pressable
        key={proposal.id}
        onPress={() => void handleSelectTieWinner(proposal.id)}
        style={styles.tieProposal}
      >
        <View>
          <Text style={styles.tieCity}>{proposal.city}</Text>
          <Text style={styles.tieCountry}>{proposal.country}</Text>
        </View>

        <Text style={styles.tieVotes}>
          {proposal.votes} votes
        </Text>
      </Pressable>
    ))}
  </View>
)}

{closeVoteError && (
  <Text style={styles.errorText}>
    {closeVoteError}
  </Text>
)}

      <View style={styles.filters}>
  < View style={styles.searchBox}>
    <Ionicons
      name="search-outline"
      size={18}
      color={colors.textMuted}
    />

    <TextInput
      value={searchQuery}
      onChangeText={setSearchQuery}
      placeholder="Rechercher une ville ou un pays..."
      placeholderTextColor={colors.textMuted}
      style={styles.searchInput}
    />

    {searchQuery !== '' && (
      <Pressable onPress={() => setSearchQuery('')}>
        <Ionicons
          name="close-circle"
          size={18}
          color={colors.textMuted}
        />
      </Pressable>
    )}
  </View>

  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.countryFilters}
  >
    <Pressable
      onPress={() => setSelectedCountry(null)}
      style={[
        styles.filterChip,
        selectedCountry === null && styles.filterChipActive,
      ]}
    >
      <Text
        style={[
          styles.filterChipText,
          selectedCountry === null && styles.filterChipTextActive,
        ]}
      >
        Tous
      </Text>
    </Pressable>

    {countries.map((country) => (
      <Pressable
        key={country}
        onPress={() => setSelectedCountry(country)}
        style={[
          styles.filterChip,
          selectedCountry === country && styles.filterChipActive,
        ]}
      >
        <Text
          style={[
            styles.filterChipText,
            selectedCountry === country &&
              styles.filterChipTextActive,
          ]}
        >
          {country}
        </Text>
      </Pressable>
    ))}
  </ScrollView>

    <View style={styles.sortRow}>
      <Text style={styles.sortLabel}>Trier par</Text>

      <Pressable
        onPress={() => setSortMode('votes')}
        style={[
          styles.sortButton,
          sortMode === 'votes' && styles.sortButtonActive,
        ]}
      >
        <Text
          style={[
            styles.sortButtonText,
            sortMode === 'votes' && styles.sortButtonTextActive,
          ]}
        >
          Votes
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setSortMode('budgetAsc')}
        style={[
          styles.sortButton,
          sortMode === 'budgetAsc' && styles.sortButtonActive,
        ]}
      >
        <Text
          style={[
            styles.sortButtonText,
            sortMode === 'budgetAsc' && styles.sortButtonTextActive,
          ]}
        >
          Budget ↑
        </Text>
      </Pressable>

      <Pressable
        onPress={() => setSortMode('budgetDesc')}
        style={[
          styles.sortButton,
          sortMode === 'budgetDesc' && styles.sortButtonActive,
        ]}
      >
        <Text
          style={[
            styles.sortButtonText,
            sortMode === 'budgetDesc' && styles.sortButtonTextActive,
          ]}
        >
          Budget ↓
        </Text>
      </Pressable>
    </View>
  </View>

      {isDesktop ? (
        <View style={styles.desktopBody}>
          <View style={styles.desktopMainColumn}>
            {cards}
          </View>

          {voteSummary}
        </View>
      ) : (
        <>
          {voteSummary}
          {cards}
        </>
      )}
    </>
  );

  const addDestinationModal = (
<Modal
    visible={isAddModalOpen}
    transparent
    animationType="fade"
    onRequestClose={() => setIsAddModalOpen(false)}
  >
    <View style={styles.modalOverlay}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => setIsAddModalOpen(false)}
      />

      <View style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalEyebrow}>
              NOUVELLE DESTINATION
            </Text>

            <Text style={styles.modalTitle}>
              Ajouter une destination
            </Text>
          </View>

          <Pressable
            onPress={() => setIsAddModalOpen(false)}
            style={styles.modalClose}
          >
            <Ionicons
              name="close"
              size={20}
              color={colors.textPrimary}
            />
          </Pressable>
        </View>

        <View style={styles.modalForm}>
          <Text style={styles.inputLabel}>Destination</Text>

          <TextInput
            value={city}
            onChangeText={(value) => {
              setCity(value);
              setCountry('');
              setSelectedDestination(null);
            }}
            placeholder="Rechercher une ville..."
            placeholderTextColor={colors.textMuted}
            autoComplete="off"
            style={styles.input}
          />

          {isSearchingDestination && (
            <Text style={styles.destinationSearchStatus}>
              Recherche...
            </Text>
          )}

          {destinationResults.length > 0 && (
            <View style={styles.destinationResults}>
              {destinationResults.map((destination) => (
                <Pressable
                  key={destination.id}
                  onPress={() => {
                    setSelectedDestination(destination);
                    setCity(destination.city);
                    setCountry(destination.country ?? '');
                    setDestinationResults([]);
                  }}
                  style={({ pressed }) => [
                    styles.destinationResult,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color={colors.primary}
                  />

                  <View style={styles.destinationResultText}>
                    <Text style={styles.destinationResultCity}>
                      {destination.city}
                    </Text>

                    <Text style={styles.destinationResultCountry}>
                      {[destination.admin1, destination.country]
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                  </View>
                  {destination.countryCode && (
                    <Text style={styles.destinationCode}>
                      {destination.countryCode}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
          )}

          <Text style={styles.inputLabel}>Pays</Text>

          <TextInput
            value={country}
            editable={false}
            placeholder="Sélectionnez d’abord une destination"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              styles.readonlyInput,
            ]}
          />

          <Text style={styles.inputLabel}>
            Budget estimé par personne
          </Text>

          <TextInput
            value={estimatedCost}
            onChangeText={setEstimatedCost}
            placeholder="Ex. 1200"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>
            Description
          </Text>

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Pourquoi cette destination ?"
            placeholderTextColor={colors.textMuted}
            multiline
            style={[styles.input, styles.descriptionInput]}
          />

          {createError && (
            <Text style={styles.createError}>
              {createError}
            </Text>
          )}

          <Pressable
            onPress={() => void handleCreateProposal()}
            disabled={isCreating}
            style={({ pressed }) => [
              styles.modalSubmit,
              (pressed || isCreating) && styles.pressed,
            ]}
          >
            <Text style={styles.modalSubmitText}>
              {isCreating
                ? 'Ajout…'
                : 'Ajouter la destination'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
  );

  if (isDesktop) {
    return (
      <View style={styles.desktopPage}>
        <DesktopSidebar activeItem="trips" />

        <ScrollView
          style={styles.desktopScroll}
          contentContainerStyle={styles.desktopScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {pageContent}
        </ScrollView>

        {addDestinationModal}
      </View>
    );
  }

   return (
    <View style={styles.mobilePage}>
      <ScrollView
        style={styles.mobileScroll}
        contentContainerStyle={styles.mobileScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {pageContent}
      </ScrollView>

      <MobileBottomNavigation activeItem="trips" />

      {addDestinationModal}
    </View>
  );
}

const styles = StyleSheet.create({
  desktopPage: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  desktopScroll: {
    flex: 1,
  },
  flagImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },

  filters: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },

  searchBox: {
    minHeight: 46,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },

  tieBox: {
  marginTop: spacing.xl,
  padding: spacing.lg,
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.lg,
},

tieTitle: {
  color: colors.textPrimary,
  fontSize: typography.fontSize.lg,
  fontFamily: typography.fontFamily.bold,
},

tieText: {
  marginTop: spacing.xs,
  marginBottom: spacing.md,
  color: colors.textSecondary,
  fontSize: typography.fontSize.sm,
},

tieProposal: {
  marginTop: spacing.sm,
  padding: spacing.md,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.md,
},

tieCity: {
  color: colors.textPrimary,
  fontSize: typography.fontSize.sm,
  fontFamily: typography.fontFamily.semibold,
},

tieCountry: {
  color: colors.textSecondary,
  fontSize: typography.fontSize.xs,
},

tieVotes: {
  color: colors.primary,
  fontSize: typography.fontSize.sm,
  fontFamily: typography.fontFamily.semibold,
},

  searchInput: {
    flex: 1,
    minWidth: 0,
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
  },

  countryFilters: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },

  filterChip: {
    minHeight: 34,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
  },

  filterChipActive: {
    backgroundColor: '#EAF1FF',
    borderColor: '#BFD0F7',
  },

  filterChipText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },

  filterChipTextActive: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semibold,
  },

  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  sortLabel: {
    marginRight: spacing.xs,
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },

  sortButton: {
    minHeight: 32,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
  },

  sortButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  sortButtonText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },

  sortButtonTextActive: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.semibold,
  },

  addDestinationButton: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },

  addDestinationButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
  },

  modalOverlay: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },

  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
  },

  modalHeader: {
    padding: spacing.xl,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  modalEyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.9,
  },

  modalTitle: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
  },

  modalClose: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },

  modalForm: {
    padding: spacing.xl,
    paddingTop: spacing.sm,
  },

  inputLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
  },

  input: {
    minHeight: 46,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },

  descriptionInput: {
    minHeight: 90,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },

  createError: {
    marginTop: spacing.md,
    color: colors.error,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },

  modalSubmit: {
    minHeight: 46,
    marginTop: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },

  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  emptyText: {
    paddingVertical: spacing.xl,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
  },

  destinationSearchStatus: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },
  destinationCode: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
  },

destinationResults: {
  marginTop: spacing.xs,
  overflow: 'hidden',
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.md,
},

destinationResult: {
  padding: spacing.md,
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
},

destinationResultText: {
  flex: 1,
},

destinationResultCity: {
  color: colors.textPrimary,
  fontSize: typography.fontSize.sm,
  fontFamily: typography.fontFamily.semibold,
},

destinationResultCountry: {
  marginTop: 2,
  color: colors.textSecondary,
  fontSize: typography.fontSize.xs,
  fontFamily: typography.fontFamily.regular,
},

readonlyInput: {
  backgroundColor: colors.surfaceMuted,
},

  errorText: {
    paddingVertical: spacing.xl,
    color: colors.error,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
  },
  desktopScrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 1500,
    alignSelf: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxl,
  },
  mobilePage: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mobileScroll: {
    flex: 1,
  },
  mobileScrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
  },
  backButtonText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  summaryCountryRow: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  summaryFlag: {
    width: 24,
    height: 17,
    borderRadius: 4,
  },

  summaryCountry: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
  },
  pressed: {
    opacity: 0.72,
  },
  header: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  desktopHeader: {
    marginTop: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
    letterSpacing: 1,
  },
  title: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
  },
  desktopTitle: {
    fontSize: typography.fontSize.xxl,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
  },
  flagBadge: {
    width: 42,
    height: 30,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  voteOpenBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#E9F8F1',
    borderRadius: radius.full,
  },
  voteOpenDot: {
    width: 7,
    height: 7,
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
  },
  voteOpenText: {
    color: colors.secondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semibold,
  },
  closeVoteButton: {
  minHeight: 42,
  paddingHorizontal: spacing.lg,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spacing.sm,
  borderWidth: 1,
  borderColor: colors.primary,
  borderRadius: radius.md,
  backgroundColor: colors.surface,
},

closeVoteButtonText: {
  color: colors.primary,
  fontSize: typography.fontSize.xs,
  fontFamily: typography.fontFamily.semibold,
},

voteClosedBadge: {
  alignSelf: 'flex-start',
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.xs,
  backgroundColor: '#E8F8F1',
  borderRadius: radius.full,
},

voteClosedText: {
  color: colors.secondary,
  fontSize: typography.fontSize.xs,
  fontFamily: typography.fontFamily.semibold,
},

finalDestinationCard: {
  marginTop: spacing.xl,
  padding: spacing.lg,
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.md,
  borderWidth: 1,
  borderColor: '#BDE8D5',
  borderRadius: radius.lg,
  backgroundColor: '#F0FAF6',
},

finalDestinationIcon: {
  width: 44,
  height: 44,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: radius.full,
  backgroundColor: '#FFFFFF',
},

finalDestinationContent: {
  flex: 1,
},

finalDestinationEyebrow: {
  color: colors.secondary,
  fontSize: 9,
  fontFamily: typography.fontFamily.bold,
  letterSpacing: 0.8,
},

finalDestinationTitle: {
  marginTop: 3,
  color: colors.textPrimary,
  fontSize: typography.fontSize.lg,
  fontFamily: typography.fontFamily.bold,
},

finalDestinationCountry: {
  marginTop: 2,
  color: colors.textSecondary,
  fontSize: typography.fontSize.xs,
  fontFamily: typography.fontFamily.regular,
},

disabledButton: {
  opacity: 0.55,
},
  cards: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  desktopCards: {
    marginTop: 0,
  },
  desktopBody: {
    marginTop: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xl,
  },
  desktopMainColumn: {
    flex: 1,
    minWidth: 0,
  },
  summaryCard: {
    width: 300,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
  },
  summaryIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF1FF',
    borderRadius: radius.md,
  },
  summaryTitle: {
    marginTop: spacing.lg,
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryCity: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
  },
  summaryDivider: {
    height: 1,
    marginVertical: spacing.lg,
    backgroundColor: colors.border,
  },
  summaryVotes: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  summaryText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    lineHeight: 18,
  },
  mobileSummaryCard: {
    width: '100%',
    marginTop: spacing.xl,
  },

  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  summaryCloseButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
  },

  currentVoteBox: {
    marginTop: spacing.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#E8F8F1',
    borderWidth: 1,
    borderColor: '#BDE8D5',
    borderRadius: radius.md,
  },

  currentVoteLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },

  currentVoteCity: {
    marginTop: 2,
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },

  reopenSummaryButton: {
    width: 300,
    minHeight: 46,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },

  mobileReopenSummaryButton: {
    width: '100%',
    marginTop: spacing.xl,
  },

  reopenSummaryText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
});