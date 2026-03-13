import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, MapPin, Trophy, Users, SlidersHorizontal, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StateAutocomplete } from '@/components/ui/StateAutocomplete';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { playerRankings, countryFlags } from '@/data/mockData';

const PlayerSearch = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedModality, setSelectedModality] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const levels = ['2.5', '3.5', '4.5', '5.0+'];

  const filteredPlayers = playerRankings.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const activeFiltersCount = [
    selectedState && selectedState !== '',
    selectedLevel !== 'all',
    selectedModality !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/5">
      <main className="flex-1">
        <section className="relative bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `linear-gradient(rgba(124, 252, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 252, 0, 0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
              }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-block mb-6 animate-fade-in">
                <span className="inline-flex items-center gap-2 text-primary text-sm font-bold tracking-widest uppercase bg-primary/10 px-6 py-3 rounded-full border border-primary/20 backdrop-blur-sm">
                  <Users className="w-4 h-4" />
                  <span>{t('pages.playerSearch.label')}</span>
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                {t('pages.playerSearch.title')}
              </h1>

              <p className="text-white/80 text-xl max-w-2xl mx-auto leading-relaxed mb-8">
                {t('pages.playerSearch.subtitle')}
              </p>

              <div className="flex flex-wrap justify-center gap-6 mt-12">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-4">
                  <div className="text-3xl font-bold text-white mb-1">{playerRankings.length}+</div>
                  <div className="text-white/70 text-sm">{t('pages.playerSearch.stat_players')}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-4">
                  <div className="text-3xl font-bold text-white mb-1">10+</div>
                  <div className="text-white/70 text-sm">{t('pages.playerSearch.stat_states')}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-4">
                  <div className="text-3xl font-bold text-white mb-1">7</div>
                  <div className="text-white/70 text-sm">{t('pages.playerSearch.stat_levels')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto ">
              <div className="relative mb-8">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-lime-400 to-primary rounded-3xl opacity-20 blur-xl" />
                <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-2xl">
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder={t('pages.playerSearch.search_placeholder')}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 h-14 text-lg border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl"
                        />
                      </div>
                      <Button
                        variant="outline"
                        className={`h-14 gap-2 px-6 rounded-xl border-2 font-semibold transition-all duration-300 ${
                          showFilters
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-slate-200 dark:border-slate-700 hover:border-primary'
                        }`}
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <SlidersHorizontal className="w-5 h-5" />
                        {t('pages.playerSearch.filters')}
                        {activeFiltersCount > 0 && (
                          <Badge className="bg-primary text-primary-foreground ml-1 px-2">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                      <Button className="h-14 gap-2 px-8 rounded-xl bg-gradient-to-r from-primary to-lime-500 hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 font-semibold">
                        <Search className="w-5 h-5" />
                        {t('common.search')}
                      </Button>
                    </div>

                    {showFilters && (
                      <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700/50">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold text-foreground">{t('pages.playerSearch.filter_title')}</h3>
                          {activeFiltersCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedState('');
                                setSelectedLevel('all');
                                setSelectedModality('all');
                              }}
                              className="text-primary hover:text-primary hover:bg-primary/10"
                            >
                              <X className="w-4 h-4 mr-1" />
                              {t('pages.playerSearch.clear_filters')}
                            </Button>
                          )}
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                          <div>
                            <label className="text-sm font-semibold text-foreground mb-3 block">
                              {t('pages.playerSearch.state')}
                            </label>
                            <StateAutocomplete
                              value={selectedState}
                              onChange={setSelectedState}
                              placeholder={t('pages.playerSearch.state_placeholder')}
                              className="h-12 border-slate-200 dark:border-slate-700 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-foreground mb-3 block">
                              {t('pages.playerSearch.nrtp_level')}
                            </label>
                            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                              <SelectTrigger className="h-12 border-slate-200 dark:border-slate-700 rounded-xl">
                                <SelectValue placeholder={t('pages.playerSearch.all_levels')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">{t('pages.playerSearch.all_levels')}</SelectItem>
                                {levels.map((level) => (
                                  <SelectItem key={level} value={level}>
                                    {level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-foreground mb-3 block">
                              {t('pages.playerSearch.modality')}
                            </label>
                            <Select value={selectedModality} onValueChange={setSelectedModality}>
                              <SelectTrigger className="h-12 border-slate-200 dark:border-slate-700 rounded-xl">
                                <SelectValue placeholder={t('pages.playerSearch.all_modalities')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">{t('pages.playerSearch.all_modalities')}</SelectItem>
                                <SelectItem value="singles">{t('pages.playerSearch.singles')}</SelectItem>
                                <SelectItem value="doubles">{t('pages.playerSearch.doubles')}</SelectItem>
                                <SelectItem value="mixed">{t('pages.playerSearch.mixed')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredPlayers.length}
                    <span className="text-muted-foreground font-normal ml-2">
                      {t('pages.playerSearch.players_found')}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('pages.playerSearch.showing_results')}
                  </p>
                </div>
                <Select defaultValue="ranking">
                  <SelectTrigger className="w-56 h-12 border-slate-200 dark:border-slate-700 rounded-xl">
                    <SelectValue placeholder={t('pages.playerSearch.sort_by')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ranking">{t('pages.playerSearch.sort_ranking')}</SelectItem>
                    <SelectItem value="name">{t('pages.playerSearch.sort_name')}</SelectItem>
                    <SelectItem value="points">{t('pages.playerSearch.sort_points')}</SelectItem>
                    <SelectItem value="recent">{t('pages.playerSearch.sort_recent')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-6">
                {filteredPlayers.map((player, index) => (
                  <div
                    key={player.rank}
                    className="group relative"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-lime-400 to-primary rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />

                    <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700/50 group-hover:border-primary/50 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/10">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-lime-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                      <div className="relative p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                          <div className="relative group/avatar">
                            <div className="absolute -inset-2 bg-gradient-to-r from-primary to-lime-500 rounded-full opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-500" />
                            <div className="relative">
                              <img
                                src={player.avatar}
                                alt={player.name}
                                className="w-20 h-20 rounded-2xl object-cover border-4 border-white dark:border-slate-800 shadow-lg group-hover:scale-110 transition-transform duration-500"
                              />
                              <img
                                src={countryFlags[player.countryCode]}
                                alt={player.countryCode}
                                className="absolute -bottom-2 -right-2 w-8 h-6 rounded-md border-2 border-white dark:border-slate-800 shadow-lg"
                              />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="flex-1">
                                <h3 className="font-bold text-2xl text-foreground group-hover:text-primary transition-colors duration-300">
                                  {player.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {player.countryCode === 'MX' ? 'México' : player.countryCode}
                                  </span>
                                  <span className="flex items-center gap-2 font-semibold text-primary">
                                    <Trophy className="w-4 h-4" />
                                    {player.points} pts
                                  </span>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className="flex-shrink-0 border-2 border-primary/20 bg-primary/10 text-primary font-bold px-4 py-2 text-base"
                              >
                                #{player.rank}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-4">
                              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl px-4 py-2">
                                <div className="text-xs text-muted-foreground">{t('pages.playerSearch.level')}</div>
                                <div className="font-bold text-foreground">4.5</div>
                              </div>
                              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl px-4 py-2">
                                <div className="text-xs text-muted-foreground">{t('pages.playerSearch.tournaments')}</div>
                                <div className="font-bold text-foreground">12</div>
                              </div>
                              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl px-4 py-2">
                                <div className="text-xs text-muted-foreground">{t('pages.playerSearch.wins')}</div>
                                <div className="font-bold text-foreground">8</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col gap-3 w-full sm:w-auto">
                            <Button
                              variant="outline"
                              className="flex-1 sm:flex-none h-12 px-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 font-semibold transition-all duration-300"
                            >
                              {t('pages.playerSearch.view_profile')}
                            </Button>
                            <Button className="flex-1 sm:flex-none h-12 gap-2 px-6 rounded-xl bg-gradient-to-r from-primary to-lime-500 hover:shadow-lg hover:shadow-primary/50 font-semibold transition-all duration-300">
                              <Users className="w-4 h-4" />
                              {t('pages.playerSearch.connect')}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-lime-500/10 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                  </div>
                ))}
              </div>

              {filteredPlayers.length === 0 && (
                <div className="text-center py-24">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                    <div className="relative bg-slate-100 dark:bg-slate-800 rounded-3xl p-8">
                      <Search className="w-16 h-16 text-primary mx-auto" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {t('pages.playerSearch.no_results')}
                  </h3>
                  <p className="text-muted-foreground text-lg mb-6">
                    {t('pages.playerSearch.no_results_hint')}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedState('');
                      setSelectedLevel('all');
                      setSelectedModality('all');
                    }}
                    className="h-12 px-6 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold transition-all duration-300"
                  >
                    {t('pages.playerSearch.clear_search')}
                  </Button>
                </div>
              )}

              {filteredPlayers.length > 0 && (
                <div className="mt-16 mb-8">
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button
                      variant="outline"
                      disabled
                      className="h-12 px-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-semibold"
                    >
                      {t('common.previous')}
                    </Button>
                    <Button className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-lime-500 text-white font-bold shadow-lg shadow-primary/25">
                      1
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 px-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 font-semibold transition-all duration-300"
                    >
                      2
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 px-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 font-semibold transition-all duration-300"
                    >
                      3
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 px-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 font-semibold transition-all duration-300"
                    >
                      {t('common.next')}
                    </Button>
                  </div>
                  <p className="text-center text-muted-foreground text-sm mt-6">
                    {t('pages.playerSearch.page_info', { page: 1, total: 3, count: filteredPlayers.length })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(124, 252, 0, 0.3) 1px, transparent 0)`,
                backgroundSize: '32px 32px',
              }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-lime-500/20 to-primary/20 rounded-3xl blur-3xl opacity-30" />

                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 overflow-hidden p-16 text-center">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl" />

                  <div className="relative z-10">
                    <div className="inline-block mb-6">
                      <span className="text-primary text-xs font-bold uppercase tracking-widest bg-primary/10 px-6 py-2 rounded-full border border-primary/30">
                        {t('pages.playerSearch.cta_label')}
                      </span>
                    </div>

                    <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent mb-6">
                      {t('pages.playerSearch.cta_title')}
                    </h3>

                    <p className="text-slate-400 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
                      {t('pages.playerSearch.cta_sub')}
                    </p>

                    <div className="flex flex-wrap gap-6 justify-center">
                      <a
                        href="/register"
                        className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold px-12 py-6 rounded-2xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-500 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        <span className="relative z-10">{t('pages.playerSearch.cta_register')}</span>
                        <Trophy className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform duration-500" />
                      </a>

                      <a
                        href="/contact"
                        className="group inline-flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm text-white font-bold px-12 py-6 rounded-2xl border-2 border-slate-700 hover:border-primary hover:bg-slate-800 transition-all duration-500"
                      >
                        <span>{t('pages.playerSearch.cta_info')}</span>
                        <svg
                          className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </a>
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

export default PlayerSearch;
