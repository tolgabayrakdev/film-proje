"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '../components/Header';

// Types
interface Movie {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  vote_average: number;
  poster_path: string;
  runtime?: number;
  genres?: {id: number; name: string}[];
  videos?: {
    results: {
      key: string;
      site: string;
      type: string;
      official: boolean;
      published_at: string;
    }[];
  };
  director?: string;
  cast?: {name: string; character: string}[];
  budget?: number;
  revenue?: number;
  production_companies?: {name: string; logo_path: string}[];
  similar_movies?: Movie[];
}

interface Question {
  id: string;
  text: string;
  options: {
    value: string;
    label: string;
  }[];
}

// TMDB API configuration
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export default function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comparisonMovies, setComparisonMovies] = useState<Movie[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Check if API key is available
  useEffect(() => {
    if (!TMDB_API_KEY) {
      setError('TMDB API anahtarı bulunamadı. Lütfen .env.local dosyasını kontrol edin.');
    }
  }, []);

  // Questions to ask the user
  const questions: Question[] = [
    {
      id: "mood",
      text: "Şu anki ruh haliniz nasıl?",
      options: [
        { value: "happy", label: "Mutlu ve neşeli" },
        { value: "sad", label: "Hüzünlü veya düşünceli" },
        { value: "excited", label: "Heyecanlı ve enerjik" },
        { value: "relaxed", label: "Sakin ve rahat" },
        { value: "stressed", label: "Stresli veya gergin" }
      ]
    },
    {
      id: "genre",
      text: "Hangi film türünü tercih edersiniz?",
      options: [
        { value: "28", label: "Aksiyon" },
        { value: "35", label: "Komedi" },
        { value: "18", label: "Drama" },
        { value: "27", label: "Korku" },
        { value: "10749", label: "Romantik" },
        { value: "878", label: "Bilim Kurgu" },
        { value: "53", label: "Gerilim" }
      ]
    },
    {
      id: "length",
      text: "Film uzunluğu tercihiniz nedir?",
      options: [
        { value: "short", label: "Kısa (90 dakikadan az)" },
        { value: "medium", label: "Orta (90-120 dakika)" },
        { value: "long", label: "Uzun (120 dakikadan fazla)" }
      ]
    },
    {
      id: "company",
      text: "Filmi kiminle izleyeceksiniz?",
      options: [
        { value: "alone", label: "Yalnız" },
        { value: "partner", label: "Eşim/Sevgilim ile" },
        { value: "family", label: "Ailemle" },
        { value: "friends", label: "Arkadaşlarımla" }
      ]
    },
    {
      id: "era",
      text: "Hangi dönem filmlerini tercih edersiniz?",
      options: [
        { value: "new", label: "Yeni filmler (son 5 yıl)" },
        { value: "recent", label: "Yakın dönem (5-15 yıl)" },
        { value: "classic", label: "Klasik filmler (15+ yıl)" },
        { value: "any", label: "Fark etmez" }
      ]
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];
  
  const handleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value
    });
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      fetchRecommendations();
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!TMDB_API_KEY) {
        throw new Error('TMDB API anahtarı bulunamadı. Lütfen .env.local dosyasını kontrol edin.');
      }
      
      // Build query parameters based on user answers
      const genreId = answers.genre;
      const releaseYear = getYearRangeParam(answers.era);
      
      // Fetch multiple pages of movies from TMDB
      const pages = [1, 2, 3]; // Get 3 pages of results
      const allMovies = [];
      
      for (const page of pages) {
        const response = await fetch(
          `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=tr-TR&sort_by=popularity.desc&include_adult=false&with_genres=${genreId}${releaseYear}&page=${page}`
        );
        
        if (!response.ok) {
          throw new Error('API isteği başarısız oldu');
        }
        
        const data = await response.json();
        allMovies.push(...data.results);
      }
      
      // Fetch additional details for each movie
      const moviesWithDetails = await Promise.all(
        allMovies.map(async (movie: Movie) => {
          const detailsResponse = await fetch(
            `${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}&language=tr-TR`
          );
          
          if (detailsResponse.ok) {
            const details = await detailsResponse.json();
            return { ...movie, runtime: details.runtime, genres: details.genres };
          }
          
          return movie;
        })
      );
      
      // Filter by runtime if specified
      let filteredMovies = filterByRuntime(moviesWithDetails, answers.length);
      
      // Further personalize based on mood and company
      filteredMovies = personalizeByMoodAndCompany(filteredMovies, answers.mood, answers.company);
      
      // Sort by vote average and take top 20
      filteredMovies.sort((a, b) => b.vote_average - a.vote_average);
      filteredMovies = filteredMovies.slice(0, 20);
      
      setRecommendedMovies(filteredMovies);
      setShowResults(true);
    } catch (error) {
      console.error('Film önerileri alınırken hata oluştu:', error);
      setError(error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getYearRangeParam = (era: string) => {
    const currentYear = new Date().getFullYear();
    
    switch (era) {
      case 'new':
        return `&primary_release_date.gte=${currentYear - 5}-01-01`;
      case 'recent':
        return `&primary_release_date.gte=${currentYear - 15}-01-01&primary_release_date.lte=${currentYear - 5}-12-31`;
      case 'classic':
        return `&primary_release_date.lte=${currentYear - 15}-12-31`;
      default:
        return '';
    }
  };

  const filterByRuntime = (movies: Movie[], lengthPreference: string) => {
    if (!lengthPreference || lengthPreference === 'any') return movies;
    
    return movies.filter(movie => {
      if (!movie.runtime) return true;
      
      switch (lengthPreference) {
        case 'short':
          return movie.runtime < 100;
        case 'medium':
          return movie.runtime >= 90 && movie.runtime <= 130;
        case 'long':
          return movie.runtime > 120;
        default:
          return true;
      }
    });
  };

  const personalizeByMoodAndCompany = (movies: Movie[], mood: string, company: string) => {
    let sortedMovies = [...movies];
    
    sortedMovies.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      // Ruh haline göre puanlama
      switch (mood) {
        case 'happy':
          // Mutlu ruh hali için yüksek puanlı ve popüler filmler
          if (a.vote_average > 7.0) scoreA += 2;
          if (b.vote_average > 7.0) scoreB += 2;
          break;
        case 'sad':
          // Hüzünlü ruh hali için daha dramatik filmler
          if (a.vote_average > 7.5) scoreA += 2;
          if (b.vote_average > 7.5) scoreB += 2;
          break;
        case 'excited':
          // Heyecanlı ruh hali için yüksek tempolu filmler
          if (a.vote_average > 6.5) scoreA += 2;
          if (b.vote_average > 6.5) scoreB += 2;
          break;
        case 'relaxed':
          // Rahat ruh hali için orta puanlı filmler
          if (a.vote_average > 6.0 && a.vote_average < 8.0) scoreA += 2;
          if (b.vote_average > 6.0 && b.vote_average < 8.0) scoreB += 2;
          break;
        case 'stressed':
          // Stresli ruh hali için rahatlatıcı filmler
          if (a.vote_average > 6.5 && a.vote_average < 8.5) scoreA += 2;
          if (b.vote_average > 6.5 && b.vote_average < 8.5) scoreB += 2;
          break;
      }

      // İzleme arkadaşına göre puanlama
      switch (company) {
        case 'family':
          // Aile için uygun filmler
          if (a.vote_average > 6.5) scoreA += 2;
          if (b.vote_average > 6.5) scoreB += 2;
          break;
        case 'partner':
          // Eş/Sevgili için romantik veya yüksek puanlı filmler
          if (a.vote_average > 7.0) scoreA += 2;
          if (b.vote_average > 7.0) scoreB += 2;
          break;
        case 'friends':
          // Arkadaşlarla izlemek için eğlenceli filmler
          if (a.vote_average > 6.0) scoreA += 1;
          if (b.vote_average > 6.0) scoreB += 1;
          break;
        case 'alone':
          // Yalnız izlemek için daha derin filmler
          if (a.vote_average > 7.5) scoreA += 2;
          if (b.vote_average > 7.5) scoreB += 2;
          break;
      }
      
      return scoreB - scoreA;
    });
    
    return sortedMovies;
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setRecommendedMovies([]);
    setShowResults(false);
    setSelectedMovie(null);
  };

  const showMovieDetails = async (movie: Movie) => {
    try {
      // Fetch movie videos
      const videosResponse = await fetch(
        `${TMDB_BASE_URL}/movie/${movie.id}/videos?api_key=${TMDB_API_KEY}&language=tr-TR`
      );
      
      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        setSelectedMovie({ ...movie, videos: videosData });
      } else {
        setSelectedMovie(movie);
      }
    } catch (error) {
      console.error('Film videoları alınırken hata oluştu:', error);
      setSelectedMovie(movie);
    }
  };

  const closeMovieDetails = () => {
    setSelectedMovie(null);
  };

  // Progress percentage for the progress bar
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  const shareRecommendations = async () => {
    try {
      const shareText = `Film Öneri Asistanı'nın benim için seçtiği filmler:\n\n${recommendedMovies.map((movie, index) => 
        `${index + 1}. ${movie.title} (${movie.release_date ? new Date(movie.release_date).getFullYear() : 'Bilinmiyor'})`
      ).join('\n')}\n\nFilm Öneri Asistanı'na göz at: ${window.location.origin}`;

      if (navigator.share) {
        await navigator.share({
          title: 'Film Önerilerim',
          text: shareText,
          url: window.location.href
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(shareText);
        alert('Film listesi panoya kopyalandı!');
      }
    } catch (error) {
      console.error('Paylaşım sırasında hata oluştu:', error);
    }
  };

  const toggleMovieComparison = async (movie: Movie) => {
    setComparisonMovies(prev => {
      const isSelected = prev.some(m => m.id === movie.id);
      if (isSelected) {
        return prev.filter(m => m.id !== movie.id);
      } else if (prev.length < 2) {
        // Fetch detailed movie information before adding to comparison
        fetchMovieDetails(movie.id)
          .then(detailedMovie => {
            setComparisonMovies(current => {
              const existingMovies = current.filter(m => m.id !== movie.id);
              return [...existingMovies, detailedMovie];
            });
          })
          .catch(error => {
            console.error('Film detayları alınırken hata oluştu:', error);
            // If there's an error, add the basic movie info
            return [...prev, movie];
          });
        return prev;
      }
      return prev;
    });
  };

  const clearComparison = () => {
    setComparisonMovies([]);
  };

  const fetchMovieDetails = async (movieId: number): Promise<Movie> => {
    try {
      const [detailsResponse, creditsResponse, similarResponse] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=tr-TR`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=tr-TR`),
        fetch(`${TMDB_BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&language=tr-TR&page=1`)
      ]);

      const details = await detailsResponse.json();
      const credits = await creditsResponse.json();
      const similar = await similarResponse.json();

      const director = credits.crew.find((person: any) => person.job === 'Director')?.name;
      const cast = credits.cast.slice(0, 5).map((actor: any) => ({
        name: actor.name,
        character: actor.character
      }));

      return {
        ...details,
        director,
        cast,
        similar_movies: similar.results.slice(0, 5)
      };
    } catch (error) {
      console.error('Film detayları alınırken hata oluştu:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-indigo-700">
      <Header />
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Quiz Container */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20">
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white">
                  Film Öneri Asistanı
                </h1>
                <p className="mt-2 text-indigo-100">
                  Sizin için en uygun filmleri bulmamıza yardımcı olun
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-100">
                  <p>{error}</p>
                </div>
              )}

              {/* Quiz Content */}
              {!showResults ? (
                <div className="space-y-8">
                  {!loading ? (
                    <>
                      {/* Progress */}
                      <div className="relative">
                        <div className="flex justify-between text-sm text-indigo-100 mb-2">
                          <span>Soru {currentQuestionIndex + 1}/{questions.length}</span>
                          <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white transition-all duration-300 rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Question */}
                      <div>
                        <h2 className="text-xl font-medium text-white mb-6">
                          {currentQuestion.text}
                        </h2>
                        <div className="space-y-3">
                          {currentQuestion.options.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleAnswer(option.value)}
                              className="w-full p-4 text-left text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 border border-white/10 hover:border-white/30"
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Navigation */}
                      {currentQuestionIndex > 0 && (
                        <div className="pt-4 text-center">
                          <button
                            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                            className="text-indigo-100 hover:text-white transition-colors"
                          >
                            ← Önceki Soru
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="inline-block">
                        <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      </div>
                      <p className="mt-4 text-indigo-100">
                        Film önerileri hazırlanıyor...
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {selectedMovie ? (
                    // Movie Details View
                    <div className="animate-fade-in">
                      <div className="flex justify-between items-start mb-6">
                        <button 
                          onClick={closeMovieDetails}
                          className="text-indigo-100 hover:text-white transition-colors"
                        >
                          ← Listeye Dön
                        </button>
                      </div>

                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">
                          {selectedMovie.title}
                        </h2>

                        {/* Trailer Section */}
                        {selectedMovie.videos?.results && selectedMovie.videos.results.length > 0 && (
                          <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                            <iframe
                              src={`https://www.youtube.com/embed/${selectedMovie.videos.results[0].key}`}
                              title={`${selectedMovie.title} Fragmanı`}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="absolute inset-0 w-full h-full"
                            />
                          </div>
                        )}

                        <div className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-lg">
                          <Image 
                            src={selectedMovie.poster_path ? `${TMDB_IMAGE_BASE_URL}${selectedMovie.poster_path}` : '/placeholder.svg'} 
                            alt={selectedMovie.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex items-center gap-4 text-sm text-indigo-100">
                          <span>{selectedMovie.release_date ? new Date(selectedMovie.release_date).getFullYear() : 'Bilinmiyor'}</span>
                          {selectedMovie.runtime && (
                            <span>{selectedMovie.runtime} dakika</span>
                          )}
                          <span className="flex items-center">
                            <span className="text-yellow-300 mr-1">★</span>
                            {selectedMovie.vote_average.toFixed(1)}
                          </span>
                        </div>

                        {selectedMovie.genres && (
                          <div className="flex flex-wrap gap-2">
                            {selectedMovie.genres.map(genre => (
                              <span 
                                key={genre.id} 
                                className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-indigo-100"
                              >
                                {genre.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-indigo-100 leading-relaxed">
                          {selectedMovie.overview || 'Bu film için açıklama bulunmuyor.'}
                        </p>

                        <div className="pt-4">
                          <a 
                            href={`https://www.themoviedb.org/movie/${selectedMovie.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex px-6 py-2.5 bg-white text-indigo-600 rounded-lg hover:bg-white/90 transition-colors font-medium"
                          >
                            TMDB'de Görüntüle
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Results View
                    <div>
                      <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-white">
                          Size Özel Film Önerileri
                        </h2>
                        <button
                          onClick={shareRecommendations}
                          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                          </svg>
                          Paylaş
                        </button>
                      </div>

                      {recommendedMovies.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {recommendedMovies.map((movie) => (
                            <div 
                              key={movie.id} 
                              className="group relative"
                            >
                              <div 
                                className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-lg mb-2 cursor-pointer"
                                onClick={() => showMovieDetails(movie)}
                              >
                                <Image 
                                  src={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : '/placeholder.svg'} 
                                  alt={movie.title}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                  <span className="text-white text-sm">Detayları Gör</span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMovieComparison(movie);
                                }}
                                className={`absolute top-2 right-2 p-2 rounded-full ${
                                  comparisonMovies.some(m => m.id === movie.id)
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                              >
                                {comparisonMovies.some(m => m.id === movie.id) ? '✓' : '+'}
                              </button>
                              <h3 className="text-white font-medium text-sm line-clamp-1">
                                {movie.title}
                              </h3>
                              <div className="flex items-center gap-2 text-xs text-indigo-100">
                                <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'Bilinmiyor'}</span>
                                <span>★ {movie.vote_average.toFixed(1)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-indigo-100">
                            Üzgünüz, kriterlerinize uygun film bulunamadı.
                          </p>
                        </div>
                      )}

                      {comparisonMovies.length === 2 && (
                        <div className="mt-12">
                          <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold text-white">Film Karşılaştırması</h3>
                            <button
                              onClick={clearComparison}
                              className="text-indigo-100 hover:text-white transition-colors"
                            >
                              Karşılaştırmayı Temizle
                            </button>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {comparisonMovies.map((movie) => (
                              <div key={movie.id} className="bg-white/5 rounded-xl p-8 border border-white/10">
                                <div className="flex gap-8">
                                  <div className="w-1/3">
                                    <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-lg">
                                      <Image 
                                        src={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : '/placeholder.svg'} 
                                        alt={movie.title}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  </div>
                                  <div className="w-2/3 space-y-6">
                                    <div>
                                      <h4 className="text-white font-bold text-2xl mb-3">{movie.title}</h4>
                                      <div className="flex items-center gap-6 text-base text-indigo-100">
                                        <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'Bilinmiyor'}</span>
                                        <span className="flex items-center">
                                          <span className="text-yellow-300 mr-1">★</span>
                                          {movie.vote_average.toFixed(1)}
                                        </span>
                                        {movie.runtime && (
                                          <span>{movie.runtime} dakika</span>
                                        )}
                                      </div>
                                    </div>

                                    {movie.genres && (
                                      <div className="flex flex-wrap gap-2">
                                        {movie.genres.map(genre => (
                                          <span 
                                            key={genre.id} 
                                            className="px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-sm text-indigo-100"
                                          >
                                            {genre.name}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                    {movie.director && (
                                      <div>
                                        <p className="text-sm text-indigo-100/80 mb-1">Yönetmen</p>
                                        <p className="text-white text-lg">{movie.director}</p>
                                      </div>
                                    )}

                                    {movie.cast && movie.cast.length > 0 && (
                                      <div>
                                        <p className="text-sm text-indigo-100/80 mb-2">Başrol Oyuncuları</p>
                                        <div className="space-y-2">
                                          {movie.cast.map((actor, index) => (
                                            <p key={index} className="text-white">
                                              {actor.name} <span className="text-indigo-100/80">({actor.character})</span>
                                            </p>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {movie.budget && (
                                      <div>
                                        <p className="text-sm text-indigo-100/80 mb-1">Bütçe</p>
                                        <p className="text-white text-lg">${movie.budget.toLocaleString()}</p>
                                      </div>
                                    )}

                                    {movie.revenue && (
                                      <div>
                                        <p className="text-sm text-indigo-100/80 mb-1">Hasılat</p>
                                        <p className="text-white text-lg">${movie.revenue.toLocaleString()}</p>
                                      </div>
                                    )}

                                    {movie.production_companies && movie.production_companies.length > 0 && (
                                      <div>
                                        <p className="text-sm text-indigo-100/80 mb-2">Yapım Şirketleri</p>
                                        <div className="flex flex-wrap gap-2">
                                          {movie.production_companies.map((company, index) => (
                                            <span key={index} className="text-white">
                                              {company.name}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {movie.similar_movies && movie.similar_movies.length > 0 && (
                                  <div className="mt-8">
                                    <p className="text-sm text-indigo-100/80 mb-3">Benzer Filmler</p>
                                    <div className="grid grid-cols-5 gap-3">
                                      {movie.similar_movies.map((similar) => (
                                        <div 
                                          key={similar.id} 
                                          className="aspect-[2/3] relative rounded-lg overflow-hidden cursor-pointer group"
                                          onClick={() => showMovieDetails(similar)}
                                        >
                                          <Image 
                                            src={similar.poster_path ? `${TMDB_IMAGE_BASE_URL}${similar.poster_path}` : '/placeholder.svg'} 
                                            alt={similar.title}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                            <span className="text-white text-xs line-clamp-2">{similar.title}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-8 text-center">
                        <button
                          onClick={resetQuiz}
                          className="px-6 py-2.5 bg-white text-indigo-600 rounded-lg hover:bg-white/90 transition-colors font-medium"
                        >
                          Yeniden Başla
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-indigo-100/50 text-sm">
            <p>Tolga BAYRAK</p>
          </div>
        </div>
      </div>
    </div>
  );
} 