
import React, { useState } from 'react';
import { Search, Filter, X, ExternalLink, Type, Palette as PaletteIcon, Users, LayoutDashboard, Image as ImageIcon } from 'lucide-react';
import { ArtStyle } from '../types';

// Data mock with highly relevant artistic images and full details
const ART_STYLES: ArtStyle[] = [
  {
    id: '1',
    name: 'مینیمالیسم (Minimalism)',
    category: 'مدرن',
    description: 'سبکی که بر سادگی، فضای منفی و استفاده از عناصر ضروری تمرکز دارد. هدف اصلی حذف اضافات برای رسیدن به جوهره پیام است.',
    features: ['فضای سفید زیاد', 'تایپوگرافی ساده و خوانا', 'رنگ‌های محدود', 'اشکال هندسی پایه'],
    usage: ['برندینگ لوکس', 'رابط کاربری (UI)', 'بسته‌بندی محصولات مدرن'],
    avoid: ['طرح‌های هیجانی و شلوغ', 'بافت‌های پیچیده', 'تصاویر با جزئیات زیاد'],
    colors: ['#FFFFFF', '#000000', '#F5F5F5', '#333333'],
    imageUrl: 'https://image.pollinations.ai/prompt/minimalist%20graphic%20design%20poster%20lots%20of%20whitespace%20clean%20sans%20serif%20typography%20simple%20geometric%20shape%20white%20background?width=600&height=400&nologo=true',
    fonts: ['Helvetica', 'Futura', 'Univers', 'Roboto'],
    artists: ['مدرسه باوهاوس', 'دیتر رامز', 'ماکسیم ویگنلی'],
    learnMoreUrl: 'https://fa.wikipedia.org/wiki/کمینه‌گرایی'
  },
  {
    id: '2',
    name: 'مکتب سقاخانه',
    category: 'ایرانی',
    description: 'جریانی در هنر مدرن ایران که در دهه ۱۳۴۰ شکل گرفت. این سبک تلاشی برای پل زدن میان سنت‌های تصویری مذهبی/عامنیه و هنر مدرن غربی بود.',
    features: ['استفاده از طلسم‌ها و ادعیه', 'خط نقاشی', 'رنگ‌های زنده سنتی (فیروزه‌ای، طلایی)', 'نمادهای مذهبی (پنجه، علم)'],
    usage: ['پوستر فرهنگی', 'نقاشی مدرن', 'جلد کتاب‌های هنری', 'تایپوگرافی ایرانی'],
    avoid: ['کارهای شرکتی خشک', 'طراحی‌های کاملاً دیجیتال و فلت'],
    colors: ['#C19A6B', '#00FFFF', '#FF0000', '#FFD700'],
    imageUrl: 'https://image.pollinations.ai/prompt/iranian%20saqqakhaneh%20art%20style%20painting%20persian%20calligraphy%20turquoise%20gold%20traditional%20symbols?width=600&height=400&nologo=true',
    fonts: ['نستعلیق شکسته', 'ثلث', 'تایپوگرافی دستی'],
    artists: ['پرویز تناولی', 'حسین زنده‌رودی', 'فرامرز پیلارام'],
    learnMoreUrl: 'https://fa.wikipedia.org/wiki/مکتب_سقاخانه'
  },
  {
    id: '3',
    name: 'بروتالیسم (Brutalism)',
    category: 'پست‌مدرن',
    description: 'سبکی خام، خشن و جسورانه که از قوانین کلاسیک زیبایی‌شناسی سرپیچی می‌کند. نام آن از بتن خام (Béton brut) گرفته شده است.',
    features: ['فونت‌های درشت و سیستمی', 'عکس‌های بدون روتوش و خام', 'کانتراست بسیار بالا', 'ساختار شکنی و عدم تقارن'],
    usage: ['پوستر موسیقی زیرزمینی', 'وبسایت‌های هنری خاص', 'مد خیابانی (Streetwear)'],
    avoid: ['محصولات سلامتی و لطیف', 'خدمات بانکی و رسمی'],
    colors: ['#0000FF', '#00FF00', '#1A1A1A', '#FF0000'],
    imageUrl: 'https://image.pollinations.ai/prompt/neo%20brutalism%20web%20design%20raw%20acid%20green%20and%20black%20courier%20font%20chaos%20layout?width=600&height=400&nologo=true',
    fonts: ['Courier New', 'Helvetica Bold', 'System Fonts', 'Monospace'],
    artists: ['وللفگانگ واینگارت', 'دیوید کارسون', 'گروه متال دیزاین'],
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Brutalist_architecture'
  },
  {
    id: '4',
    name: 'پاپ آرت (Pop Art)',
    category: 'مدرن',
    description: 'جنبشی که فرهنگ عامه، تبلیغات و کمیک‌ها را به هنر تبدیل کرد. رنگ‌های جیغ، تکرار و طنز از ویژگی‌های بارز آن است.',
    features: ['رنگ‌های اشباع و نئونی', 'المان‌های کمیک بوک و ترام', 'تکرار الگو (Pattern)', 'خطوط دور مشکی ضخیم'],
    usage: ['پوستر تبلیغاتی', 'بسته‌بندی فست‌فود', 'طراحی تیشرت و لباس'],
    avoid: ['برندهای لوکس و خیلی رسمی', 'خدمات سوگواری'],
    colors: ['#FF007F', '#FFFF00', '#00FFFF', '#000000'],
    imageUrl: 'https://image.pollinations.ai/prompt/pop%20art%20illustration%20comic%20book%20style%20dots%20halftone%20bright%20yellow%20pink%20speech%20bubble?width=600&height=400&nologo=true',
    fonts: ['Comic Sans', 'Cooper Black', 'Bangers', 'Bold Sans'],
    artists: ['اندی وارهول', 'روی لیختن‌اشتاین', 'کیت هرینگ'],
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Pop_art'
  },
  {
    id: '5',
    name: 'آرت دکو (Art Deco)',
    category: 'کلاسیک مدرن',
    description: 'سبکی لوکس و هندسی که در دهه ۱۹۲۰ ظهور کرد. نماد تجمل، زرق و برق و پیشرفت صنعتی است.',
    features: ['اشکال هندسی متقارن', 'خطوط زیگزاگ و پله‌ای', 'استفاده از رنگ‌های طلایی و متالیک', 'کنتراست بالا و شارپ'],
    usage: ['هتل‌های لوکس', 'پوسترهای سینمایی کلاسیک', 'بسته‌بندی عطر و جواهرات'],
    avoid: ['طرح‌های ارگانیک و نامنظم', 'تکنولوژی‌های خیلی پیشرفته'],
    colors: ['#FFD700', '#000000', '#C0C0C0', '#003366'],
    imageUrl: 'https://image.pollinations.ai/prompt/art%20deco%20pattern%20gold%20black%20geometric%20gatsby%20style%20luxury%20graphic?width=600&height=400&nologo=true',
    fonts: ['Broadway', 'Bifur', 'Parisian', 'Geometric Sans'],
    artists: ['تامارا د لمپیکا', 'کاساندر (A.M. Cassandre)', 'ارته'],
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Art_Deco'
  },
  {
    id: '6',
    name: 'آرت نوو (Art Nouveau)',
    category: 'کلاسیک',
    description: 'سبکی الهام‌گرفته از خطوط منحنی طبیعت، گل‌ها و گیاهان که در اواخر قرن ۱۹ محبوب بود و بر خطوط سیال تاکید دارد.',
    features: ['خطوط شلاقی و منحنی', 'الگوهای گل و گیاه پیچیده', 'عدم تقارن', 'رنگ‌های ملایم و خاکی'],
    usage: ['منوی کافه و رستوران', 'پوستر تئاتر و موسیقی', 'بسته‌بندی محصولات ارگانیک'],
    avoid: ['صنایع سنگین', 'تکنولوژی دیجیتال و سایبری'],
    colors: ['#8FBC8F', '#DAA520', '#CD853F', '#E9967A'],
    imageUrl: 'https://image.pollinations.ai/prompt/art%20nouveau%20mucha%20style%20illustration%20elegant%20woman%20flowers%20intricate%20curves?width=600&height=400&nologo=true',
    fonts: ['Arnold Böcklin', 'Eckmann', 'Decorative Script'],
    artists: ['آلفونس موخا', 'گوستاو کلیمت', 'هکتور گیما'],
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Art_Nouveau'
  },
  {
    id: '7',
    name: 'سوررئالیسم (Surrealism)',
    category: 'آوانگارد',
    description: 'تلفیق واقعیت و رویا برای خلق تصاویری عجیب و غیرمنطقی که ناخودآگاه را هدف می‌گیرد.',
    features: ['ترکیب‌های غیرممکن اشیاء', 'المان‌های رویایی و ابری', 'تغییر مقیاس عجیب اشیا', 'فضاهای مرموز و بی‌انتها'],
    usage: ['کاور آلبوم موسیقی', 'تبلیغات خلاقانه و مفهومی', 'کتاب‌های داستانی و فلسفی'],
    avoid: ['اطلاع‌رسانی رسمی و اداری', 'نقشه‌های راهنما'],
    colors: ['#483D8B', '#FF4500', '#2F4F4F', '#800080'],
    imageUrl: 'https://image.pollinations.ai/prompt/surrealist%20painting%20melting%20clock%20clouds%20eye%20in%20sky%20dreamscape%20dali%20style?width=600&height=400&nologo=true',
    fonts: ['Handwritten', 'Distorted Serif', 'Classic Serif'],
    artists: ['سالوادور دالی', 'رنه ماگریت', 'من ری'],
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Surrealism'
  },
  {
    id: '8',
    name: 'دادائیسم (Dadaism)',
    category: 'آوانگارد',
    description: 'جنبشی ضد هنر که با کلاژهای بی‌معنی، طنز و هرج‌ومرج به جنگ استانداردهای مرسوم زیبایی رفت.',
    features: ['کلاژهای نامرتب و پاره', 'تایپوگرافی بریده شده روزنامه‌ای', 'ترکیب عکس و متن تصادفی', 'بی‌نظمی عمدی'],
    usage: ['زین‌ها (Zines)', 'پوسترهای اعتراضی', 'گالری‌های هنری خاص', 'طراحی جلد پانک'],
    avoid: ['طراحی شرکتی تمیز', 'بانک و بیمه'],
    colors: ['#000000', '#FFFFFF', '#FF0000', '#A9A9A9'],
    imageUrl: 'https://image.pollinations.ai/prompt/dadaism%20collage%20art%20cut%20newspaper%20ransom%20note%20style%20black%20red%20white%20chaos?width=600&height=400&nologo=true',
    fonts: ['Typewriter', 'Cutout Fonts', 'Mixed Typography'],
    artists: ['مارسل دوشان', 'هانا هوش', 'رائول هاسمن'],
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Dada'
  },
];

export const ArtStyleLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle | null>(null);

  const filteredStyles = ART_STYLES.filter(style => 
    style.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    style.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to generate moodboard URLs based on style data
  const getMoodboardImages = (style: ArtStyle) => {
    const base = 'https://image.pollinations.ai/prompt';
    const params = 'width=300&height=300&nologo=true';
    const features = style.features.join(' ');
    const colors = style.colors.join(' ');
    
    return [
      {
        id: 'pattern',
        label: 'بافت و الگو',
        url: `${base}/${encodeURIComponent(style.name + ' style seamless pattern background texture ' + colors)}?${params}`
      },
      {
        id: 'typography',
        label: 'تایپوگرافی',
        url: `${base}/${encodeURIComponent(style.name + ' style typography poster graphic design text layout ' + features)}?${params}`
      },
      {
        id: 'usage',
        label: 'نمونه کاربردی',
        url: `${base}/${encodeURIComponent(style.name + ' style ' + (style.usage[0] || 'object') + ' product design masterpiece high quality')}?${params}`
      },
      {
        id: 'abstract',
        label: 'ترکیب‌بندی',
        url: `${base}/${encodeURIComponent('abstract artistic composition in style of ' + style.name + ' ' + colors + ' 8k resolution')}?${params}`
      }
    ];
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-textMain">دایرةالمعارف سبک‌ها</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="جستجو در سبک‌ها..."
              className="w-full pl-4 pr-10 py-2 rounded-xl border border-borderLight focus:border-primary outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-textLight" />
          </div>
          <button className="p-2 bg-white border border-borderLight rounded-xl hover:bg-gray-50">
            <Filter className="w-5 h-5 text-textMain" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
        {filteredStyles.map(style => (
          <div 
            key={style.id}
            onClick={() => setSelectedStyle(style)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-borderLight hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full"
          >
            <div className="h-48 overflow-hidden relative bg-gray-100">
              <img src={style.imageUrl} alt={style.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm text-textMain">
                {style.category}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-textMain mb-2">{style.name}</h3>
              <p className="text-textLight text-sm line-clamp-3 mb-4 flex-1">{style.description}</p>
              <div className="flex gap-2 mt-auto">
                {style.colors.slice(0, 4).map((c, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border border-gray-100 shadow-sm" style={{backgroundColor: c}}></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedStyle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn custom-scrollbar">
            <div className="relative h-64 md:h-80">
              <img src={selectedStyle.imageUrl} className="w-full h-full object-cover" alt={selectedStyle.name} />
              <button 
                onClick={() => setSelectedStyle(null)}
                className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors shadow-sm"
              >
                <X className="w-6 h-6 text-textMain" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{selectedStyle.name}</h2>
                <span className="bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-md text-sm border border-white/30">{selectedStyle.category}</span>
              </div>
            </div>
            
            <div className="p-6 md:p-8 space-y-8">
              <p className="text-lg text-textMain leading-loose border-b border-borderLight pb-6">
                {selectedStyle.description}
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                      <PaletteIcon className="w-5 h-5" /> ویژگی‌های بصری
                    </h4>
                    <ul className="space-y-2">
                      {selectedStyle.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-textMain text-sm">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                     <h4 className="font-bold text-green-600 mb-3 flex items-center gap-2">
                       <Check className="w-5 h-5" /> کاربردهای مناسب
                     </h4>
                    <ul className="space-y-2">
                      {selectedStyle.usage.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-textMain text-sm">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                   <div>
                    <h4 className="font-bold text-textMain mb-3 flex items-center gap-2">
                      <Type className="w-5 h-5" /> فونت‌های رایج
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStyle.fonts.map((f, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 text-textMain rounded-lg text-sm border border-gray-200">{f}</span>
                      ))}
                    </div>
                  </div>

                   <div>
                    <h4 className="font-bold text-textMain mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" /> هنرمندان برجسته
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStyle.artists.map((a, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">{a}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-textMain mb-3">پالت رنگی</h4>
                    <div className="flex gap-4 flex-wrap">
                      {selectedStyle.colors.map((c, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 group relative">
                          <div className="w-12 h-12 rounded-full shadow-md border border-gray-100 cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: c }}></div>
                          <span className="text-[10px] font-mono text-textLight opacity-0 group-hover:opacity-100 absolute -bottom-4 transition-opacity bg-black text-white px-1 rounded z-20">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* MOODBOARD SECTION */}
              <div className="pt-8 border-t border-borderLight">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-bold text-xl text-textMain flex items-center gap-2">
                    <LayoutDashboard className="w-6 h-6 text-purple-600" />
                    مودبرد هوشمند (Moodboard)
                  </h4>
                  <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-xs font-bold">تولید شده با هوش مصنوعی</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getMoodboardImages(selectedStyle).map((img, idx) => (
                    <div key={idx} className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-borderLight bg-gray-50 h-48">
                      <img 
                        src={img.url} 
                        alt={img.label} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        loading="lazy"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 opacity-100 transition-opacity">
                        <span className="text-white text-xs font-medium">{img.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-borderLight flex justify-end">
                <a 
                  href={selectedStyle.learnMoreUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 text-primary hover:text-primaryDark transition-colors font-medium bg-primary/10 px-4 py-2 rounded-xl"
                >
                  مطالعه بیشتر درباره این سبک
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// Helper component for icon
const Check = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
);
