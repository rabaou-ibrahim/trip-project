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
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getTripProject } from '@/services/tripProjectService';
import type { TripProjectDetail } from '@/types/tripProject';

import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import {
  DestinationProposalCard,
  type DestinationProposal,
} from '@/components/destination/DestinationProposalCard';
import { colors, radius, spacing, typography } from '@/theme';
import { apiRequest } from '@/services/apiClient';
import { ApiError } from '@/services/apiClient';
import { getDestinationProposals } from '@/services/destinationProposalService';

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

  const loadProposals = async () => {
    if (!tripProjectId) {
      return;
    }

    const data = await apiRequest<any[]>(
      `/api/trip-projects/${tripProjectId}/destination-proposals`,
    );

    const mappedProposals: DestinationProposal[] = await Promise.all(
      data.map(async (proposal) => ({
        id: String(proposal.id),
        city: proposal.city,
        country: proposal.country,
        estimatedBudget: Number(proposal.estimatedCost ?? 0),
        votes: proposal.votes,
        hasVoted: proposal.hasVoted,

        flagUrl: getCountryFlagUrl(proposal.country),

        imageUrl: await getDestinationImage(
          proposal.city,
        ),

        accentColor: '#2563EB',
        accentSoftColor: '#EAF1FF',
      })),
    );

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

      await apiRequest(
        `/api/trip-projects/${tripProjectId}/destination-proposals`,
        {
          method: 'POST',
          body: {
            city: city.trim(),
            country: country.trim(),
            description: description.trim(),
            estimatedCost:
              estimatedCost.trim() !== ''
                ? estimatedCost.trim()
                : null,
          },
        },
      );

      await loadProposals();

      setCity('');
      setCountry('');
      setDescription('');
      setEstimatedCost('');
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
    setCloseVoteError(
      error instanceof ApiError
        ? error.message
        : 'Impossible de clôturer le vote.',
    );
  } finally {
    setIsClosingVote(false);
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

      <Text style={styles.summaryCountry}>
        {summaryProposal.flagUrl} {summaryProposal.country}
      </Text>

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
          <Text style={styles.eyebrow}>VACANCES ÉTÉ 2027</Text>
          <Text style={[styles.title, isDesktop && styles.desktopTitle]}>
            Destinations proposées
          </Text>
          <Text style={styles.subtitle}>
            {proposals.length} propositions · Votez pour votre destination préférée.
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
      Proposer une destination
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
      </View>
    );
  }

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
              Proposer une destination
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
          <Text style={styles.inputLabel}>Ville</Text>

          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Ex. Tokyo"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Pays</Text>

          <TextInput
            value={country}
            onChangeText={setCountry}
            placeholder="Ex. Japon"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
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
    </View>
  );
}

function getDestinationImage(city: string): string | undefined {
  const images: Record<string, string> = {
    Paris:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    Tokyo:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
    Rome:
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
    Barcelone:
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4',
    Lisbonne:
      'https://images.unsplash.com/photo-1555881400-74d7acaacd8b',
    Marrakech:
      'https://images.unsplash.com/photo-1597212618440-806262de4f6b',
    Istanbul:
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200',
    Londres:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
    'New York':
      'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee',
    Dubai:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
    Bali:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
    Athènes:
      'https://images.unsplash.com/photo-1555993539-1732b0258235',
    Prague:
      'https://images.unsplash.com/photo-1541849546-216549ae216d',
    Budapest:
      'https://images.unsplash.com/photo-1565426873118-a17ed65d74b9',
    Bangkok:
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365',
    Singapour:
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd',
    Sydney:
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9',
    'Le Cap':
      'https://images.unsplash.com/photo-1580060839134-75a5edca2e99',
  };

  return images[city];
}

function getCountryFlagUrl(
  country: string,
): string | undefined {
  const countryCodes: Record<string, string> = {
    France: 'fr',
    Espagne: 'es',
    Portugal: 'pt',
    Italie: 'it',
    Grèce: 'gr',
    Turquie: 'tr',
    Allemagne: 'de',
    Autriche: 'at',
    Tchéquie: 'cz',
    Hongrie: 'hu',
    Pologne: 'pl',
    Danemark: 'dk',
    Suède: 'se',
    Norvège: 'no',
    Finlande: 'fi',
    Islande: 'is',
    Croatie: 'hr',
    Serbie: 'rs',
    Albanie: 'al',
    'Royaume-Uni': 'gb',
    Irlande: 'ie',

    Maroc: 'ma',
    Tunisie: 'tn',
    Égypte: 'eg',
    Sénégal: 'sn',
    "Côte d'Ivoire": 'ci',
    'Côte d’Ivoire': 'ci',
    Ghana: 'gh',
    Kenya: 'ke',
    Tanzanie: 'tz',
    'Afrique du Sud': 'za',

    'Émirats arabes unis': 'ae',
    Qatar: 'qa',
    Oman: 'om',
    Jordanie: 'jo',
    'Arabie saoudite': 'sa',

    Japon: 'jp',
    'Corée du Sud': 'kr',
    Chine: 'cn',
    'Hong Kong': 'hk',
    Taïwan: 'tw',

    Thaïlande: 'th',
    Vietnam: 'vn',
    Indonésie: 'id',
    Malaisie: 'my',
    Singapour: 'sg',

    Inde: 'in',
    'Sri Lanka': 'lk',
    Maldives: 'mv',

    'États-Unis': 'us',
    Canada: 'ca',
    Mexique: 'mx',
    Cuba: 'cu',
    'République dominicaine': 'do',

    Brésil: 'br',
    Argentine: 'ar',
    Pérou: 'pe',
    Chili: 'cl',
    Colombie: 'co',

    Australie: 'au',
    'Nouvelle-Zélande': 'nz',
  };

  const code = countryCodes[country];

  if (!code) {
    return undefined;
  }

  return `https://flagcdn.com/w80/${code}.png`;
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
  summaryCountry: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
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