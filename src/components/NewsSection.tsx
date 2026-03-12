import { Play, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { newsArticles, videoRecaps } from '@/data/mockData';

const NewsSection = () => {
  const handleArticleClick = (articleId: any) => {
    console.log(`Article clicked: ${articleId} - navigate to article detail page`);
  };

  const handleVideoClick = (videoId: any) => {
    console.log(`Video clicked: ${videoId} - open video player or navigate to video`);
  };

  const handleViewAllNews = () => {
    console.log('View All clicked - navigate to all news page');
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-foreground font-bold tracking-tight">
            ALREDEDOR DE LA SELECCIÓN
          </h2>
          <button
            onClick={handleViewAllNews}
            className="text-primary font-medium flex items-center gap-1 hover:underline text-sm sm:text-base whitespace-nowrap hover:text-primary/80 transition-colors group mt-2 sm:mt-0"
          >
            Ver todo
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          <div className="flex-1 space-y-4 sm:space-y-5 md:space-y-6">
            {newsArticles.map((article) => (
              <article
                key={article.id}
                className="group bg-card rounded-xl overflow-hidden cursor-pointer border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg flex flex-col sm:flex-row h-auto sm:h-36 md:h-40"
                onClick={() => handleArticleClick(article.id)}
              >
                <div className="relative w-full sm:w-32 md:w-36 h-50 sm:h-full flex-shrink-0 overflow-hidden bg-muted">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-center">
                  <Badge
                    variant="outline"
                    className="text-[10px] sm:text-xs mb-1.5 border-primary text-primary w-fit hover:bg-primary/5 transition-colors flex-shrink-0"
                  >
                    {article.category}
                  </Badge>

                  <h3 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-1">
                    {article.title}
                  </h3>

                  <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1 hidden sm:block">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 opacity-70" />
                    <span className="truncate font-medium">{article.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {videoRecaps.map((video) => (
                <div
                  key={video.id}
                  className="group cursor-pointer flex flex-col h-full"
                  onClick={() => handleVideoClick(video.id)}
                >
                  <div className="relative rounded-2xl overflow-hidden mb-3 sm:mb-4 border border-border/50 group-hover:border-primary/30 transition-all duration-300 h-48 sm:h-52 md:h-56 lg:h-60 xl:h-64 bg-muted">
                    <div className="absolute inset-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-primary transition-all duration-300 shadow-lg">
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary-foreground ml-0.5 sm:ml-1" />
                      </div>
                    </div>

                    <Badge className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-destructive text-destructive-foreground text-[10px] sm:text-[11px] font-semibold shadow-lg border-0 px-2 py-1">
                      {video.category}
                    </Badge>

                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
                      <span className="text-white/90 text-[10px] sm:text-[11px] md:text-xs font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
                        {video.duration}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
                  </div>

                  <h4 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight px-1">
                    {video.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sm:hidden mt-6 pt-4 border-t border-border/30">
          <button
            onClick={handleViewAllNews}
            className="w-full py-3 bg-primary/5 text-primary font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
          >
            Ver todas las noticias
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
