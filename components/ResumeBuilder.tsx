
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Eye, Edit3, Plus, Trash2, Save, Download, Mail, Phone, Globe, Briefcase, GraduationCap, Award } from 'lucide-react';
import { ResumeData, ResumeExperience, ResumeEducation } from '../types';

const INITIAL_DATA: ResumeData = {
  fullName: '',
  jobTitle: '',
  email: '',
  phone: '',
  website: '',
  about: '',
  skills: [],
  experiences: [],
  education: []
};

export const ResumeBuilder: React.FC = () => {
  // Lazy initialization for state
  const [data, setData] = useState<ResumeData>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('user_resume');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing resume", e);
            }
        }
    }
    return INITIAL_DATA;
  });

  const [isEditing, setIsEditing] = useState(true);
  const [newSkill, setNewSkill] = useState('');

  // Auto-Save Effect
  useEffect(() => {
    localStorage.setItem('user_resume', JSON.stringify(data));
  }, [data]);

  const handleDeleteAll = () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید کل اطلاعات رزومه را پاک کنید؟')) {
      setData(INITIAL_DATA);
    }
  };

  // --- Handlers ---

  const handleInputChange = (field: keyof ResumeData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // Experience Handlers
  const addExperience = () => {
    const newExp: ResumeExperience = {
      id: Date.now().toString(),
      role: '',
      company: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    setData(prev => ({ ...prev, experiences: [newExp, ...prev.experiences] }));
  };

  const updateExperience = (id: string, field: keyof ResumeExperience, value: string) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({ ...prev, experiences: prev.experiences.filter(e => e.id !== id) }));
  };

  // Education Handlers
  const addEducation = () => {
    const newEdu: ResumeEducation = {
      id: Date.now().toString(),
      degree: '',
      school: '',
      year: ''
    };
    setData(prev => ({ ...prev, education: [newEdu, ...prev.education] }));
  };

  const updateEducation = (id: string, field: keyof ResumeEducation, value: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  // Skill Handlers
  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !data.skills.includes(newSkill.trim())) {
      setData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  // --- Render ---

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-textMain mb-1">رزومه‌ساز</h2>
          <p className="text-textLight">اطلاعات خود را وارد کنید و یک رزومه استاندارد تحویل بگیرید.</p>
        </div>
        
        <div className="flex gap-2">
           <Button 
             variant={isEditing ? 'primary' : 'outline'} 
             onClick={() => setIsEditing(true)}
             icon={<Edit3 className="w-4 h-4" />}
           >
             ویرایش
           </Button>
           <Button 
             variant={!isEditing ? 'primary' : 'outline'} 
             onClick={() => setIsEditing(false)}
             icon={<Eye className="w-4 h-4" />}
           >
             مشاهده
           </Button>
           {isEditing && (
             <>
                <button 
                  onClick={handleDeleteAll}
                  className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl border border-red-200 transition-colors"
                  title="حذف کل اطلاعات"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
             </>
           )}
        </div>
      </div>

      {isEditing ? (
        // --- EDIT MODE ---
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-20">
          
          {/* Personal Info */}
          <section className="bg-white p-6 rounded-2xl border border-borderLight shadow-sm">
             <h3 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
               <span className="w-1 h-6 bg-primary rounded-full"></span>
               اطلاعات فردی
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                 <label className="block text-sm font-bold text-textMain mb-2">نام و نام خانوادگی</label>
                 <input 
                   value={data.fullName}
                   onChange={(e) => handleInputChange('fullName', e.target.value)}
                   className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none"
                   placeholder="مثال: علی محمدی"
                 />
               </div>
               <div>
                 <label className="block text-sm font-bold text-textMain mb-2">عنوان شغلی</label>
                 <input 
                   value={data.jobTitle}
                   onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                   className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none"
                   placeholder="مثال: طراح گرافیک ارشد"
                 />
               </div>
               <div>
                 <label className="block text-sm font-bold text-textMain mb-2">ایمیل</label>
                 <input 
                   value={data.email}
                   onChange={(e) => handleInputChange('email', e.target.value)}
                   className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none dir-ltr text-left"
                   placeholder="email@example.com"
                 />
               </div>
               <div>
                 <label className="block text-sm font-bold text-textMain mb-2">شماره تماس</label>
                 <input 
                   value={data.phone}
                   onChange={(e) => handleInputChange('phone', e.target.value)}
                   className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none dir-ltr text-left"
                   placeholder="0912..."
                 />
               </div>
               <div className="md:col-span-2">
                 <label className="block text-sm font-bold text-textMain mb-2">وبسایت / لینکدین</label>
                 <input 
                   value={data.website}
                   onChange={(e) => handleInputChange('website', e.target.value)}
                   className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none dir-ltr text-left"
                   placeholder="www.portfolio.com"
                 />
               </div>
               <div className="md:col-span-2">
                 <label className="block text-sm font-bold text-textMain mb-2">درباره من</label>
                 <textarea 
                   value={data.about}
                   onChange={(e) => handleInputChange('about', e.target.value)}
                   className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none h-24 resize-none"
                   placeholder="توضیح کوتاهی درباره خودتان و اهداف شغلی..."
                 />
               </div>
             </div>
          </section>

          {/* Experience */}
          <section className="bg-white p-6 rounded-2xl border border-borderLight shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-textMain flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    سوابق شغلی
                </h3>
                <Button onClick={addExperience} variant="secondary" icon={<Plus className="w-4 h-4"/>}>افزودن</Button>
            </div>
            
            <div className="space-y-6">
               {data.experiences.map((exp) => (
                 <div key={exp.id} className="p-4 bg-gray-50 rounded-xl border border-borderLight relative group">
                    <button 
                      onClick={() => removeExperience(exp.id)}
                      className="absolute top-2 left-2 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8 md:pr-0">
                        <div>
                            <input 
                                value={exp.role}
                                onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                                placeholder="نقش (مثال: طراح UI)"
                                className="w-full p-2 bg-white rounded-lg border border-borderLight focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <input 
                                value={exp.company}
                                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                placeholder="نام شرکت"
                                className="w-full p-2 bg-white rounded-lg border border-borderLight focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <input 
                                value={exp.startDate}
                                onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                placeholder="تاریخ شروع"
                                className="w-full p-2 bg-white rounded-lg border border-borderLight focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <input 
                                value={exp.endDate}
                                onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                placeholder="تاریخ پایان"
                                className="w-full p-2 bg-white rounded-lg border border-borderLight focus:border-primary outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <textarea 
                                value={exp.description}
                                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                placeholder="شرح وظایف و دستاوردها..."
                                className="w-full p-2 bg-white rounded-lg border border-borderLight focus:border-primary outline-none h-20 resize-none"
                            />
                        </div>
                    </div>
                 </div>
               ))}
               {data.experiences.length === 0 && (
                   <div className="text-center text-textLight py-4 bg-gray-50 rounded-xl border border-dashed border-borderLight">سابقه‌ای ثبت نشده است.</div>
               )}
            </div>
          </section>

          {/* Education */}
          <section className="bg-white p-6 rounded-2xl border border-borderLight shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-textMain flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    تحصیلات
                </h3>
                <Button onClick={addEducation} variant="secondary" icon={<Plus className="w-4 h-4"/>}>افزودن</Button>
            </div>
            
            <div className="space-y-4">
               {data.education.map((edu) => (
                 <div key={edu.id} className="p-4 bg-gray-50 rounded-xl border border-borderLight relative flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <button 
                      onClick={() => removeEducation(edu.id)}
                      className="absolute top-2 left-2 md:static p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors order-first md:order-last"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input 
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            placeholder="مدرک (مثال: کارشناسی)"
                            className="w-full p-2 bg-white rounded-lg border border-borderLight focus:border-primary outline-none"
                        />
                        <input 
                            value={edu.school}
                            onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                            placeholder="نام دانشگاه / موسسه"
                            className="w-full p-2 bg-white rounded-lg border border-borderLight focus:border-primary outline-none"
                        />
                         <input 
                            value={edu.year}
                            onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                            placeholder="سال فارغ‌التحصیلی"
                            className="w-full p-2 bg-white rounded-lg border border-borderLight focus:border-primary outline-none"
                        />
                    </div>
                 </div>
               ))}
                {data.education.length === 0 && (
                   <div className="text-center text-textLight py-4 bg-gray-50 rounded-xl border border-dashed border-borderLight">تحصیلات ثبت نشده است.</div>
               )}
            </div>
          </section>

          {/* Skills */}
          <section className="bg-white p-6 rounded-2xl border border-borderLight shadow-sm">
             <h3 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
               <span className="w-1 h-6 bg-primary rounded-full"></span>
               مهارت‌ها
             </h3>
             
             <form onSubmit={addSkill} className="flex gap-2 mb-4">
               <input 
                 value={newSkill}
                 onChange={(e) => setNewSkill(e.target.value)}
                 className="flex-1 p-3 rounded-xl border border-borderLight focus:border-primary outline-none"
                 placeholder="مهارت جدید را تایپ کنید و اینتر بزنید..."
               />
               <Button type="submit" disabled={!newSkill.trim()}>افزودن</Button>
             </form>

             <div className="flex flex-wrap gap-2">
               {data.skills.map((skill, index) => (
                 <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20">
                   <span>{skill}</span>
                   <button onClick={() => removeSkill(skill)} className="hover:text-primaryDark"><Trash2 className="w-3 h-3" /></button>
                 </div>
               ))}
               {data.skills.length === 0 && <span className="text-textLight text-sm">مهارتی اضافه نشده است.</span>}
             </div>
          </section>

        </div>
      ) : (
        // --- PREVIEW MODE ---
        <div className="max-w-[210mm] mx-auto bg-white shadow-2xl min-h-[297mm] p-10 md:p-16 animate-fadeIn text-textMain relative print:shadow-none print:w-full">
           
           {/* Print Button (Only visible in screen) */}
           <div className="absolute top-4 left-4 print:hidden">
              <Button onClick={() => window.print()} variant="secondary" icon={<Download className="w-4 h-4"/>}>پرینت / PDF</Button>
           </div>

           {/* Header */}
           <div className="border-b-2 border-primary pb-8 mb-8 flex flex-col items-center text-center">
              <h1 className="text-4xl font-bold mb-2 text-gray-800">{data.fullName || 'نام شما'}</h1>
              <p className="text-xl text-primary font-medium mb-4">{data.jobTitle || 'عنوان شغلی'}</p>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dir-ltr">
                {data.phone && (
                  <div className="flex items-center gap-1">
                     <span>{data.phone}</span>
                     <Phone className="w-4 h-4" />
                  </div>
                )}
                {data.email && (
                  <div className="flex items-center gap-1">
                     <span>{data.email}</span>
                     <Mail className="w-4 h-4" />
                  </div>
                )}
                 {data.website && (
                  <div className="flex items-center gap-1">
                     <a href={`https://${data.website}`} className="hover:underline">{data.website}</a>
                     <Globe className="w-4 h-4" />
                  </div>
                )}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Sidebar Column */}
              <div className="md:col-span-1 space-y-8">
                 
                 {/* About */}
                 {data.about && (
                   <div>
                     <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-3">درباره من</h3>
                     <p className="text-sm text-gray-600 leading-relaxed text-justify">
                       {data.about}
                     </p>
                   </div>
                 )}

                 {/* Skills */}
                 {data.skills.length > 0 && (
                   <div>
                      <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" />
                        مهارت‌ها
                      </h3>
                      <div className="flex flex-wrap gap-2">
                         {data.skills.map((s, i) => (
                           <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">{s}</span>
                         ))}
                      </div>
                   </div>
                 )}

                 {/* Education */}
                 {data.education.length > 0 && (
                   <div>
                      <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-3 flex items-center gap-2">
                         <GraduationCap className="w-4 h-4 text-primary" />
                         تحصیلات
                      </h3>
                      <div className="space-y-4">
                        {data.education.map(edu => (
                          <div key={edu.id}>
                             <div className="font-bold text-sm">{edu.degree}</div>
                             <div className="text-xs text-gray-600">{edu.school}</div>
                             <div className="text-xs text-gray-400 mt-1">{edu.year}</div>
                          </div>
                        ))}
                      </div>
                   </div>
                 )}
              </div>

              {/* Main Column */}
              <div className="md:col-span-2">
                 {data.experiences.length > 0 && (
                   <div>
                      <h3 className="font-bold text-xl text-gray-800 border-b-2 border-gray-100 pb-2 mb-6 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        سوابق شغلی
                      </h3>
                      
                      <div className="space-y-6">
                        {data.experiences.map(exp => (
                          <div key={exp.id} className="relative pl-4 border-r-2 border-gray-100 mr-1 pr-4">
                             <div className="absolute -right-[9px] top-1 w-4 h-4 bg-primary rounded-full border-4 border-white"></div>
                             
                             <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-lg text-gray-800">{exp.role}</h4>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                             </div>
                             
                             <div className="text-primary font-medium text-sm mb-3">{exp.company}</div>
                             <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                               {exp.description}
                             </p>
                          </div>
                        ))}
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
