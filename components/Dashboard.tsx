
import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ExternalLink, Bookmark, History, Newspaper, ArrowRight, Zap } from 'lucide-react';
import { smartSearch, fetchDesignNews } from '../services/geminiService';
import { SearchResult, View, NewsItem } from '../types';

interface DashboardProps {
  onChangeView: (view: View) => void;
}

const QUICK_LINKS = [
  { name: 'ChatGPT', url: 'https://chat.openai.com', domain: 'openai.com', color: 'hover:shadow-green-200' },
  { name: 'Gemini', url: 'https://gemini.google.com', domain: 'gemini.google.com', color: 'hover:shadow-blue-200' },
  { name: 'Roozrang', url: 'https://roozrang.com', domain: 'roozrang.com', color: 'hover:shadow-orange-200' },
  { name: 'Dribbble', url: 'https://dribbble.com', domain: 'dribbble.com', color: 'hover:shadow-pink-200' },
  { name: 'Grok', url: 'https://x.ai', domain: 'x.ai', color: 'hover:shadow-gray-300' },
];

export const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  // Search State
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  
  // News State
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      setNewsLoading(true);
      const data = await fetchDesignNews();
      setNews(data);
      setNewsLoading(false);
    };
    loadNews();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearchLoading(true);
    setResult(null);
    const aiResult = await smartSearch(query);
    setResult(aiResult);
    setSearchLoading(false);
  };

  const saveSearch = () => {
    if (query && !savedSearches.includes(query)) {
      setSavedSearches([query, ...savedSearches]);
    }
  };

  const restoreSearch = (savedQuery: string) => {
    setQuery(savedQuery);
  };

  const extractColor = (text: string) => {
    const match = text.match(/#[0-9A-Fa-f]{6}/);
    return match ? match[0] : null;
  };

  const colorPreview = result ? extractColor(result.answer) : null;

  return (
    <div className="flex flex-col items-center min-h-[80vh] w-full max-w-6xl mx-auto px-4 py-8">
      
      <div className="text-center mb-12 space-y-2">
        <h1 className="text-4xl font-bold text-textMain">
          استودیو هوشمند گرافیک
        </h1>
        <p className="text-textLight text-lg">
          دستیار هوشمند برای طراحان خلاق
        </p>
      </div>

      {/* SEARCH SECTION */}
      <div className="w-full max-w-3xl animate-fadeIn mb-12">
        {/* Search Box */}
        <div className="w-full relative mb-8">
          <form onSubmit={handleSearch} className="relative w-full">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="مثال: «کد رنگ سبز سدری»، «ابزار حذف نویز»..."
              className="w-full p-5 pr-14 pl-14 rounded-2xl border-2 border-borderLight focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-lg shadow-lg transition-all bg-white"
            />
            <button 
              type="submit"
              className="absolute right-3 top-3 p-2 bg-primary text-white rounded-xl hover:bg-primaryDark transition-colors"
              disabled={searchLoading}
            >
              {searchLoading ? (
                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Search className="w-6 h-6" />
              )}
            </button>
            {result && (
              <button 
                type="button"
                onClick={saveSearch}
                className="absolute left-3 top-3 p-2 text-textLight hover:text-primary hover:bg-purple-50 rounded-xl transition-colors"
                title="ذخیره جستجو"
              >
                <Bookmark className="w-6 h-6" />
              </button>
            )}
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="w-full bg-white rounded-2xl border border-borderLight shadow-sm p-6 animate-fadeIn space-y-6 mb-8">
            <div className="flex gap-6 flex-col md:flex-row">
               <div className="flex-1">
                  <h3 className="text-lg font-bold text-textMain mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    پاسخ هوشمند
                  </h3>
                  <div className="prose prose-sm max-w-none text-textMain leading-relaxed whitespace-pre-line">
                    {result.answer}
                  </div>
               </div>
               {colorPreview && (
                 <div className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl border border-borderLight md:w-48">
                   <div 
                    className="w-24 h-24 rounded-full shadow-md border-4 border-white" 
                    style={{ backgroundColor: colorPreview }}
                   ></div>
                   <span className="font-mono font-bold text-lg text-textMain">{colorPreview}</span>
                 </div>
               )}
            </div>
            {result.sources.length > 0 && (
              <div className="pt-4 border-t border-borderLight">
                <h4 className="text-sm font-bold text-textLight mb-3">منابع و لینک‌ها</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.sources.map((source, idx) => (
                    <a key={idx} href={source.uri} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all group">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-blue-500 group-hover:text-blue-600"><ExternalLink className="w-4 h-4" /></div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-textMain truncate group-hover:text-blue-700">{source.title}</p>
                        <p className="text-xs text-textLight truncate opacity-70">{source.uri}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {savedSearches.length > 0 && !result && (
          <div className="w-full mb-8">
            <h3 className="text-sm font-bold text-textLight mb-3 flex items-center gap-2"><History className="w-4 h-4" /> جستجوهای اخیر</h3>
            <div className="flex flex-wrap gap-2">
              {savedSearches.map((s, i) => (
                <button key={i} onClick={() => restoreSearch(s)} className="px-3 py-1.5 bg-white border border-borderLight rounded-lg text-sm text-textMain hover:border-primary hover:text-primary transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QUICK LINKS SECTION */}
      <div className="w-full max-w-4xl mb-16 animate-fadeIn delay-100">
        <h3 className="text-sm font-bold text-textLight mb-4 flex items-center gap-2 px-2">
            <Zap className="w-4 h-4 text-primary" /> ابزارهای کاربردی
        </h3>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {QUICK_LINKS.map((link, idx) => (
                <a 
                    key={idx} 
                    href={link.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex flex-col items-center gap-3 group"
                >
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl border border-borderLight shadow-sm flex items-center justify-center transition-all transform group-hover:-translate-y-2 group-hover:shadow-xl overflow-hidden ${link.color}`}>
                        <img 
                            src={`https://www.google.com/s2/favicons?domain=${link.domain}&sz=128`} 
                            alt={link.name}
                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all"
                            loading="lazy"
                        />
                    </div>
                    <span className="text-sm font-medium text-textLight group-hover:text-primary transition-colors">{link.name}</span>
                </a>
            ))}
        </div>
      </div>

      {/* DESIGN NEWS SECTION */}
      <div className="w-full animate-fadeIn delay-200">
        <div className="flex items-center gap-2 mb-6">
           <Newspaper className="w-6 h-6 text-primary" />
           <h2 className="text-2xl font-bold text-textMain">تازه های دنیای دیزاین</h2>
           <div className="h-px bg-borderLight flex-1 ml-4"></div>
        </div>

        {newsLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[1, 2, 3].map(i => (
               <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>
             ))}
           </div>
        ) : news.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {news.map((item, index) => (
               <div 
                 key={index} 
                 className="bg-white rounded-2xl p-6 border border-borderLight shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden"
               >
                 {/* Decorative gradient background opacity */}
                 <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
                 
                 <div className="flex justify-between items-start mb-4 relative z-10">
                   <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                     {item.source}
                   </span>
                   <span className="text-[10px] text-textLight">{item.date}</span>
                 </div>
                 
                 <h3 className="font-bold text-lg text-textMain mb-3 leading-snug group-hover:text-primary transition-colors relative z-10">
                   {item.title}
                 </h3>
                 
                 <p className="text-sm text-textLight leading-relaxed mb-6 flex-1 relative z-10">
                   {item.summary}
                 </p>
                 
                 <a 
                   href={item.url} 
                   target="_blank" 
                   rel="noreferrer"
                   className="flex items-center gap-2 text-sm font-bold text-textMain hover:text-primary transition-colors mt-auto self-end relative z-10"
                 >
                   مطالعه خبر <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                 </a>
               </div>
             ))}
           </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-borderLight border-dashed">
            <p className="text-textLight">در حال حاضر خبری یافت نشد یا ارتباط با سرور برقرار نیست.</p>
          </div>
        )}
      </div>

    </div>
  );
};
