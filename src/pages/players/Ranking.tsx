import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Trophy,
  Medal,
  Crown,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle,
  Loader,
  SlidersHorizontal,
  Target,
  Swords,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { countryFlags } from '@/data/mockData';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchRankings, type RankingData } from '@/services/rankingService';

const MEXICO_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Estado de México',
  'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz',
  'Yucatán', 'Zacatecas',
];

const ITEMS_PER_PAGE = 20;

const Ranking = () => {
  const { t } = useTranslation();
  const [category, setCategory] = useState('general');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [sortBy, setSortBy] = useState('ranking');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all');
  const [selectedState, setSelectedState] = useState('all');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch rankings from API
  const fetchRankingsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchRankings({
        category: category !== 'general' ? category : undefined,
        skill_level: selectedSkillLevel !== 'all' ? selectedSkillLevel : undefined,
        state: selectedState !== 'all' ? selectedState : undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });

      if (response.success && response.data) {
        setRankings(response.data.rankings);
        setTotalPlayers(response.data.pagination.total);
      } else {
        setError(response.message || 'Failed to fetch rankings');
        setRankings([]);
      }
    } catch (err) {
      console.error('Error fetching rankings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load rankings');
      setRankings([]);
    } finally {
      setLoading(false);
    }
  }, [category, currentPage, selectedSkillLevel, selectedState]);

  // Fetch rankings when category or page changes
  useEffect(() => {
    fetchRankingsData();
  }, [fetchRankingsData]);

  // Filter players based on search
  const filteredPlayers = useMemo(() => {
    if (!debouncedSearch) return rankings;

    const query = debouncedSearch.toLowerCase();
    return rankings.filter(
      (player) =>
        player.user.full_name.toLowerCase().includes(query) ||
        player.position.toString().includes(query),
    );
  }, [debouncedSearch, rankings]);

  // Pagination calculations  
  const totalPages = Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPlayers = filteredPlayers.slice(startIndex, endIndex);

  // Get top 3 for display
  const topThree = rankings.slice(0, 3);

  const getRankChangeIcon = (change: string) => {
    const num = parseInt(change);
    if (num > 0) return <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />;
    if (num < 0) return <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />;
    return <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />;
  };

  const getRankChangeClass = (change: string) => {
    const num = parseInt(change);
    if (num > 0) return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (num < 0) return 'text-red-400 bg-red-400/10 border-red-400/20';
    return 'text-slate-500 bg-slate-800/30 border-slate-700/30';
  };

  const getTopIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 sm:w-6 sm:h-6" />;
    if (index === 1) return <Medal className="w-5 h-5 sm:w-6 sm:h-6" />;
    if (index === 2) return <Medal className="w-5 h-5 sm:w-6 sm:h-6" />;
    return null;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({
      top: document.getElementById('ranking-table')?.offsetTop || 0,
      behavior: 'smooth',
    });
  };

  const renderPaginationControls = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-slate-300 font-medium">
        {t('pages.ranking.page_of', { page: currentPage, total: totalPages })}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="gap-1 bg-slate-900/50 border-slate-700/50 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t('pages.ranking.previous')}</span>
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              className={`min-w-[40px] h-10 px-3 transition-all ${
                currentPage === page
                  ? 'bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold border-transparent'
                  : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-800 text-slate-200 hover:text-white'
              } ${page === '...' ? 'cursor-default hover:bg-transparent' : ''}`}
              disabled={page === '...'}
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="gap-1 bg-slate-900/50 border-slate-700/50 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 hover:text-white"
        >
          <span className="hidden sm:inline">{t('pages.ranking.next')}</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-sm text-slate-300 font-medium">
        {t('pages.ranking.per_page', { count: ITEMS_PER_PAGE })}
      </div>
    </div>
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSkillLevelChange = (value: string) => {
    setSelectedSkillLevel(value);
    setCurrentPage(1);
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setCurrentPage(1);
  };

  const activeFiltersCount = [selectedSkillLevel, selectedState].filter(v => v !== 'all').length;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/5 overflow-x-hidden">
      <main className="flex-1">
        <section className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 pt-20 pb-12 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-60 h-60 sm:w-80 sm:h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-72 h-72 sm:w-96 sm:h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-5xl mx-auto space-y-6 lg:space-y-8">
              <div className="inline-block animate-fade-in">
                <span className="inline-flex items-center gap-2 text-primary text-xs sm:text-sm font-bold tracking-widest uppercase bg-primary/10 px-4 py-2 sm:px-6 sm:py-3 rounded-full border border-primary/20 backdrop-blur-sm">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{t('pages.ranking.label')}</span>
                </span>
              </div>

              <div className="space-y-3 lg:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                  {t('pages.ranking.title')}
                </h1>
                <p className="text-white/80 text-sm sm:text-base lg:text-xl max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-4">
                  {t('pages.ranking.subtitle')}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <div className="w-8 sm:w-12 h-1 bg-gradient-to-r from-transparent to-primary rounded-full" />
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full animate-pulse" />
                <div className="w-8 sm:w-12 h-1 bg-gradient-to-l from-transparent to-primary rounded-full" />
              </div>

              <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 pt-8 lg:pt-12 px-2 sm:px-4">
                <div className="bg-gradient-to-br from-primary/20 to-lime-500/20 backdrop-blur-md border border-primary/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center hover:border-primary/60 transition-all">
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2 sm:mb-3">
                    {totalPlayers.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-white/90 font-semibold">
                    {t('pages.ranking.stat_total')}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/20 to-lime-500/20 backdrop-blur-md border border-primary/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center hover:border-primary/60 transition-all">
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2 sm:mb-3">
                    {Math.min(100, totalPlayers)}
                  </div>
                  <div className="text-xs sm:text-sm text-white/90 font-semibold">
                    {t('pages.ranking.stat_top')}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/20 to-lime-500/20 backdrop-blur-md border border-primary/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center hover:border-primary/60 transition-all">
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2 sm:mb-3">
                    32
                  </div>
                  <div className="text-xs sm:text-sm text-white/90 font-semibold">Estados</div>
                </div>
                <div className="bg-gradient-to-br from-primary/20 to-lime-500/20 backdrop-blur-md border border-primary/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center hover:border-primary/60 transition-all">
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2 sm:mb-3">
                    LIVE
                  </div>
                  <div className="text-xs sm:text-sm text-white/90 font-semibold">
                    {t('pages.ranking.stat_live')}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-white/60 text-xs sm:text-sm px-4">
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-center">
                  {t('pages.ranking.stat_live_desc')}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-lime-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `linear-gradient(rgba(124, 252, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 252, 0, 0.1) 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
              }}
            />
          </div>

          <div className="container mx-auto px-3 sm:px-4 relative z-10">
            <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-primary text-xs sm:text-sm font-bold uppercase tracking-wider">
                    {t('pages.ranking.top100')}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-56">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder={t('pages.ranking.search_placeholder')}
                      value={searchQuery}
                      onChange={handleSearch}
                      className="pl-10 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 text-white placeholder:text-slate-500 focus:border-primary/50 transition-all"
                    />
                  </div>

                  {/* Skill Level filter */}
                  <Select value={selectedSkillLevel} onValueChange={handleSkillLevelChange}>
                    <SelectTrigger className="w-full sm:w-36 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 text-slate-300 hover:text-white transition-all">
                      <Target className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      <SelectItem value="all" className="text-slate-300 hover:bg-slate-800">All Levels</SelectItem>
                      <SelectItem value="2.5" className="text-slate-300 hover:bg-slate-800">2.5</SelectItem>
                      <SelectItem value="3.0" className="text-slate-300 hover:bg-slate-800">3.0</SelectItem>
                      <SelectItem value="3.5" className="text-slate-300 hover:bg-slate-800">3.5</SelectItem>
                      <SelectItem value="4.0" className="text-slate-300 hover:bg-slate-800">4.0</SelectItem>
                      <SelectItem value="4.5" className="text-slate-300 hover:bg-slate-800">4.5</SelectItem>
                      <SelectItem value="5.0" className="text-slate-300 hover:bg-slate-800">5.0+</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* State filter */}
                  <Select value={selectedState} onValueChange={handleStateChange}>
                    <SelectTrigger className="w-full sm:w-44 bg-slate-900/50 backdrop-blur-sm border-slate-700/50 text-slate-300 hover:text-white transition-all">
                      <Swords className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 max-h-64">
                      <SelectItem value="all" className="text-slate-300 hover:bg-slate-800">All States</SelectItem>
                      {MEXICO_STATES.map((state) => (
                        <SelectItem key={state} value={state} className="text-slate-300 hover:bg-slate-800">
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="lg:hidden w-full">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-slate-900/50 backdrop-blur-sm border-slate-700/50 text-slate-300 hover:text-white"
                        >
                          <span className="capitalize">
                            {category === 'general' && t('pages.ranking.tab_general')}
                            {category === 'singles' && t('pages.ranking.tab_singles')}
                            {category === 'doubles' && t('pages.ranking.tab_doubles')}
                          </span>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] bg-slate-900 border-slate-700">
                        <DropdownMenuItem
                          onClick={() => setCategory('general')}
                          className="text-slate-300 hover:bg-slate-800 cursor-pointer"
                        >
                          {t('pages.ranking.tab_general')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setCategory('singles')}
                          className="text-slate-300 hover:bg-slate-800 cursor-pointer"
                        >
                          {t('pages.ranking.tab_singles')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setCategory('doubles')}
                          className="text-slate-300 hover:bg-slate-800 cursor-pointer"
                        >
                          {t('pages.ranking.tab_doubles')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="hidden lg:block">
                    <Tabs value={category} onValueChange={setCategory}>
                      <TabsList className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 p-1">
                        <TabsTrigger
                          value="general"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-lime-500 data-[state=active]:text-slate-900 data-[state=active]:font-bold px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-lg text-sm sm:text-base transition-all"
                        >
                          {t('pages.ranking.tab_general')}
                        </TabsTrigger>
                        <TabsTrigger
                          value="singles"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-lime-500 data-[state=active]:text-slate-900 data-[state=active]:font-bold px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-lg text-sm sm:text-base transition-all"
                        >
                          {t('pages.ranking.tab_singles')}
                        </TabsTrigger>
                        <TabsTrigger
                          value="doubles"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-lime-500 data-[state=active]:text-slate-900 data-[state=active]:font-bold px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-lg text-sm sm:text-base transition-all"
                        >
                          {t('pages.ranking.tab_doubles')}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </div>

              {/* Active filter chips */}
              {(debouncedSearch || activeFiltersCount > 0) && (
                <div className="flex flex-wrap items-center gap-2">
                  {debouncedSearch && (
                    <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-full px-3 py-1.5">
                      <Search className="w-3.5 h-3.5 text-primary" />
                      <span className="text-white text-xs font-medium">"{debouncedSearch}"</span>
                      <button
                        onClick={() => { setSearchQuery(''); setDebouncedSearch(''); }}
                        className="text-slate-400 hover:text-white text-xs ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-slate-700"
                      >✕</button>
                    </div>
                  )}
                  {selectedSkillLevel !== 'all' && (
                    <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-3 py-1.5">
                      <Target className="w-3.5 h-3.5 text-primary" />
                      <span className="text-primary text-xs font-medium">Level {selectedSkillLevel}</span>
                      <button
                        onClick={() => handleSkillLevelChange('all')}
                        className="text-primary/70 hover:text-primary text-xs ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-primary/20"
                      >✕</button>
                    </div>
                  )}
                  {selectedState !== 'all' && (
                    <div className="flex items-center gap-2 bg-lime-500/10 border border-lime-500/30 rounded-full px-3 py-1.5">
                      <Swords className="w-3.5 h-3.5 text-lime-400" />
                      <span className="text-lime-400 text-xs font-medium">{selectedState}</span>
                      <button
                        onClick={() => handleStateChange('all')}
                        className="text-lime-400/70 hover:text-lime-400 text-xs ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-lime-500/20"
                      >✕</button>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setDebouncedSearch('');
                      setSelectedSkillLevel('all');
                      setSelectedState('all');
                    }}
                    className="text-slate-500 hover:text-slate-300 text-xs underline underline-offset-2"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-400">{t('common.error')}</p>
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchRankingsData}
                    className="ml-auto text-red-400 hover:text-red-300"
                  >
                    {t('common.retry')}
                  </Button>
                </div>
              )}

              <div className="flex flex-col md:grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {topThree.map((ranking, index) => (
                  <div
                    key={ranking.id}
                    className="group relative overflow-hidden rounded-2xl lg:rounded-3xl transition-all duration-700 hover:-translate-y-2 lg:hover:-translate-y-3"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-lime-400 to-primary rounded-2xl lg:rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />

                    <div className="relative h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl lg:rounded-3xl border border-slate-700/50 group-hover:border-primary/50 transition-all duration-700 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-lime-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      </div>

                      <div className="relative p-4 sm:p-6 lg:p-8 flex flex-col h-full min-h-[320px] sm:min-h-[360px] lg:min-h-[400px]">
                        <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3">
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl lg:text-2xl shadow-xl ${
                              index === 0
                                ? 'bg-gradient-to-br from-amber-300 via-orange-400 to-amber-500 text-amber-950'
                                : index === 1
                                  ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900'
                                  : 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                            }`}
                          >
                            {ranking.position}
                          </div>
                        </div>

                        <div className="mb-4 sm:mb-6 lg:mb-8 relative">
                          <div
                            className={`relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg sm:rounded-xl lg:rounded-2xl backdrop-blur-sm border flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg ${
                              index === 0
                                ? 'bg-amber-400/20 border-amber-400/30 text-amber-400'
                                : index === 1
                                  ? 'bg-slate-300/20 border-slate-300/30 text-slate-300'
                                  : 'bg-amber-600/20 border-amber-600/30 text-amber-600'
                            }`}
                          >
                            {index === 0 && <Crown className="w-5 h-5 sm:w-6 sm:h-6" />}
                            {index === 1 && <Medal className="w-5 h-5 sm:w-6 sm:h-6" />}
                            {index === 2 && <Medal className="w-5 h-5 sm:w-6 sm:h-6" />}
                          </div>
                        </div>

                        <div className="flex justify-center mb-4 sm:mb-6">
                          <div className="relative">
                            <div
                              className={`absolute inset-0 rounded-full blur-lg opacity-50 ${
                                index === 0
                                  ? 'bg-amber-400'
                                  : index === 1
                                    ? 'bg-slate-300'
                                    : 'bg-amber-600'
                              }`}
                            />
                            <img
                              src={ranking.user.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ranking.user.id}`}
                              alt={ranking.user.full_name}
                              onError={(e) => {
                                e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${ranking.user.id}`;
                              }}
                              className={`relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full object-cover border-4 ${
                                index === 0
                                  ? 'border-amber-400'
                                  : index === 1
                                    ? 'border-slate-300'
                                    : 'border-amber-600'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="flex-1 text-center">
                          <h3
                            className={`text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 transition-colors duration-500 ${
                              index === 0 ? 'text-amber-400' : 'text-white group-hover:text-primary'
                            }`}
                          >
                            {ranking.user.full_name.split(' ')[0]}
                            <span className="hidden sm:inline"> {ranking.user.full_name.split(' ')[1]}</span>
                          </h3>
                          <p className="text-slate-400 text-xs sm:text-sm mb-1">
                            {ranking.user.city && ranking.user.state
                              ? `${ranking.user.city}, ${ranking.user.state}`
                              : ranking.user.state || ''}
                          </p>
                          {ranking.user.bio && (
                            <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 group-hover:text-slate-400 transition-colors duration-500">
                              {ranking.user.bio}
                            </p>
                          )}

                          <div
                            className={`inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl border ${
                              index === 0
                                ? 'bg-amber-400/10 border-amber-400/20'
                                : index === 1
                                  ? 'bg-slate-300/10 border-slate-300/20'
                                  : 'bg-amber-600/10 border-amber-600/20'
                            }`}
                          >
                            <Trophy
                              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                index === 0
                                  ? 'text-amber-400'
                                  : index === 1
                                    ? 'text-slate-300'
                                    : 'text-amber-600'
                              }`}
                            />
                            <span
                              className={`font-black text-lg sm:text-xl lg:text-2xl ${
                                index === 0
                                  ? 'text-amber-400'
                                  : index === 1
                                    ? 'text-slate-300'
                                    : 'text-amber-600'
                              }`}
                            >
                              {ranking.points.toLocaleString()}
                            </span>
                          </div>

                          {/* Extra stats */}
                          <div className="flex justify-center gap-3 mt-3">
                            {ranking.win_percentage != null && (
                              <div className="text-center">
                                <p className={`text-sm font-bold ${
                                  ranking.win_percentage >= 60 ? 'text-green-400' : ranking.win_percentage >= 40 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                  {ranking.win_percentage.toFixed(0)}%
                                </p>
                                <p className="text-xs text-slate-500">Win Rate</p>
                              </div>
                            )}
                            {ranking.tournaments_played != null && (
                              <div className="text-center">
                                <p className="text-sm font-bold text-slate-300">{ranking.tournaments_played}</p>
                                <p className="text-xs text-slate-500">Tournaments</p>
                              </div>
                            )}
                            {ranking.user.skill_level && (
                              <div className="text-center">
                                <p className="text-sm font-bold text-primary">{ranking.user.skill_level}</p>
                                <p className="text-xs text-slate-500">Level</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div id="ranking-table" className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-lime-500/20 to-primary/20 rounded-xl lg:rounded-3xl blur-3xl opacity-30" />

                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl lg:rounded-3xl border border-slate-700/50 overflow-hidden">
                  <div className="relative z-10 p-4 sm:p-6 border-b border-slate-700/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                        <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-primary to-lime-500 rounded-full" />
                        {t('pages.ranking.top100')}
                      </h2>

                      {!loading && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <span>
                            {t('pages.ranking.showing', { 
                              from: startIndex + 1, 
                              to: Math.min(endIndex, filteredPlayers.length), 
                              total: filteredPlayers.length 
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {loading && (
                    <div className="relative z-10 p-12 flex flex-col items-center justify-center gap-4">
                      <Loader className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-slate-400">{t('common.loading')}</p>
                    </div>
                  )}

                  {!loading && totalPages > 1 && (
                    <div className="relative z-10 p-4 sm:p-6 border-b border-slate-700/50">
                      {renderPaginationControls()}
                    </div>
                  )}

                  {!loading && filteredPlayers.length === 0 ? (
                    <div className="relative z-10 p-12 text-center">
                      <p className="text-slate-400">{t('pages.ranking.no_results')}</p>
                    </div>
                  ) : (
                    <div className="relative z-10 overflow-x-auto -mx-2 sm:mx-0">
                      <div className="min-w-[600px] sm:min-w-0">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-700/50 bg-slate-900/50">
                              <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-xs uppercase tracking-wider text-slate-400">
                                {t('pages.ranking.col_pos')}
                              </th>
                              <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-xs uppercase tracking-wider text-slate-400">
                                {t('pages.ranking.col_player')}
                              </th>
                              <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-bold text-xs uppercase tracking-wider text-slate-400">
                                {t('pages.ranking.col_points')}
                              </th>
                              <th className="hidden sm:table-cell text-center py-3 sm:py-4 px-3 sm:px-4 font-bold text-xs uppercase tracking-wider text-slate-400">
                                Win %
                              </th>
                              <th className="hidden md:table-cell text-center py-3 sm:py-4 px-3 sm:px-4 font-bold text-xs uppercase tracking-wider text-slate-400">
                                Tournaments
                              </th>
                              <th className="text-center py-3 sm:py-4 px-3 sm:px-6 font-bold text-xs uppercase tracking-wider text-slate-400">
                                {t('pages.ranking.col_level')}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedPlayers.map((ranking) => (
                              <tr
                                key={ranking.id}
                                className="border-b border-slate-700/30 last:border-0 hover:bg-slate-800/50 transition-all duration-300 group/row"
                                onMouseEnter={() => setHoveredRow(ranking.position)}
                                onMouseLeave={() => setHoveredRow(null)}
                              >
                                <td className="py-3 sm:py-4 px-3 sm:px-6">
                                  <div
                                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl backdrop-blur-sm border flex items-center justify-center font-bold text-sm sm:text-base transition-all
                                    ${
                                      ranking.position <= 3
                                        ? ranking.position === 1
                                          ? 'bg-gradient-to-br from-amber-300/20 via-orange-400/20 to-amber-500/20 border-amber-400/30 text-amber-400'
                                          : ranking.position === 2
                                            ? 'bg-gradient-to-br from-slate-300/20 to-slate-400/20 border-slate-300/30 text-slate-300'
                                            : 'bg-gradient-to-br from-amber-600/20 to-amber-700/20 border-amber-600/30 text-amber-600'
                                        : 'bg-slate-800/80 border-slate-700/50 text-slate-300 group-hover/row:border-primary/50 group-hover/row:bg-slate-700 group-hover/row:text-primary'
                                    }`}
                                  >
                                    {ranking.position}
                                  </div>
                                </td>
                                <td className="py-3 sm:py-4 px-3 sm:px-6">
                                  <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                                    <div className="relative flex-shrink-0">
                                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover/row:opacity-100 transition-opacity" />
                                      <img
                                        src={ranking.user.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ranking.user.id}`}
                                        alt={ranking.user.full_name}
                                        onError={(e) => {
                                          e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${ranking.user.id}`;
                                        }}
                                        className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-slate-700 group-hover/row:border-primary/50 transition-colors"
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-bold text-white text-sm sm:text-base group-hover/row:text-primary transition-colors truncate">
                                        {ranking.user.full_name}
                                      </p>
                                      <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                                        {ranking.user.city && ranking.user.state
                                          ? `${ranking.user.city}, ${ranking.user.state}`
                                          : ranking.user.state || 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 sm:py-4 px-3 sm:px-6 text-right">
                                  <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg bg-slate-800/50 border border-slate-700 group-hover/row:border-primary/30 group-hover/row:bg-slate-700/50 transition-all">
                                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 group-hover/row:text-primary transition-colors" />
                                    <span className="font-bold text-base sm:text-lg text-white">
                                      {ranking.points.toLocaleString()}
                                    </span>
                                  </div>
                                </td>
                                <td className="hidden sm:table-cell py-3 sm:py-4 px-3 sm:px-4 text-center">
                                  <div className={`inline-flex flex-col items-center gap-0.5`}>
                                    <span className={`font-bold text-sm ${
                                      ranking.win_percentage >= 60
                                        ? 'text-green-400'
                                        : ranking.win_percentage >= 40
                                        ? 'text-amber-400'
                                        : 'text-red-400'
                                    }`}>
                                      {ranking.win_percentage != null ? `${ranking.win_percentage.toFixed(0)}%` : 'N/A'}
                                    </span>
                                    {ranking.win_percentage != null && (
                                      <div className="w-10 h-1 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            ranking.win_percentage >= 60 ? 'bg-green-400' : ranking.win_percentage >= 40 ? 'bg-amber-400' : 'bg-red-400'
                                          }`}
                                          style={{ width: `${Math.min(100, ranking.win_percentage)}%` }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="hidden md:table-cell py-3 sm:py-4 px-3 sm:px-4 text-center">
                                  <span className="text-slate-300 font-semibold text-sm">
                                    {ranking.tournaments_played ?? '—'}
                                  </span>
                                </td>
                                <td className="py-3 sm:py-4 px-3 sm:px-6 text-center">
                                  <div className="inline-flex px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm border border-primary/30 bg-primary/10 text-primary">
                                    {ranking.user.skill_level || 'N/A'}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {!loading && totalPages > 1 && (
                    <div className="relative z-10 p-4 sm:p-6 border-t border-slate-700/50">
                      {renderPaginationControls()}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-lime-500/20 to-primary/20 rounded-xl lg:rounded-3xl blur-3xl opacity-30" />

                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl lg:rounded-3xl border border-slate-700/50 overflow-hidden">
                  <div className="relative z-10 p-6 sm:p-8 lg:p-12">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
                      <div className="flex-1 space-y-3">
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                          {t('pages.ranking.not_top100')}
                        </h3>
                        <p className="text-slate-400 text-sm sm:text-base">
                          {t('pages.ranking.registered_count', { count: totalPlayers })}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <Input
                          type="email"
                          placeholder={t('pages.ranking.email_placeholder')}
                          className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50 text-white placeholder:text-slate-500 focus:border-primary/50 transition-all sm:w-64"
                        />
                        <Button className="bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold px-6 py-6 sm:py-2 hover:shadow-lg hover:shadow-primary/50 transition-all whitespace-nowrap">
                          {t('pages.ranking.subscribe')}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-700/50">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-xl sm:text-2xl font-bold text-primary">
                            {Math.floor(totalPlayers * 0.35).toLocaleString('es-MX')}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-400">{t('pages.ranking.men')}</div>
                        </div>
                        <div>
                          <div className="text-xl sm:text-2xl font-bold text-primary">
                            {Math.floor(totalPlayers * 0.35).toLocaleString('es-MX')}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-400">{t('pages.ranking.women')}</div>
                        </div>
                        <div>
                          <div className="text-xl sm:text-2xl font-bold text-primary">
                            {Math.floor(totalPlayers * 0.2).toLocaleString('es-MX')}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-400">{t('pages.ranking.juniors')}</div>
                        </div>
                        <div>
                          <div className="text-xl sm:text-2xl font-bold text-primary">
                            {Math.floor(totalPlayers * 0.1).toLocaleString('es-MX')}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-400">{t('pages.ranking.professionals')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Ranking;