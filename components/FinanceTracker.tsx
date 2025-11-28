
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './Button';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Download, 
  Plus, 
  Trash2, 
  Calendar, 
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  X
} from 'lucide-react';
import { Transaction } from '../types';

const YEARS = Array.from({ length: 11 }, (_, i) => (1400 + i).toString()); // 1400 to 1410

export const FinanceTracker: React.FC = () => {
  // --- State ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('finance_transactions');
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [currentYear, setCurrentYear] = useState('1403');
  const [currentMonth, setCurrentMonth] = useState('02'); // Simple string based month filtering

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('income');
  const [newDate, setNewDate] = useState(`${currentYear}/${currentMonth}/01`);
  const [newCategory, setNewCategory] = useState('');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Update default date when year/month changes, only if not editing
  useEffect(() => {
    if (!editingId) {
      setNewDate(`${currentYear}/${currentMonth}/01`);
    }
  }, [currentYear, currentMonth, editingId]);

  // --- Computed Data ---
  
  // Filter transactions by selected Month/Year
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(`${currentYear}/${currentMonth}`));
  }, [transactions, currentYear, currentMonth]);

  // Totals for current month
  const monthIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthExpense = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthBalance = monthIncome - monthExpense;

  // Chart Data: Yearly Overview
  const yearlyData = useMemo(() => {
    const data = Array(12).fill(0).map(() => ({ income: 0, expense: 0 }));
    transactions.filter(t => t.date.startsWith(currentYear)).forEach(t => {
      // Assuming date format YYYY/MM/DD
      const monthPart = t.date.split('/')[1];
      const monthIndex = parseInt(monthPart) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        if (t.type === 'income') data[monthIndex].income += t.amount;
        else data[monthIndex].expense += t.amount;
      }
    });
    return data;
  }, [transactions, currentYear]);

  const maxChartValue = Math.max(
    ...yearlyData.map(d => Math.max(d.income, d.expense)),
    1000 // prevent division by zero
  );

  // --- Handlers ---

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmount || !newDate) return;

    const amount = parseInt(newAmount.replace(/,/g, ''));
    if (isNaN(amount)) return;

    if (editingId) {
      // Edit Mode
      setTransactions(prev => prev.map(t => t.id === editingId ? {
        ...t,
        title: newTitle,
        amount,
        type: newType,
        date: newDate,
        category: newCategory || (newType === 'income' ? 'پروژه' : 'سایر')
      } : t));
      
      setEditingId(null);
      setNewTitle('');
      setNewAmount('');
      setNewCategory('');
      // Reset date to current view defaults
      setNewDate(`${currentYear}/${currentMonth}/01`);

    } else {
      // Create Mode
      const newTx: Transaction = {
        id: Date.now().toString(),
        title: newTitle,
        amount,
        type: newType,
        date: newDate,
        category: newCategory || (newType === 'income' ? 'پروژه' : 'سایر')
      };
      setTransactions(prev => [newTx, ...prev]);
      
      // Reset inputs
      setNewTitle('');
      setNewAmount('');
      setNewCategory('');
    }
  };

  const startEdit = (t: Transaction) => {
    setEditingId(t.id);
    setNewTitle(t.title);
    setNewAmount(t.amount.toString());
    setNewType(t.type);
    setNewDate(t.date);
    setNewCategory(t.category);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewTitle('');
    setNewAmount('');
    setNewCategory('');
    setNewType('income');
    setNewDate(`${currentYear}/${currentMonth}/01`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('آیا از حذف این تراکنش اطمینان دارید؟')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      if (editingId === id) {
        cancelEdit();
      }
    }
  };

  const exportCSV = () => {
    const headers = ['عنوان', 'مبلغ (تومان)', 'نوع', 'تاریخ', 'دسته‌بندی'];
    const rows = monthlyTransactions.map(t => [
      t.title,
      t.amount,
      t.type === 'income' ? 'درآمد' : 'هزینه',
      t.date,
      t.category
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    // Add BOM for Excel Persian support
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Finance_${currentYear}_${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for formatting numbers
  const formatNumber = (num: number) => num.toLocaleString('fa-IR');

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-textMain mb-1 flex items-center gap-2">
            <Wallet className="w-8 h-8 text-primary" />
            امور مالی
          </h2>
          <p className="text-textLight">مدیریت درآمد پروژه‌ها و هزینه‌های یادگیری</p>
        </div>

        <div className="flex gap-2 items-center bg-white p-2 rounded-xl border border-borderLight shadow-sm">
           <Calendar className="w-5 h-5 text-textLight" />
           <select 
             value={currentYear} 
             onChange={(e) => setCurrentYear(e.target.value)}
             className="bg-transparent font-bold outline-none text-textMain"
           >
             {YEARS.map(y => (
               <option key={y} value={y}>{y}</option>
             ))}
           </select>
           <span className="text-gray-300">|</span>
           <select 
             value={currentMonth} 
             onChange={(e) => setCurrentMonth(e.target.value)}
             className="bg-transparent font-bold outline-none text-textMain"
           >
             {['01','02','03','04','05','06','07','08','09','10','11','12'].map((m, i) => (
                <option key={m} value={m}>{['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'][i]}</option>
             ))}
           </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         {/* Income Card */}
         <div className="bg-white p-6 rounded-2xl border border-borderLight shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
               <div className="flex items-center gap-2 text-green-600 mb-2">
                 <div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
                 <span className="font-bold text-sm">مجموع درآمد ماه</span>
               </div>
               <h3 className="text-3xl font-bold text-textMain mt-2">{formatNumber(monthIncome)} <span className="text-sm font-normal text-textLight">تومان</span></h3>
            </div>
         </div>

         {/* Expense Card */}
         <div className="bg-white p-6 rounded-2xl border border-borderLight shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
               <div className="flex items-center gap-2 text-red-500 mb-2">
                 <div className="p-2 bg-red-100 rounded-lg"><TrendingDown className="w-5 h-5" /></div>
                 <span className="font-bold text-sm">مجموع هزینه ماه</span>
               </div>
               <h3 className="text-3xl font-bold text-textMain mt-2">{formatNumber(monthExpense)} <span className="text-sm font-normal text-textLight">تومان</span></h3>
            </div>
         </div>

         {/* Net Balance Card */}
         <div className="bg-white p-6 rounded-2xl border border-borderLight shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 ${monthBalance >= 0 ? 'bg-primary/10' : 'bg-orange-50'}`}></div>
            <div className="relative z-10">
               <div className="flex items-center gap-2 text-textMain mb-2">
                 <div className="p-2 bg-gray-100 rounded-lg"><Wallet className="w-5 h-5" /></div>
                 <span className="font-bold text-sm">تراز مالی ماه</span>
               </div>
               <h3 className={`text-3xl font-bold mt-2 ${monthBalance >= 0 ? 'text-primary' : 'text-orange-500'}`}>
                 {formatNumber(monthBalance)} <span className="text-sm font-normal text-textLight">تومان</span>
               </h3>
            </div>
         </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left Col: Form & Chart */}
        <div className="lg:col-span-1 space-y-8">
           
           {/* Add/Edit Transaction Form */}
           <div className={`p-6 rounded-2xl border shadow-sm transition-all ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-white border-borderLight'}`}>
              <h3 className="font-bold text-textMain mb-4 flex items-center justify-between">
                 <span className="flex items-center gap-2">
                   {editingId ? <Edit2 className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-primary" />} 
                   {editingId ? 'ویرایش تراکنش' : 'ثبت تراکنش جدید'}
                 </span>
                 {editingId && (
                   <button onClick={cancelEdit} className="text-textLight hover:text-red-500"><X className="w-5 h-5" /></button>
                 )}
              </h3>
              <form onSubmit={handleSaveTransaction} className="space-y-4">
                 <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-4">
                    <button 
                      type="button" 
                      onClick={() => setNewType('income')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newType === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-textLight hover:text-textMain'}`}
                    >
                      درآمد (پروژه)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setNewType('expense')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newType === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-textLight hover:text-textMain'}`}
                    >
                      هزینه (آموزش)
                    </button>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-textLight mb-1 block">عنوان</label>
                    <input 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder={newType === 'income' ? 'مثال: طراحی لوگو شرکت X' : 'مثال: خرید دوره یودمی'}
                      className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none text-sm bg-white"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-textLight mb-1 block">مبلغ (تومان)</label>
                      <input 
                        type="number"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        placeholder="0"
                        className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none text-sm dir-ltr text-left bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-textLight mb-1 block">تاریخ</label>
                      <input 
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        placeholder={`${currentYear}/${currentMonth}/01`}
                        className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none text-sm dir-ltr text-center font-mono bg-white"
                      />
                    </div>
                 </div>
                 
                 <div>
                    <label className="text-xs font-bold text-textLight mb-1 block">دسته‌بندی (اختیاری)</label>
                    <input 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder={newType === 'income' ? 'پروژه، مشاوره...' : 'آموزش، ابزار، اشتراک...'}
                      className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none text-sm bg-white"
                    />
                 </div>

                 <Button type="submit" className="w-full mt-2" variant={editingId ? 'primary' : 'primary'}>
                   {editingId ? 'بروزرسانی تراکنش' : 'ثبت تراکنش'}
                 </Button>
                 {editingId && <Button type="button" onClick={cancelEdit} variant="secondary" className="w-full">انصراف</Button>}
              </form>
           </div>

           {/* Annual Chart */}
           <div className="bg-white p-6 rounded-2xl border border-borderLight shadow-sm">
              <h3 className="font-bold text-textMain mb-6 flex items-center gap-2">
                 <PieChart className="w-5 h-5 text-primary" /> نمودار سالیانه {currentYear}
              </h3>
              
              <div className="h-48 flex items-end justify-between gap-1 md:gap-2 px-2">
                 {yearlyData.map((data, index) => (
                   <div key={index} className="flex-1 flex flex-col justify-end gap-1 h-full group relative">
                      {/* Tooltip */}
                      {(data.income > 0 || data.expense > 0) && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 w-24 text-center pointer-events-none">
                          <div className="text-green-300">+{formatNumber(data.income)}</div>
                          <div className="text-red-300">-{formatNumber(data.expense)}</div>
                          <div className="border-t border-gray-600 mt-1 pt-1 font-bold">{['فر', 'ارد', 'خر', 'تیر', 'مر', 'شهر', 'مهر', 'آبا', 'آذر', 'دی', 'بهم', 'اسف'][index]}</div>
                        </div>
                      )}

                      {/* Income Bar */}
                      <div 
                        className="w-full bg-green-400 rounded-t-sm opacity-80 hover:opacity-100 transition-all relative min-h-[1px]"
                        style={{ height: `${data.income > 0 ? Math.max((data.income / maxChartValue) * 70, 4) : 0}%` }}
                      ></div>
                      {/* Expense Bar */}
                      <div 
                        className="w-full bg-red-400 rounded-b-sm opacity-80 hover:opacity-100 transition-all relative min-h-[1px]"
                        style={{ height: `${data.expense > 0 ? Math.max((data.expense / maxChartValue) * 70, 4) : 0}%` }}
                      ></div>
                   </div>
                 ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-textLight px-1">
                 {['فر', 'ارد', 'خر', 'تیر', 'مر', 'شهر', 'مهر', 'آبا', 'آذر', 'دی', 'بهم', 'اسف'].map(m => (
                   <span key={m} className="flex-1 text-center">{m}</span>
                 ))}
              </div>
              <div className="flex justify-center gap-4 mt-4 text-xs">
                 <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded-sm"></div> درآمد</div>
                 <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded-sm"></div> هزینه</div>
              </div>
           </div>
        </div>

        {/* Right Col: Transaction List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-borderLight shadow-sm flex flex-col">
           <div className="p-6 border-b border-borderLight flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="font-bold text-textMain">لیست تراکنش‌های ماه</h3>
              <Button onClick={exportCSV} variant="outline" className="text-xs h-9 px-3" icon={<Download className="w-3 h-3"/>}>
                خروجی اکسل (CSV)
              </Button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-2">
              <table className="w-full text-sm">
                <thead className="text-xs text-textLight border-b border-borderLight">
                   <tr>
                      <th className="text-right p-3 font-medium">عنوان</th>
                      <th className="text-center p-3 font-medium">دسته‌بندی</th>
                      <th className="text-center p-3 font-medium">تاریخ</th>
                      <th className="text-left p-3 font-medium">مبلغ</th>
                      <th className="w-20 text-center">عملیات</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-borderLight">
                   {monthlyTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-textLight">
                           تراکنشی برای این ماه ثبت نشده است.
                        </td>
                      </tr>
                   ) : (
                      monthlyTransactions.sort((a,b) => b.id.localeCompare(a.id)).map(t => (
                        <tr key={t.id} className={`transition-colors group ${editingId === t.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                           <td className="p-3 text-textMain font-medium flex items-center gap-2">
                             <div className={`p-1.5 rounded-lg ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {t.type === 'income' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                             </div>
                             {t.title}
                           </td>
                           <td className="p-3 text-center text-textLight">
                             <span className="bg-gray-100 px-2 py-1 rounded text-xs">{t.category}</span>
                           </td>
                           <td className="p-3 text-center text-textLight font-mono text-xs">{t.date}</td>
                           <td className={`p-3 text-left font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                              {t.type === 'income' ? '+' : '-'}{formatNumber(t.amount)}
                           </td>
                           <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button 
                                  onClick={() => startEdit(t)}
                                  className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="ویرایش"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(t.id)}
                                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="حذف"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                           </td>
                        </tr>
                      ))
                   )}
                </tbody>
              </table>
           </div>
        </div>

      </div>
    </div>
  );
};
