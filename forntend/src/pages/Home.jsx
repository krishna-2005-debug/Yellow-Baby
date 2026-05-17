import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import EmptyState from '../components/EmptyState';
import SEO from '../components/SEO';
import { getProducts, getCategories, getAllContent } from '../api/api';

/* ── Tailwind Safelist ────────────────────────────────────────────────────────
  Since Tailwind strips unused classes, dynamic colors from the DB need to be safelisted.
  from-amber-50 via-yellow-50 to-orange-50 bg-yellow-100 from-yellow-400 to-amber-500
  from-pink-50 via-rose-50 to-fuchsia-50 bg-pink-100 from-pink-400 to-rose-500
  from-sky-50 via-blue-50 to-indigo-50 bg-blue-100 from-blue-400 to-sky-500
  bg-gradient-to-r bg-gradient-to-br
  bg-pink-50 border-pink-100 text-pink-700
  bg-yellow-50 border-yellow-100 text-yellow-700
  bg-blue-50 border-blue-100 text-blue-700
  bg-purple-50 border-purple-100 text-purple-700
  bg-green-50 border-green-100 text-green-700
────────────────────────────────────────────────────────────────────────────── */

/* ── Fallback data (used until API responds) ──────────────────────────────── */
const FALLBACK_SLIDES = [
  { id: 1, title: 'Tiny Styles,\nBig Smiles', subtitle: 'Soft, safe clothing made for little explorers', tag: '✨ New Arrivals', cta_label: 'Shop New Arrivals', cta_url: '/', bg_from: 'amber-50', bg_via: 'yellow-50', bg_to: 'orange-50', accent_from: 'yellow-400', accent_to: 'amber-500', decor_bg: 'yellow-100', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80' },
  { id: 2, title: 'Pretty Little\nThings', subtitle: 'Dresses, frocks & more for your little princess', tag: '💗 Girls\' Collection', cta_label: 'Shop Girls', cta_url: '/?gender=girls', bg_from: 'pink-50', bg_via: 'rose-50', bg_to: 'fuchsia-50', accent_from: 'pink-400', accent_to: 'rose-500', decor_bg: 'pink-100', image: 'https://images.unsplash.com/photo-1518831959646-f40cac59eb8a?w=800&q=80' },
  { id: 3, title: 'Adventure\nStarts Here', subtitle: 'Cool, comfy fits for active little boys', tag: '💙 Boys\' Collection', cta_label: 'Shop Boys', cta_url: '/?gender=boys', bg_from: 'sky-50', bg_via: 'blue-50', bg_to: 'indigo-50', accent_from: 'blue-400', accent_to: 'sky-500', decor_bg: 'blue-100', image: 'https://images.unsplash.com/photo-1471286174890-9c112d708306?w=800&q=80' },
];
const FALLBACK_CATS = [
  { id: 1, image: null, label: 'Dresses',    search_filter: 'Dresses',      gender_filter: '' },
  { id: 2, image: null, label: 'T-Shirts',   search_filter: 'T-Shirts',     gender_filter: '' },
  { id: 3, image: null, label: 'Bottoms',    search_filter: 'Bottoms',      gender_filter: '' },
  { id: 4, image: null, label: 'Winter Wear',search_filter: 'Winter Wear',  gender_filter: '' },
  { id: 5, image: null, label: 'Sets',       search_filter: 'Sets & Combos',gender_filter: '' },
  { id: 6, image: null, label: 'Girls',      search_filter: '',             gender_filter: 'girls' },
  { id: 7, image: null, label: 'Boys',       search_filter: '',             gender_filter: 'boys' },
  { id: 8, image: null, label: 'Unisex',     search_filter: '',             gender_filter: 'unisex' },
];
const FALLBACK_AGES = [
  { id: 1, emoji: '🍼', label: 'Newborn',  age_range: '0-6M',  bg_color: 'bg-pink-50 border-pink-100',     text_color: 'text-pink-700' },
  { id: 2, emoji: '🐣', label: 'Infant',   age_range: '6-12M', bg_color: 'bg-yellow-50 border-yellow-100', text_color: 'text-yellow-700' },
  { id: 3, emoji: '🎠', label: 'Toddler',  age_range: '1-3Y',  bg_color: 'bg-blue-50 border-blue-100',     text_color: 'text-blue-700' },
  { id: 4, emoji: '🚀', label: 'Kids',     age_range: '3-8Y',  bg_color: 'bg-purple-50 border-purple-100', text_color: 'text-purple-700' },
  { id: 5, emoji: '⚽', label: 'Pre-teen', age_range: '8-12Y', bg_color: 'bg-green-50 border-green-100',   text_color: 'text-green-700' },
];
const FALLBACK_TRUST = [
  { id: 1, icon: '🚚', text: 'Free Shipping on ₹499+' },
  { id: 2, icon: '🛡️', text: 'Safe & Certified Materials' },
  { id: 3, icon: '🔄', text: 'Easy 7-Day Returns' },
  { id: 4, icon: '📦', text: 'Packed with Love' },
];
const FALLBACK_FEATURES = [
  { id: 1, icon: '🌿', title: 'Safe Materials',    description: 'OEKO-TEX certified soft fabrics' },
  { id: 2, icon: '✂️', title: 'Quality Stitching', description: 'Built to last through every adventure' },
  { id: 3, icon: '🎨', title: 'Vibrant Colors',    description: 'Prints that stay bright, wash after wash' },
  { id: 4, icon: '❤️', title: 'Made with Love',    description: 'Every piece designed for comfort' },
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [heroSlide, setHeroSlide] = useState(0);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const heroTimer = useRef(null);

  // ── Content state (from admin API) ──────────────────────────────────────────
  const [heroSlides,   setHeroSlides]   = useState(FALLBACK_SLIDES);
  const [quickCats,    setQuickCats]    = useState(FALLBACK_CATS);
  const [ageGroups,    setAgeGroups]    = useState(FALLBACK_AGES);
  const [trustItems,   setTrustItems]   = useState(FALLBACK_TRUST);
  const [featureCards, setFeatureCards] = useState(FALLBACK_FEATURES);

  const PAGE_SIZE = 12;

  const filters = {
    gender:    searchParams.get('gender')    || '',
    category:  searchParams.get('category')  ? Number(searchParams.get('category')) : '',
    age_group: searchParams.get('age_group') || '',
    size:      searchParams.get('size')      || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    in_stock:  searchParams.get('in_stock')  || '',
    search:    searchParams.get('search')    || '',
    ordering:  searchParams.get('ordering')  || '',
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // ── Fetch products ──────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const { data } = await getProducts(params);
      setProducts(data.results || data);
      setTotalCount(data.count || (data.results || data).length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, page]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Fetch categories & content ──────────────────────────────────────────────
  useEffect(() => {
    getCategories().then(({ data }) => setCategories(data.results || data)).catch(() => {});

    // Fetch all homepage content in one request
    getAllContent().then(({ data }) => {
      if (data.hero_slides?.length)      setHeroSlides(data.hero_slides);
      if (data.quick_categories?.length) setQuickCats(data.quick_categories);
      if (data.age_groups?.length)       setAgeGroups(data.age_groups);
      if (data.trust_items?.length)      setTrustItems(data.trust_items);
      if (data.feature_cards?.length)    setFeatureCards(data.feature_cards);
    }).catch(() => { /* silently keep fallback data */ });
  }, []);

  // ── Hero auto-advance ───────────────────────────────────────────────────────
  const startHeroTimer = () => {
    heroTimer.current = setInterval(() => setHeroSlide((s) => (s + 1) % heroSlides.length), 5000);
  };
  useEffect(() => {
    startHeroTimer();
    return () => clearInterval(heroTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroSlides.length]);

  const goToSlide = (i) => {
    clearInterval(heroTimer.current);
    setHeroSlide(i);
    startHeroTimer();
  };

  const updateFilters = (newFilters) => {
    const params = {};
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params[k] = String(v); });
    setSearchParams(params);
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ ...filters, search: searchInput });
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const slide = heroSlides[heroSlide] || heroSlides[0];

  const hasAnyFilter = activeFilterCount > 0;

  if (!slide) return null;

  return (
    <div className="min-h-screen bg-[#FCF4EE]">
      <SEO title="Shop the Best Kids Clothing" description="Explore our premium collections for baby and kids clothing. Dresses, sets, winter wear and more." />

      {/* ── Hero ── */}
      <section className={`relative bg-gradient-to-br from-${slide.bg_from} via-${slide.bg_via} to-${slide.bg_to} pt-16 transition-colors duration-700 overflow-hidden`}>
        {/* Decorative blobs */}
        <div className={`absolute top-10 right-10 w-64 h-64 rounded-full bg-${slide.decor_bg} opacity-40 blur-3xl pointer-events-none`} />
        <div className={`absolute bottom-0 left-0 w-48 h-48 rounded-full bg-${slide.decor_bg} opacity-30 blur-2xl pointer-events-none`} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-20 relative z-10">
          <div className="flex flex-row items-center gap-4 md:gap-8">
            {/* Text */}
            <div className="flex-1 space-y-3 md:space-y-5 min-w-0">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold text-white bg-gradient-to-r from-${slide.accent_from} to-${slide.accent_to} shadow-md`}>
                {slide.tag}
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-6xl font-extrabold text-gray-800 leading-[1.15] whitespace-pre-line tracking-tight">
                {slide.title}
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm md:text-lg max-w-md leading-relaxed hidden sm:block">{slide.subtitle}</p>
              <Link
                to={slide.cta_url}
                onClick={() => {
                  if (slide.cta_url.includes('gender=')) {
                    const gender = slide.cta_url.includes('girls') ? 'girls' : 'boys';
                    updateFilters({ gender });
                  }
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 md:px-7 md:py-3.5 rounded-2xl bg-gradient-to-r from-${slide.accent_from} to-${slide.accent_to} text-white font-bold text-xs md:text-sm shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-200`}
              >
                {slide.cta_label}
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
              </Link>
            </div>

            {/* Hero Image */}
            <div className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-96 md:h-96 flex-shrink-0">
              <div className={`absolute inset-0 bg-${slide.decor_bg} rounded-full blur-2xl opacity-60 scale-110`} />
              <Link to={slide.cta_url}
                onClick={() => {
                  if (slide.cta_url.includes('gender=')) {
                    const gender = slide.cta_url.includes('girls') ? 'girls' : 'boys';
                    updateFilters({ gender });
                  }
                }}
                className="relative w-full h-full drop-shadow-2xl flex items-center justify-center cursor-pointer"
                style={{ animation: 'heroFloat 3s ease-in-out infinite' }}>
                {slide.image ? (
                  <img 
                    src={slide.image} 
                    alt={slide.title} 
                    className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-2xl" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80";
                    }}
                  />
                ) : (
                  <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400 text-xs">No Image</div>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Slide Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <button onClick={() => goToSlide((heroSlide - 1 + heroSlides.length) % heroSlides.length)}
            className="w-6 h-6 rounded-full bg-white/60 hover:bg-white/90 flex items-center justify-center transition-colors">
            <ChevronLeft className="w-3 h-3 text-gray-600" />
          </button>
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => goToSlide(i)}
              className={`rounded-full transition-all duration-300 ${i === heroSlide ? 'w-7 h-2.5 bg-gray-700' : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'}`} />
          ))}
          <button onClick={() => goToSlide((heroSlide + 1) % heroSlides.length)}
            className="w-6 h-6 rounded-full bg-white/60 hover:bg-white/90 flex items-center justify-center transition-colors">
            <ChevronRight className="w-3 h-3 text-gray-600" />
          </button>
        </div>
      </section>

      {/* ── Quick Category Strip ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <h2 className="text-base font-bold text-gray-700">Quick Categories</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide justify-start md:justify-center">
          {quickCats.map(({ id, image, label, search_filter, gender_filter }) => (
            <button
              key={id}
              onClick={() => updateFilters(gender_filter ? { gender: gender_filter } : { search: search_filter })}
              className="flex-shrink-0 flex flex-col items-center gap-2 px-5 py-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-yellow-300 hover:shadow-md hover:scale-105 transition-all duration-200 group"
            >
              {image ? (
                <img src={image} alt={label} className="w-12 h-12 object-cover rounded-full bg-gray-50 shadow-inner border border-gray-100" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500 font-bold border border-yellow-100 shadow-inner text-xs">
                  {label.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-semibold text-gray-600 group-hover:text-yellow-600 whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Age Group Cards ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <h2 className="text-base font-bold text-gray-700">Shop by Age</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ageGroups.map(({ id, label, age_range, emoji, bg_color, text_color }) => (
            <button
              key={id}
              onClick={() => updateFilters({ age_group: age_range })}
              className={`flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl border ${bg_color} hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md`}
            >
              <span className="text-2xl md:text-3xl">{emoji}</span>
              <div className="text-center">
                <p className={`text-xs font-bold ${text_color} hidden md:block`}>{label}</p>
                <p className={`text-xs font-semibold ${text_color} opacity-70`}>{age_range}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-around text-white text-xs font-semibold gap-4 overflow-x-auto">
            {trustItems.map(({ id, icon, text }) => (
              <span key={id} className="whitespace-nowrap">{icon} {text}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Products Section ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-7 rounded-full bg-gradient-to-b from-yellow-400 to-amber-500" />
          <h2 className="text-xl font-extrabold text-gray-800">
            {hasAnyFilter ? 'Filtered Products' : 'All Products'}
          </h2>
          <TrendingUp className="w-4 h-4 text-yellow-500" />
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="product-search-input"
                type="text"
                placeholder="Search products, categories..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 text-sm shadow-sm transition-all"
              />
            </div>
            <button type="submit"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all">
              Search
            </button>
          </form>

          <div className="flex gap-2">
            <select
              id="product-sort-select"
              value={filters.ordering}
              onChange={(e) => updateFilters({ ...filters, ordering: e.target.value })}
              className="px-3 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-yellow-400 shadow-sm"
            >
              <option value="">Sort By</option>
              <option value="price">Price: Low → High</option>
              <option value="-price">Price: High → Low</option>
              <option value="-created_at">Newest First</option>
            </select>
            <button
              id="mobile-filter-btn"
              onClick={() => setShowMobileFilter(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-medium shadow-sm hover:border-yellow-400 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-yellow-500" />
              Filters
              {activeFilterCount > 0 && (
                <span className="min-w-[20px] h-5 bg-yellow-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {hasAnyFilter && (
          <div className="flex flex-wrap gap-2 mb-5">
            {Object.entries(filters).map(([k, v]) => v && k !== 'ordering' && (
              <span key={k}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-800 text-xs font-semibold"
              >
                {String(v)}
                <button onClick={() => updateFilters({ ...filters, [k]: '' })}
                  className="hover:text-red-500 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button onClick={() => { setSearchParams({}); setPage(1); setSearchInput(''); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-500 text-xs font-semibold hover:bg-red-100 transition-colors">
              <X className="w-3 h-3" /> Clear All
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar filters={filters} onChange={updateFilters} categories={categories} />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-5">
              {loading ? 'Loading products...' : `${totalCount} product${totalCount !== 1 ? 's' : ''} found`}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : products.map((p) => <ProductCard key={p.id} product={p} />)
              }
            </div>

            {!loading && products.length === 0 && (
              <EmptyState icon="🔍" title="No products found"
                description="Try adjusting your filters or search terms"
                actionLabel="Clear All Filters" actionTo="/" />
            )}

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-3 rounded-2xl border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                  .map((n) => (
                    <button key={n} onClick={() => setPage(n)}
                      className={`w-11 h-11 rounded-2xl text-sm font-bold transition-all ${
                        n === page
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md shadow-yellow-200'
                          : 'border border-gray-200 text-gray-600 hover:border-yellow-400 hover:bg-yellow-50'
                      }`}>
                      {n}
                    </button>
                  ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-3 rounded-2xl border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Why Yellow Baby ── */}
      <section className="bg-gradient-to-br from-yellow-50 to-amber-50 py-16 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Why Parents Love Us</h2>
          <p className="text-gray-500 text-sm mb-10">Trusted by 10,000+ happy families across India</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featureCards.map(({ id, icon, title, description }) => (
              <div key={id} className="flex flex-col items-center gap-3 p-5 bg-white rounded-3xl shadow-sm border border-yellow-100 hover:shadow-md hover:border-yellow-200 transition-all">
                <span className="text-4xl">{icon}</span>
                <h3 className="text-sm font-bold text-gray-800">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilter(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto shadow-2xl rounded-l-3xl">
            <div className="p-4">
              <FilterSidebar
                filters={filters}
                onChange={(f) => { updateFilters(f); setShowMobileFilter(false); }}
                categories={categories}
                onClose={() => setShowMobileFilter(false)}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
