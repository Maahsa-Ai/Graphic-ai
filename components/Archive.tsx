

import React, { useState, useRef, useEffect } from 'react';
import { Folder as FolderIcon, FileImage, Upload, Clock, Edit2, ChevronLeft, Trash2, Home, StickyNote, CheckSquare, Link as LinkIcon, LayoutDashboard, Plus, X, AlertTriangle, FileText, FileArchive, File, DownloadCloud, LayoutList, LayoutGrid, GripVertical, Info, MoreHorizontal, Maximize2, Pin, Calendar, Zap, Paperclip, Printer, Tag } from 'lucide-react';
import { FileItem, Folder, Note, Task, LinkItem, Moodboard, MoodboardImage, Brief, BriefReference } from '../types';
import { Button } from './Button';
import { generateTagsForFile, generateBriefAssist } from '../services/geminiService';

const MOCK_FOLDERS: Folder[] = [
  { id: '1', name: 'پروژه‌های لوگو', color: '#FFD700', parentId: null },
  { id: '2', name: 'پست‌های اینستاگرام', color: '#E0B0FF', parentId: null },
  { id: '3', name: 'موکاپ‌ها', color: '#87CEEB', parentId: null },
  { id: '4', name: 'لایه باز', color: '#4ECDC4', parentId: '2' },
];

const MOCK_FILES: FileItem[] = [
  { id: 'f1', name: 'Logo_V1.ai', type: 'vector', size: '1.2 MB', tags: ['Minimal', 'Logo'], folderId: '1', uploadDate: '1403/01/10' },
  { id: 'f2', name: 'Banner_Spring.psd', type: 'raster', size: '45 MB', tags: ['Social', 'Spring'], folderId: '2', uploadDate: '1403/01/12' },
];

const PRESET_COLORS = [
  '#E0B0FF', // Lilac (Default)
  '#FFD700', // Gold
  '#87CEEB', // Sky Blue
  '#FF6B6B', // Soft Red
  '#4ECDC4', // Teal
  '#9B59B6', // Deep Purple
  '#F1C40F', // Yellow
  '#2ECC71', // Emerald
  '#3498DB', // Blue
  '#95A5A6', // Gray
];

interface HistoryItem {
  id: string | null;
  name: string;
  timestamp: number;
}

type TabType = 'files' | 'notes' | 'tasks' | 'links' | 'moodboards' | 'briefs';
type DeleteType = 'folder' | 'file' | 'note' | 'task' | 'link' | 'moodboard' | 'brief';
type ViewMode = 'grid' | 'list';

// Helper for local storage
const useStickyState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    if (typeof window !== 'undefined') {
      const stickyValue = localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    }
    return defaultValue;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error("LocalStorage full or error", e);
        // Fallback or alert could go here
      }
    }
  }, [key, value]);

  return [value, setValue];
};

export const Archive: React.FC = () => {
  const [currentFolderId, setCurrentFolderId] = useStickyState<string | null>('archive_current_folder', null);
  const [activeTab, setActiveTab] = useState<TabType>('files');
  const [viewMode, setViewMode] = useStickyState<ViewMode>('archive_view_mode', 'grid');
  
  // Data States with Persistence
  const [files, setFiles] = useStickyState<FileItem[]>('archive_files', MOCK_FILES);
  const [folders, setFolders] = useStickyState<Folder[]>('archive_folders', MOCK_FOLDERS);
  const [notes, setNotes] = useStickyState<Note[]>('archive_notes', []);
  const [tasks, setTasks] = useStickyState<Task[]>('archive_tasks', []);
  const [links, setLinks] = useStickyState<LinkItem[]>('archive_links', []);
  const [moodboards, setMoodboards] = useStickyState<Moodboard[]>('archive_moodboards', []);
  const [briefs, setBriefs] = useStickyState<Brief[]>('archive_briefs', []);

  const [isDragging, setIsDragging] = useState(false);
  const [draggedFile, setDraggedFile] = useState<FileItem | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const moodboardFileInputRef = useRef<HTMLInputElement>(null);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Modal States
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isMoodboardModalOpen, setIsMoodboardModalOpen] = useState(false);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  
  // Image Preview State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Delete Confirmation State
  const [deleteData, setDeleteData] = useState<{ type: DeleteType, id: string, name?: string } | null>(null);
  
  // Form States
  const [editingId, setEditingId] = useState<string | null>(null);

  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState(PRESET_COLORS[0]);
  
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  
  const [newTaskText, setNewTaskText] = useState('');
  
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // Moodboard Form State
  const [moodboardTitle, setMoodboardTitle] = useState('');
  const [moodboardImages, setMoodboardImages] = useState<MoodboardImage[]>([]);

  // Brief Form State
  const [briefTitle, setBriefTitle] = useState('');
  const [briefClient, setBriefClient] = useState('');
  const [briefStartDate, setBriefStartDate] = useState('');
  const [briefDeadline, setBriefDeadline] = useState('');
  const [briefObjective, setBriefObjective] = useState('');
  const [briefAudience, setBriefAudience] = useState('');
  const [briefDeliverables, setBriefDeliverables] = useState('');
  const [briefPreferences, setBriefPreferences] = useState('');
  const [briefReferences, setBriefReferences] = useState<BriefReference[]>([]);
  const [briefTags, setBriefTags] = useState<string[]>([]);
  const [newBriefTag, setNewBriefTag] = useState('');
  const [briefAiLoading, setBriefAiLoading] = useState(false);
  const briefReferenceInputRef = useRef<HTMLInputElement>(null);

  // Helpers
  const currentFiles = files.filter(f => f.folderId === currentFolderId);
  const currentFolders = folders.filter(f => f.parentId === currentFolderId);
  const currentNotes = notes.filter(n => n.folderId === currentFolderId);
  const currentTasks = tasks.filter(t => t.folderId === currentFolderId);
  const currentLinks = links.filter(l => l.folderId === currentFolderId);
  const currentMoodboards = moodboards.filter(m => m.folderId === currentFolderId);
  const currentBriefs = briefs.filter(b => b.folderId === currentFolderId).sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));
  
  const getFolderById = (id: string | null) => folders.find(f => f.id === id);

  // Breadcrumb Logic
  const getBreadcrumbs = () => {
    const path: { id: string | null, name: string }[] = [];
    let currentId = currentFolderId;
    let safeGuard = 0;
    while (currentId && safeGuard < 20) {
      const folder = getFolderById(currentId);
      if (folder) {
        path.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentId;
      } else {
        break;
      }
      safeGuard++;
    }
    path.unshift({ id: null, name: 'آرشیو اصلی' });
    return path;
  };

  // Update History
  useEffect(() => {
    const folderName = currentFolderId 
      ? (getFolderById(currentFolderId)?.name || 'پوشه ناشناس') 
      : 'آرشیو اصلی';
      
    setHistory(prev => {
      if (prev.length > 0 && prev[0].id === currentFolderId) return prev;
      return [{ id: currentFolderId, name: folderName, timestamp: Date.now() }, ...prev].slice(0, 10);
    });
    
    // Reset tab when changing folder
    setActiveTab('files');
  }, [currentFolderId, folders]);

  // --- Action Handlers ---

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles && uploadedFiles.length > 0) {
      const file = uploadedFiles[0];
      
      // Check size (Limit to 500KB for LocalStorage safety in this demo)
      if (file.size > 500 * 1024) {
        alert("حجم فایل برای ذخیره در مرورگر زیاد است (محدودیت ۵۰۰ کیلوبایت). لطفاً فایل کوچکتری انتخاب کنید.");
        return;
      }

      const aiTags = await generateTagsForFile(file.name);

      try {
        const base64Content = await convertFileToBase64(file);

        let thumbnail = undefined;
        if (file.type.startsWith('image/')) {
            thumbnail = base64Content;
        }

        const newFile: FileItem = {
            id: Date.now().toString(),
            name: file.name,
            type: file.type || 'unknown',
            size: `${(file.size / 1024).toFixed(1)} KB`,
            tags: aiTags,
            folderId: currentFolderId,
            uploadDate: new Date().toLocaleDateString('fa-IR'),
            thumbnail: thumbnail, 
            url: base64Content, // Store base64 for download
        };
        setFiles(prev => [...prev, newFile]);
        setActiveTab('files');
      } catch (error) {
          alert("خطا در پردازش فایل.");
          console.error(error);
      }
    }
  };

  // Drag & Drop Reordering (List View)
  const handleListDragStart = (e: React.DragEvent, file: FileItem) => {
    setDraggedFile(file);
    e.dataTransfer.effectAllowed = 'move';
    const ghost = document.createElement('div');
    ghost.innerText = file.name;
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleListDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleListDrop = (e: React.DragEvent, targetFile: FileItem) => {
    e.preventDefault();
    if (!draggedFile || draggedFile.id === targetFile.id) return;

    const newFiles = [...files];
    const draggedIndex = newFiles.findIndex(f => f.id === draggedFile.id);
    
    if (draggedIndex > -1) {
      const [removed] = newFiles.splice(draggedIndex, 1);
      const targetIndex = newFiles.findIndex(f => f.id === targetFile.id);
      if (targetIndex > -1) {
        newFiles.splice(targetIndex, 0, removed);
        setFiles(newFiles);
      }
    }
    setDraggedFile(null);
  };

  // Delete Handler
  const requestDelete = (e: React.MouseEvent | React.TouchEvent, type: DeleteType, id: string, name?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteData({ type, id, name });
  };

  const confirmDelete = () => {
    if (!deleteData) return;
    
    const { type, id } = deleteData;
    
    switch (type) {
        case 'file':
             setFiles(prev => prev.filter(f => f.id !== id));
             break;
        case 'folder':
             // Recursive delete helper logic
             const getAllSubFolderIds = (folderId: string): string[] => {
                const subFolders = folders.filter(f => f.parentId === folderId);
                let ids = [folderId];
                subFolders.forEach(sub => {
                    ids = [...ids, ...getAllSubFolderIds(sub.id)];
                });
                return ids;
             };
             const idsToDelete = getAllSubFolderIds(id);
             
             setFolders(prev => prev.filter(f => !idsToDelete.includes(f.id)));
             setFiles(prev => prev.filter(f => !idsToDelete.includes(f.folderId || '')));
             setNotes(prev => prev.filter(n => !idsToDelete.includes(n.folderId || '')));
             setTasks(prev => prev.filter(t => !idsToDelete.includes(t.folderId || '')));
             setLinks(prev => prev.filter(l => !idsToDelete.includes(l.folderId || '')));
             setMoodboards(prev => prev.filter(m => !idsToDelete.includes(m.folderId || '')));
             setBriefs(prev => prev.filter(b => !idsToDelete.includes(b.folderId || '')));
             break;
        case 'moodboard':
             setMoodboards(prev => prev.filter(m => m.id !== id));
             break;
        case 'note':
             setNotes(prev => prev.filter(n => n.id !== id));
             break;
        case 'task':
             setTasks(prev => prev.filter(t => t.id !== id));
             break;
        case 'link':
             setLinks(prev => prev.filter(l => l.id !== id));
             break;
        case 'brief':
             setBriefs(prev => prev.filter(b => b.id !== id));
             break;
    }
    setDeleteData(null);
  };

  // --- BRIEF LOGIC ---
  const openBriefModal = (brief?: Brief) => {
    if (brief) {
      setEditingId(brief.id);
      setBriefTitle(brief.title);
      setBriefClient(brief.client);
      setBriefStartDate(brief.startDate || '');
      setBriefDeadline(brief.deadline);
      setBriefObjective(brief.objective);
      setBriefAudience(brief.targetAudience);
      setBriefDeliverables(brief.deliverables);
      setBriefPreferences(brief.preferences || '');
      setBriefReferences(brief.references || []);
      setBriefTags(brief.tags || []);
    } else {
      setEditingId(null);
      setBriefTitle('');
      setBriefClient('');
      setBriefStartDate('');
      setBriefDeadline('');
      setBriefObjective('');
      setBriefAudience('');
      setBriefDeliverables('');
      setBriefPreferences('');
      setBriefReferences([]);
      setBriefTags([]);
    }
    setNewBriefTag('');
    setIsBriefModalOpen(true);
  };

  const handleBriefAiAssist = async () => {
    if (!briefTitle || !briefClient) {
      alert('لطفا ابتدا عنوان پروژه و نام مشتری را وارد کنید.');
      return;
    }
    setBriefAiLoading(true);
    const data = await generateBriefAssist(briefTitle, briefClient);
    if (data) {
      setBriefObjective(data.objective || '');
      setBriefAudience(data.targetAudience || '');
      setBriefDeliverables(data.deliverables || '');
      setBriefPreferences(data.preferences || '');
    } else {
      alert('خطا در دریافت پاسخ از هوش مصنوعی.');
    }
    setBriefAiLoading(false);
  };

  const handleBriefReferenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 500 * 1024) {
        alert("حجم فایل برای ذخیره زیاد است.");
        return;
      }
      try {
        const base64 = await convertFileToBase64(file);
        const newRef: BriefReference = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          url: base64
        };
        setBriefReferences(prev => [...prev, newRef]);
      } catch (err) {
        console.error(err);
        alert("خطا در بارگذاری فایل.");
      }
    }
  };

  const removeBriefReference = (id: string) => {
    setBriefReferences(prev => prev.filter(r => r.id !== id));
  };

  const addBriefTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBriefTag.trim() && !briefTags.includes(newBriefTag.trim())) {
      setBriefTags(prev => [...prev, newBriefTag.trim()]);
      setNewBriefTag('');
    }
  };

  const removeBriefTag = (tag: string) => {
    setBriefTags(prev => prev.filter(t => t !== tag));
  };

  const saveBrief = () => {
    if (!briefTitle.trim()) { alert("عنوان بریف الزامی است."); return; }
    
    const briefData: Partial<Brief> = {
      title: briefTitle,
      client: briefClient,
      startDate: briefStartDate,
      deadline: briefDeadline,
      objective: briefObjective,
      targetAudience: briefAudience,
      deliverables: briefDeliverables,
      preferences: briefPreferences,
      references: briefReferences,
      tags: briefTags,
      lastModified: Date.now()
    };

    if (editingId) {
      setBriefs(prev => prev.map(b => b.id === editingId ? { ...b, ...briefData, version: b.version + 1 } as Brief : b));
    } else {
      const newBrief: Brief = {
        id: Date.now().toString(),
        folderId: currentFolderId,
        isPinned: false,
        version: 1,
        title: briefTitle,
        client: briefClient,
        startDate: briefStartDate,
        deadline: briefDeadline,
        objective: briefObjective,
        targetAudience: briefAudience,
        deliverables: briefDeliverables,
        preferences: briefPreferences,
        references: briefReferences,
        tags: briefTags,
        lastModified: Date.now()
      };
      setBriefs(prev => [newBrief, ...prev]);
    }
    setIsBriefModalOpen(false);
    setActiveTab('briefs');
  };

  const togglePinBrief = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBriefs(prev => prev.map(b => b.id === id ? { ...b, isPinned: !b.isPinned } : b));
  };

  const printBrief = (brief: Brief) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>Brief: ${brief.title}</title>
            <style>
              body { font-family: 'Tahoma', sans-serif; padding: 40px; line-height: 1.6; }
              h1 { border-bottom: 2px solid #000; padding-bottom: 10px; }
              .header { display: flex; justify-content: space-between; margin-bottom: 30px; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 20px;}
              .section { margin-bottom: 20px; }
              .label { font-weight: bold; display: block; margin-bottom: 5px; color: #333; font-size: 1.1em; }
              .content { background: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap; }
              .tags span { background: #eee; padding: 3px 8px; border-radius: 4px; margin-left: 5px; font-size: 0.9em; }
            </style>
          </head>
          <body>
            <h1>${brief.title}</h1>
            <div class="header">
              <div><strong>مشتری:</strong> ${brief.client}</div>
              <div><strong>شروع:</strong> ${brief.startDate || '-'}</div>
              <div><strong>تحویل:</strong> ${brief.deadline || '-'}</div>
              <div><strong>نسخه:</strong> ${brief.version}</div>
            </div>
            
            <div class="section">
              <span class="label">تگ‌ها:</span>
              <div class="tags">${brief.tags.length > 0 ? brief.tags.map(t => `<span>${t}</span>`).join('') : '-'}</div>
            </div>

            <div class="section">
              <span class="label">هدف پروژه:</span>
              <div class="content">${brief.objective || '-'}</div>
            </div>
            <div class="section">
              <span class="label">مخاطب هدف:</span>
              <div class="content">${brief.targetAudience || '-'}</div>
            </div>
            <div class="section">
              <span class="label">موارد تحویلی:</span>
              <div class="content">${brief.deliverables || '-'}</div>
            </div>
             <div class="section">
              <span class="label">ترجیحات مشتری:</span>
              <div class="content">${brief.preferences || '-'}</div>
            </div>
             <div class="section">
              <span class="label">رفرنس‌ها:</span>
              <div class="content">${brief.references.length > 0 ? brief.references.map(r => r.name).join(', ') : '-'}</div>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };


  const openMoodboardModal = (mb?: Moodboard) => {
    if (mb) { setEditingId(mb.id); setMoodboardTitle(mb.title); setMoodboardImages([...mb.images]); } 
    else { setEditingId(null); setMoodboardTitle(''); setMoodboardImages([]); }
    setIsMoodboardModalOpen(true);
  };
  const handleMoodboardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        const base64 = await convertFileToBase64(file);
        setMoodboardImages(prev => [...prev, { id: Date.now().toString(), url: base64 }]);
      } catch (error) { alert("خطا در بارگذاری تصویر."); }
    }
  };
  const removeMoodboardImage = (imgId: string) => setMoodboardImages(prev => prev.filter(img => img.id !== imgId));
  const saveMoodboard = () => {
    if (!moodboardTitle.trim()) { alert("لطفا عنوان را وارد کنید."); return; }
    const mbData = { title: moodboardTitle, images: moodboardImages, folderId: currentFolderId };
    if (editingId) setMoodboards(prev => prev.map(m => m.id === editingId ? { ...m, ...mbData } : m));
    else setMoodboards(prev => [{ ...mbData, id: Date.now().toString() }, ...prev]);
    setIsMoodboardModalOpen(false); setActiveTab('moodboards');
  };

  const openNoteModal = (note?: Note) => {
    if (note) { setEditingId(note.id); setNoteTitle(note.title); setNoteContent(note.content); } 
    else { setEditingId(null); setNoteTitle(''); setNoteContent(''); }
    setIsNoteModalOpen(true);
  };
  const handleSaveNote = () => {
    if (!noteTitle.trim()) { alert("عنوان الزامی است."); return; }
    if (editingId) setNotes(prev => prev.map(n => n.id === editingId ? { ...n, title: noteTitle, content: noteContent } : n));
    else setNotes(prev => [{ id: Date.now().toString(), folderId: currentFolderId, title: noteTitle, content: noteContent, date: new Date().toLocaleDateString('fa-IR') }, ...prev]);
    setIsNoteModalOpen(false); setActiveTab('notes');
  };

  const startEditTask = (task: Task) => { setEditingId(task.id); setNewTaskText(task.text); };
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault(); if (!newTaskText.trim()) return;
    if (editingId) { setTasks(prev => prev.map(t => t.id === editingId ? { ...t, text: newTaskText } : t)); setEditingId(null); } 
    else { setTasks(prev => [{ id: Date.now().toString(), folderId: currentFolderId, text: newTaskText, isCompleted: false }, ...prev]); }
    setNewTaskText(''); setActiveTab('tasks');
  };
  const toggleTask = (taskId: string) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));

  const openLinkModal = (link?: LinkItem) => {
    if (link) { setEditingId(link.id); setLinkTitle(link.title); setLinkUrl(link.url); } 
    else { setEditingId(null); setLinkTitle(''); setLinkUrl(''); }
    setIsLinkModalOpen(true);
  };
  const handleSaveLink = () => {
    if (!linkTitle.trim() || !linkUrl.trim()) { alert("عنوان و لینک الزامی است."); return; }
    if (editingId) setLinks(prev => prev.map(l => l.id === editingId ? { ...l, title: linkTitle, url: linkUrl } : l));
    else setLinks(prev => [{ id: Date.now().toString(), folderId: currentFolderId, title: linkTitle, url: linkUrl }, ...prev]);
    setIsLinkModalOpen(false); setActiveTab('links');
  };

  const openFolderModal = (folder?: Folder) => {
    if (folder) { setEditingId(folder.id); setFolderName(folder.name); setFolderColor(folder.color); } 
    else { setEditingId(null); setFolderName(''); setFolderColor(PRESET_COLORS[0]); }
    setIsFolderModalOpen(true);
  };
  const saveFolder = () => {
    if (!folderName.trim()) { alert("نام پوشه الزامی است."); return; }
    if (editingId) setFolders(prev => prev.map(f => f.id === editingId ? { ...f, name: folderName, color: folderColor } : f));
    else setFolders(prev => [...prev, { id: Date.now().toString(), name: folderName, color: folderColor, parentId: currentFolderId }]);
    setIsFolderModalOpen(false);
  };

  // Drag & Drop for Main Container (General drop)
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = async (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); alert("لطفا از دکمه آپلود استفاده کنید."); };

  // Render File Icon
  const renderFilePreview = (file: FileItem, size: 'sm' | 'lg' = 'lg') => {
    const imgClass = size === 'sm' ? "w-full h-full object-cover rounded" : "w-full h-full object-cover";
    const iconClass = size === 'sm' ? "w-6 h-6" : "w-10 h-10";

    if (file.thumbnail) {
        return <img src={file.thumbnail} alt={file.name} className={imgClass} />;
    }
    if (file.type.includes('pdf')) {
        return <FileText className={`${iconClass} text-red-500`} />;
    }
    if (file.type.includes('zip') || file.type.includes('compressed')) {
        return <FileArchive className={`${iconClass} text-orange-400`} />;
    }
    return <File className={`${iconClass} text-textLight`} />;
  };

  // Helper label for confirmation
  const getDeleteLabel = () => {
    if (!deleteData) return '';
    switch (deleteData.type) {
        case 'folder': return 'پوشه';
        case 'file': return 'فایل';
        case 'note': return 'یادداشت';
        case 'task': return 'تسک';
        case 'link': return 'لینک';
        case 'moodboard': return 'مودبرد';
        case 'brief': return 'بریف';
        default: return 'آیتم';
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-hidden">
      
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar">
          <div className="flex items-center text-textLight">
             {history.length > 0 && (
                <div className="relative group ml-2">
                   <button 
                    onClick={() => setShowHistory(!showHistory)} 
                    className="p-1 hover:bg-gray-100 rounded"
                   >
                     <Clock className="w-5 h-5" />
                   </button>
                   {showHistory && (
                     <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-borderLight shadow-lg rounded-xl z-20 py-1">
                        {history.map(h => (
                          <div 
                            key={h.timestamp}
                            onClick={() => {setCurrentFolderId(h.id); setShowHistory(false);}}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-textMain flex items-center gap-2"
                          >
                            <FolderIcon className="w-4 h-4 text-textLight" />
                            {h.name}
                          </div>
                        ))}
                     </div>
                   )}
                </div>
             )}
          </div>

          <nav className="flex items-center gap-1 text-sm md:text-base whitespace-nowrap">
            {getBreadcrumbs().map((crumb, index, arr) => (
              <React.Fragment key={index}>
                <button 
                  onClick={() => setCurrentFolderId(crumb.id)}
                  className={`flex items-center gap-1 hover:text-primary transition-colors ${index === arr.length - 1 ? 'font-bold text-textMain' : 'text-textLight'}`}
                >
                  {index === 0 && <Home className="w-4 h-4" />}
                  {crumb.name}
                </button>
                {index < arr.length - 1 && <ChevronLeft className="w-4 h-4 text-gray-400" />}
              </React.Fragment>
            ))}
          </nav>
        </div>

        <div className="flex gap-3 w-full lg:w-auto items-center">
          {/* View Toggle */}
          {activeTab === 'files' && (
            <div className="flex bg-gray-100 p-1 rounded-xl border border-borderLight">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-textLight hover:text-textMain'}`}
                title="نمای شبکه‌ای"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-textLight hover:text-textMain'}`}
                title="نمای لیست"
              >
                <LayoutList className="w-5 h-5" />
              </button>
            </div>
          )}
          
          <div className="h-8 w-px bg-borderLight hidden lg:block"></div>

          <Button onClick={() => openFolderModal()} variant="secondary" icon={<Plus className="w-4 h-4"/>} className="whitespace-nowrap">
            پوشه
          </Button>
          <div className="relative">
            <Button onClick={() => fileInputRef.current?.click()} variant="primary" icon={<Upload className="w-4 h-4"/>} className="whitespace-nowrap">
              آپلود
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-borderLight mb-6 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'files', label: 'فایل‌ها', icon: FileImage },
          { id: 'briefs', label: 'بریف‌ها', icon: FileText },
          { id: 'moodboards', label: 'مودبردها', icon: LayoutDashboard },
          { id: 'notes', label: 'یادداشت‌ها', icon: StickyNote },
          { id: 'tasks', label: 'وظایف', icon: CheckSquare },
          { id: 'links', label: 'لینک‌ها', icon: LinkIcon },
        ].map(tab => {
           const Icon = tab.icon;
           return (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as TabType)}
               className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-primary text-primary font-bold' : 'border-transparent text-textLight hover:text-textMain'}`}
             >
               <Icon className="w-4 h-4" />
               {tab.label}
             </button>
           );
        })}
      </div>

      {/* Main Content Area */}
      <div 
        className={`flex-1 overflow-y-auto rounded-2xl border-2 border-dashed transition-all p-4 ${isDragging ? 'border-primary bg-primary/5' : 'border-transparent'}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        
        {/* VIEW: FILES */}
        {activeTab === 'files' && (
          <div className="space-y-8">
            {/* Folders Section (Always Grid for now) */}
            {currentFolders.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                {currentFolders.map(folder => (
                  <div 
                    key={folder.id}
                    onClick={() => setCurrentFolderId(folder.id)}
                    className="group bg-white p-4 rounded-xl border border-borderLight hover:border-primary/50 hover:shadow-md cursor-pointer transition-all relative"
                  >
                    <FolderIcon className="w-10 h-10 mb-3" style={{ color: folder.color }} fill={folder.color} fillOpacity={0.2} />
                    <h3 className="font-bold text-textMain truncate">{folder.name}</h3>
                    <p className="text-xs text-textLight mt-1">{folders.filter(f => f.parentId === folder.id).length} پوشه، {files.filter(f => f.folderId === folder.id).length} فایل</p>
                    
                    <div className="absolute top-2 left-2 z-[99] flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={(e) => {e.stopPropagation(); e.preventDefault(); openFolderModal(folder);}} 
                        onMouseDown={(e) => e.stopPropagation()}
                        className="p-2 bg-white rounded-full hover:bg-blue-50 text-blue-600 shadow-sm border border-gray-200 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 pointer-events-none" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => requestDelete(e, 'folder', folder.id, folder.name)} 
                        onMouseDown={(e) => e.stopPropagation()}
                        className="p-2 bg-white rounded-full hover:bg-red-50 text-red-600 shadow-sm border border-gray-200 cursor-pointer relative z-50"
                      >
                        <Trash2 className="w-3 h-3 pointer-events-none" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Files Section - Conditional View */}
            {viewMode === 'grid' ? (
              // GRID VIEW
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentFiles.map(file => (
                  <div key={file.id} className="bg-white p-4 rounded-xl border border-borderLight hover:shadow-md transition-all group flex items-start gap-3 relative">
                    <div className={`rounded-lg overflow-hidden flex-shrink-0 w-16 h-16 flex items-center justify-center border border-borderLight ${file.thumbnail ? 'bg-white' : 'bg-gray-50'}`}>
                      {renderFilePreview(file)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-medium text-textMain truncate mb-1" title={file.name}>{file.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-textLight mb-2">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.uploadDate}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {file.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md">{tag}</span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Actions Overlay */}
                    <div className="absolute top-2 left-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-[99]">
                      {file.url && (
                          <a 
                              href={file.url}
                              download={file.name}
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 border border-gray-100 cursor-pointer flex items-center justify-center"
                              title="دانلود"
                          >
                              <DownloadCloud className="w-4 h-4 pointer-events-none" />
                          </a>
                      )}
                      <button 
                          type="button"
                          onClick={(e) => requestDelete(e, 'file', file.id, file.name)}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-100 cursor-pointer"
                          title="حذف"
                      >
                          <Trash2 className="w-4 h-4 pointer-events-none" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // LIST VIEW
              <div className="bg-white rounded-2xl border border-borderLight overflow-hidden">
                 <div className="grid grid-cols-[auto_auto_1fr_auto_auto_auto] gap-4 p-4 bg-gray-50 border-b border-borderLight text-xs font-bold text-textLight">
                    <div className="w-6"></div> {/* Drag Handle */}
                    <div className="w-10">تصویر</div>
                    <div>نام فایل</div>
                    <div className="hidden md:block">تگ‌ها</div>
                    <div className="hidden sm:block">جزئیات</div>
                    <div className="w-20 text-center">عملیات</div>
                 </div>
                 <div className="divide-y divide-borderLight">
                    {currentFiles.map((file) => (
                      <div 
                        key={file.id}
                        draggable
                        onDragStart={(e) => handleListDragStart(e, file)}
                        onDragOver={handleListDragOver}
                        onDrop={(e) => handleListDrop(e, file)}
                        className={`grid grid-cols-[auto_auto_1fr_auto_auto_auto] gap-4 p-3 items-center hover:bg-blue-50/30 transition-colors group ${draggedFile?.id === file.id ? 'opacity-50 bg-blue-50' : ''}`}
                      >
                         {/* Drag Handle */}
                         <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-textMain flex items-center justify-center">
                            <GripVertical className="w-5 h-5" />
                         </div>

                         {/* Thumbnail */}
                         <div className="w-10 h-10 rounded-lg overflow-hidden border border-borderLight bg-white flex items-center justify-center">
                            {renderFilePreview(file, 'sm')}
                         </div>

                         {/* Name & Basic Info */}
                         <div className="min-w-0">
                            <div className="font-bold text-textMain truncate" title={file.name}>{file.name}</div>
                            <div className="text-[10px] text-textLight sm:hidden">{file.size} • {file.uploadDate}</div>
                         </div>

                         {/* Tags (Desktop) */}
                         <div className="hidden md:flex flex-wrap gap-1">
                            {file.tags.map(tag => (
                               <span key={tag} className="text-[10px] bg-gray-100 text-textMain px-2 py-0.5 rounded border border-gray-200">{tag}</span>
                            ))}
                         </div>

                         {/* Details (Tablet+) */}
                         <div className="hidden sm:block text-xs text-textLight">
                            <div className="flex items-center gap-2">
                               <span className="bg-gray-100 px-1.5 py-0.5 rounded">{file.size}</span>
                               <span>{file.uploadDate}</span>
                            </div>
                         </div>

                         {/* Actions */}
                         <div className="flex items-center justify-end gap-1">
                            {file.url && (
                                <a 
                                  href={file.url} 
                                  download={file.name}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="دانلود"
                                >
                                   <DownloadCloud className="w-4 h-4" />
                                </a>
                            )}
                             {/* Info Button (Placeholder for future details modal) */}
                             <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="اطلاعات بیشتر">
                               <Info className="w-4 h-4" />
                             </button>

                             <button 
                                onClick={(e) => requestDelete(e, 'file', file.id, file.name)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="حذف"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                         </div>
                      </div>
                    ))}
                    {currentFiles.length === 0 && (
                      <div className="p-8 text-center text-textLight text-sm">هیچ فایلی در این پوشه وجود ندارد.</div>
                    )}
                 </div>
              </div>
            )}

            {currentFiles.length === 0 && currentFolders.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-textLight opacity-50">
                  <Upload className="w-16 h-16 mb-4" />
                  <p>این پوشه خالی است. فایل‌های خود را اینجا رها کنید.</p>
                </div>
            )}
          </div>
        )}

        {/* VIEW: BRIEFS */}
        {activeTab === 'briefs' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => openBriefModal()} icon={<Plus className="w-4 h-4" />}>بریف جدید</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentBriefs.map(brief => {
                 return (
                  <div key={brief.id} className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all relative group flex flex-col h-full ${brief.isPinned ? 'border-orange-300 bg-orange-50/20' : 'border-borderLight'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={(e) => togglePinBrief(e, brief.id)}
                          className={`p-1.5 rounded-full transition-colors ${brief.isPinned ? 'text-orange-500 bg-orange-100' : 'text-gray-300 hover:bg-gray-100'}`}
                          title={brief.isPinned ? 'برداشتن پین' : 'پین کردن'}
                        >
                          <Pin className="w-4 h-4 fill-current" />
                        </button>
                        <button onClick={() => openBriefModal(brief)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={(e) => requestDelete(e, 'brief', brief.id, brief.title)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-lg text-textMain mb-1">{brief.title}</h3>
                    <p className="text-sm text-textLight mb-4 font-medium">{brief.client}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-textLight mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-1">
                         <Calendar className="w-3.5 h-3.5 text-green-600" />
                         <span>شروع: {brief.startDate || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                         <Calendar className="w-3.5 h-3.5 text-red-500" />
                         <span>تحویل: {brief.deadline}</span>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    {brief.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {brief.tags.map(t => (
                           <span key={t} className="text-[10px] bg-gray-100 text-textLight px-2 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex-1 space-y-2 mb-4">
                      {brief.objective && <p className="text-xs text-textMain line-clamp-2"><span className="font-bold">هدف:</span> {brief.objective}</p>}
                    </div>

                    <div className="mt-auto flex justify-between items-center pt-3 border-t border-borderLight">
                       <span className="text-[10px] text-gray-400">نسخه {brief.version}</span>
                       <button onClick={() => printBrief(brief)} className="text-xs flex items-center gap-1 text-primary hover:underline">
                         <Printer className="w-3 h-3" />
                         چاپ PDF
                       </button>
                    </div>
                  </div>
                 );
              })}
            </div>
            {currentBriefs.length === 0 && (
              <div className="text-center py-20 text-textLight opacity-50">
                <FileText className="w-16 h-16 mx-auto mb-4" />
                <p>هیچ بریفی ثبت نشده است.</p>
              </div>
            )}
          </div>
        )}

        {/* VIEW: MOODBOARDS */}
        {activeTab === 'moodboards' && (
           <div className="space-y-6">
             <div className="flex justify-end">
               <Button onClick={() => openMoodboardModal()} icon={<Plus className="w-4 h-4" />}>ساخت مودبرد جدید</Button>
             </div>
             
             {currentMoodboards.length === 0 ? (
               <div className="text-center py-20 text-textLight opacity-50">
                 <LayoutDashboard className="w-16 h-16 mx-auto mb-4" />
                 <p>هنوز مودبردی نساخته‌اید.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {currentMoodboards.map(mb => (
                   <div key={mb.id} className="bg-white rounded-2xl border border-borderLight shadow-sm overflow-hidden group hover:shadow-lg transition-all relative">
                     <div className="p-4 border-b border-borderLight flex justify-between items-center bg-gray-50">
                       <h3 className="font-bold text-textMain">{mb.title}</h3>
                       <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-[99]">
                          <button 
                            type="button"
                            onClick={() => openMoodboardModal(mb)} 
                            onMouseDown={(e) => e.stopPropagation()}
                            className="p-2 hover:bg-white rounded-full text-blue-600 shadow-sm border border-transparent hover:border-gray-200 cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4 pointer-events-none" />
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => requestDelete(e, 'moodboard', mb.id, mb.title)} 
                            onMouseDown={(e) => e.stopPropagation()}
                            className="p-2 hover:bg-white rounded-full text-red-600 shadow-sm border border-transparent hover:border-gray-200 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 pointer-events-none" />
                          </button>
                       </div>
                     </div>
                     <div className="p-2 grid grid-cols-2 gap-2 h-48 bg-white overflow-hidden">
                        {mb.images.slice(0, 4).map((img, i) => (
                          <div 
                            key={img.id} 
                            className="relative rounded-lg overflow-hidden h-full cursor-pointer hover:brightness-90 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImage(img.url);
                            }}
                          >
                            <img src={img.url} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20 transition-opacity">
                               <Maximize2 className="w-6 h-6 text-white drop-shadow-md" />
                            </div>
                          </div>
                        ))}
                        {mb.images.length === 0 && (
                          <div className="col-span-2 flex items-center justify-center text-textLight text-sm bg-gray-50 rounded-lg">بدون تصویر</div>
                        )}
                     </div>
                     <div className="p-3 bg-white text-xs text-textLight text-center border-t border-borderLight">
                       {mb.images.length} تصویر
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
        )}

        {/* VIEW: NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
             <div className="flex justify-end">
               <Button onClick={() => openNoteModal()} icon={<Plus className="w-4 h-4" />}>یادداشت جدید</Button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {currentNotes.map(note => (
                 <div key={note.id} className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 shadow-sm relative group hover:shadow-md transition-all">
                    <h4 className="font-bold text-gray-800 mb-2">{note.title}</h4>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed line-clamp-6">{note.content}</p>
                    <span className="absolute bottom-4 left-4 text-[10px] text-gray-400">{note.date}</span>
                    <div className="absolute top-4 left-4 z-[99] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-1">
                      <button 
                        type="button"
                        onClick={() => openNoteModal(note)} 
                        onMouseDown={(e) => e.stopPropagation()}
                        className="p-2 bg-white/70 hover:bg-white rounded-full text-blue-600 shadow-sm cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 pointer-events-none" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => requestDelete(e, 'note', note.id, note.title)} 
                        onMouseDown={(e) => e.stopPropagation()}
                        className="p-2 bg-white/70 hover:bg-white rounded-full text-red-600 shadow-sm cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3 pointer-events-none" />
                      </button>
                    </div>
                 </div>
               ))}
             </div>
             {currentNotes.length === 0 && (
               <div className="text-center py-20 text-textLight opacity-50">
                 <StickyNote className="w-16 h-16 mx-auto mb-4" />
                 <p>یادداشتی وجود ندارد.</p>
               </div>
             )}
          </div>
        )}

        {/* VIEW: TASKS */}
        {activeTab === 'tasks' && (
          <div className="max-w-2xl mx-auto">
             <form onSubmit={handleSaveTask} className="flex gap-2 mb-8">
               <input 
                 value={newTaskText}
                 onChange={(e) => setNewTaskText(e.target.value)}
                 className="flex-1 p-3 rounded-xl border border-borderLight focus:border-primary outline-none"
                 placeholder="تسک جدید را وارد کنید..."
               />
               <Button type="submit" disabled={!newTaskText.trim()}>
                 {editingId ? 'ویرایش' : 'افزودن'}
               </Button>
               {editingId && <Button type="button" variant="secondary" onClick={() => {setEditingId(null); setNewTaskText('');}}>لغو</Button>}
             </form>

             <div className="space-y-3">
               {currentTasks.map(task => (
                 <div key={task.id} className={`flex items-center gap-3 p-4 bg-white rounded-xl border transition-all ${task.isCompleted ? 'border-green-200 bg-green-50/30' : 'border-borderLight'}`}>
                    <button type="button" onClick={() => toggleTask(task.id)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-primary'}`}>
                      {task.isCompleted && <CheckSquare className="w-4 h-4 pointer-events-none" />}
                    </button>
                    <span className={`flex-1 text-sm ${task.isCompleted ? 'line-through text-textLight' : 'text-textMain'}`}>{task.text}</span>
                    <div className="flex gap-2">
                       <button type="button" onClick={() => startEditTask(task)} className="text-textLight hover:text-blue-500 p-2"><Edit2 className="w-4 h-4 pointer-events-none" /></button>
                       <button 
                         type="button" 
                         onClick={(e) => requestDelete(e, 'task', task.id, task.text)} 
                         onMouseDown={(e) => e.stopPropagation()}
                         className="text-textLight hover:text-red-500 p-2"
                        >
                           <Trash2 className="w-4 h-4 pointer-events-none" />
                        </button>
                    </div>
                 </div>
               ))}
             </div>
             {currentTasks.length === 0 && (
               <div className="text-center py-10 text-textLight opacity-50">
                 <CheckSquare className="w-12 h-12 mx-auto mb-2" />
                 <p>لیست وظایف خالی است.</p>
               </div>
             )}
          </div>
        )}

        {/* VIEW: LINKS */}
        {activeTab === 'links' && (
          <div className="space-y-6">
             <div className="flex justify-end">
               <Button onClick={() => openLinkModal()} icon={<Plus className="w-4 h-4" />}>لینک جدید</Button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {currentLinks.map(link => (
                 <div key={link.id} className="bg-white p-4 rounded-xl border border-borderLight flex items-center justify-between group hover:shadow-md transition-all relative">
                    <div className="flex items-center gap-4 overflow-hidden">
                       <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                         <LinkIcon className="w-5 h-5" />
                       </div>
                       <div className="min-w-0">
                         <h4 className="font-bold text-textMain truncate">{link.title}</h4>
                         <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate block dir-ltr text-left">{link.url}</a>
                       </div>
                    </div>
                    <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-[99]">
                      <button 
                        type="button"
                        onClick={() => openLinkModal(link)} 
                        onMouseDown={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-gray-100 rounded-lg text-textLight cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 pointer-events-none" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => requestDelete(e, 'link', link.id, link.title)} 
                        onMouseDown={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 pointer-events-none" />
                      </button>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

      </div>

      {/* --- MODALS --- */}
      
      {/* Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'ویرایش پوشه' : 'ساخت پوشه جدید'}</h3>
            <input 
              value={folderName} 
              onChange={(e) => setFolderName(e.target.value)} 
              placeholder="نام پوشه"
              className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none mb-4"
              autoFocus
            />
            <div className="mb-6">
              <label className="block text-sm text-textLight mb-2">رنگ پوشه</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                  <button 
                    key={c} 
                    type="button"
                    onClick={() => setFolderColor(c)} 
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${folderColor === c ? 'border-gray-400 scale-110' : 'border-transparent hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={saveFolder}>ذخیره</Button>
              <Button variant="secondary" className="flex-1" onClick={() => setIsFolderModalOpen(false)}>انصراف</Button>
            </div>
          </div>
        </div>
      )}

      {/* Brief Modal */}
      {isBriefModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl flex flex-col overflow-hidden animate-fadeIn">
            <div className="flex justify-between items-center p-6 border-b border-borderLight">
               <h3 className="text-xl font-bold">{editingId ? 'ویرایش بریف' : 'ساخت بریف جدید'}</h3>
               <button onClick={() => setIsBriefModalOpen(false)}><X className="w-6 h-6 text-textLight hover:text-textMain" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
               <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-6 flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Zap className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-bold text-orange-800 text-sm mb-1">دستیار هوشمند</h4>
                    <p className="text-xs text-orange-700 mb-2">عنوان و نام مشتری را وارد کنید، سپس دکمه زیر را بزنید تا هوش مصنوعی بخش‌های دیگر را پیشنهاد دهد.</p>
                    <button 
                      onClick={handleBriefAiAssist} 
                      disabled={briefAiLoading}
                      className="text-xs bg-orange-200 text-orange-800 px-3 py-1.5 rounded-lg hover:bg-orange-300 transition-colors font-bold flex items-center gap-1"
                    >
                      {briefAiLoading ? 'در حال فکر کردن...' : 'تکمیل خودکار با هوش مصنوعی'}
                    </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div>
                   <label className="block text-xs font-bold text-textLight mb-1">عنوان پروژه</label>
                   <input value={briefTitle} onChange={e => setBriefTitle(e.target.value)} className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none" placeholder="مثال: طراحی لوگو کافه" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-textLight mb-1">نام مشتری</label>
                   <input value={briefClient} onChange={e => setBriefClient(e.target.value)} className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none" placeholder="مثال: کافه لمیز" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-textLight mb-1">تاریخ شروع</label>
                   <input value={briefStartDate} onChange={e => setBriefStartDate(e.target.value)} className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none dir-ltr text-right" placeholder="1403/05/01" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-textLight mb-1">ددلاین (تاریخ تحویل)</label>
                   <input value={briefDeadline} onChange={e => setBriefDeadline(e.target.value)} className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none dir-ltr text-right" placeholder="1403/05/20" />
                 </div>
               </div>

               {/* Tags Section */}
               <div className="mb-6">
                 <label className="block text-xs font-bold text-textLight mb-2">تگ‌ها</label>
                 <form onSubmit={addBriefTag} className="flex gap-2 mb-2">
                   <input 
                     value={newBriefTag}
                     onChange={(e) => setNewBriefTag(e.target.value)}
                     className="flex-1 p-2 rounded-lg border border-borderLight focus:border-primary outline-none text-sm"
                     placeholder="تگ جدید و اینتر..."
                   />
                   <button type="submit" disabled={!newBriefTag.trim()} className="bg-primary/10 text-primary px-3 rounded-lg text-sm font-bold">افزودن</button>
                 </form>
                 <div className="flex flex-wrap gap-2">
                   {briefTags.map(tag => (
                     <span key={tag} className="flex items-center gap-1 bg-white border border-borderLight px-2 py-1 rounded text-xs text-textMain">
                       {tag}
                       <button onClick={() => removeBriefTag(tag)} className="text-red-500 hover:bg-red-50 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                     </span>
                   ))}
                 </div>
               </div>

               <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-textLight mb-1">هدف پروژه (Objective)</label>
                   <textarea value={briefObjective} onChange={e => setBriefObjective(e.target.value)} className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none h-24 resize-none" placeholder="هدف اصلی از انجام این پروژه چیست؟" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-textLight mb-1">مخاطب هدف (Target Audience)</label>
                   <textarea value={briefAudience} onChange={e => setBriefAudience(e.target.value)} className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none h-24 resize-none" placeholder="چه کسانی مخاطب این طرح هستند؟" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-textLight mb-1">موارد تحویلی (Deliverables)</label>
                   <textarea value={briefDeliverables} onChange={e => setBriefDeliverables(e.target.value)} className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none h-24 resize-none" placeholder="لیست خروجی‌های نهایی (فرمت فایل‌ها، سایزها و...)" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-textLight mb-1">ترجیحات مشتری (Client Preferences)</label>
                   <textarea value={briefPreferences} onChange={e => setBriefPreferences(e.target.value)} className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none h-24 resize-none" placeholder="سبک مورد علاقه، رنگ‌های سازمانی، بایدها و نبایدها..." />
                 </div>
               </div>

               {/* References Section */}
               <div className="mt-6 border-t border-borderLight pt-4">
                  <label className="block text-xs font-bold text-textLight mb-2">رفرنس‌ها و فایل‌های ضمیمه</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {briefReferences.map(ref => (
                      <div key={ref.id} className="relative group bg-white p-3 rounded-xl border border-borderLight shadow-sm flex flex-col items-center text-center">
                        <div className="w-full aspect-square bg-gray-50 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                           {ref.type.startsWith('image/') ? (
                             <img src={ref.url} alt={ref.name} className="w-full h-full object-cover" />
                           ) : (
                             <Paperclip className="w-8 h-8 text-gray-400" />
                           )}
                        </div>
                        <span className="text-[10px] text-textMain truncate w-full">{ref.name}</span>
                        <button 
                          onClick={() => removeBriefReference(ref.id)} 
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <div 
                      onClick={() => briefReferenceInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-borderLight rounded-xl flex flex-col items-center justify-center text-textLight cursor-pointer hover:bg-gray-50 hover:border-primary hover:text-primary transition-all"
                    >
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-[10px]">افزودن فایل</span>
                      <input type="file" ref={briefReferenceInputRef} className="hidden" onChange={handleBriefReferenceUpload} />
                    </div>
                  </div>
               </div>
            </div>

            <div className="p-4 border-t border-borderLight bg-white flex gap-3">
               <Button className="flex-1" onClick={saveBrief}>ذخیره بریف</Button>
               <Button variant="secondary" className="flex-1" onClick={() => setIsBriefModalOpen(false)}>انصراف</Button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'ویرایش یادداشت' : 'یادداشت جدید'}</h3>
            <input 
              value={noteTitle} 
              onChange={(e) => setNoteTitle(e.target.value)} 
              placeholder="عنوان"
              className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none mb-4 font-bold"
            />
            <textarea 
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="متن یادداشت..."
              className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none mb-6 h-48 resize-none"
            />
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleSaveNote}>ذخیره</Button>
              <Button variant="secondary" className="flex-1" onClick={() => setIsNoteModalOpen(false)}>انصراف</Button>
            </div>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'ویرایش لینک' : 'لینک جدید'}</h3>
            <input 
              value={linkTitle} 
              onChange={(e) => setLinkTitle(e.target.value)} 
              placeholder="عنوان لینک"
              className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none mb-4"
            />
            <input 
              value={linkUrl} 
              onChange={(e) => setLinkUrl(e.target.value)} 
              placeholder="آدرس اینترنتی (URL)"
              className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none mb-6 text-left dir-ltr"
            />
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleSaveLink}>ذخیره</Button>
              <Button variant="secondary" className="flex-1" onClick={() => setIsLinkModalOpen(false)}>انصراف</Button>
            </div>
          </div>
        </div>
      )}

      {/* Moodboard Modal */}
      {isMoodboardModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl h-[80vh] rounded-2xl flex flex-col overflow-hidden animate-fadeIn">
            
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold">{editingId ? 'ویرایش مودبرد' : 'مودبرد جدید'}</h3>
                 <button onClick={() => setIsMoodboardModalOpen(false)}><X className="w-6 h-6 text-textLight hover:text-textMain" /></button>
               </div>
               
               <input 
                  value={moodboardTitle} 
                  onChange={(e) => setMoodboardTitle(e.target.value)} 
                  placeholder="عنوان مودبرد..."
                  className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none mb-6 text-lg font-bold"
                />

               <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                 {moodboardImages.map(img => (
                   <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square border border-borderLight">
                     <img 
                        src={img.url} 
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                        alt="" 
                        onClick={() => setSelectedImage(img.url)}
                     />
                     <button 
                       type="button"
                       onClick={() => removeMoodboardImage(img.id)}
                       className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                     >
                       <X className="w-4 h-4" />
                     </button>
                   </div>
                 ))}
                 <div 
                   onClick={() => moodboardFileInputRef.current?.click()}
                   className="aspect-square rounded-xl border-2 border-dashed border-borderLight flex flex-col items-center justify-center text-textLight hover:border-primary hover:text-primary cursor-pointer hover:bg-primary/5 transition-all"
                 >
                   <Upload className="w-8 h-8 mb-2" />
                   <span className="text-xs">افزودن عکس</span>
                   <input type="file" className="hidden" ref={moodboardFileInputRef} onChange={handleMoodboardImageUpload} accept="image/*" />
                 </div>
               </div>

               <div className="mt-auto pt-4 border-t border-borderLight">
                  <Button className="w-full" onClick={saveMoodboard}>ذخیره تغییرات</Button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 animate-fadeIn shadow-2xl transform scale-100">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 ring-8 ring-red-50/50">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-textMain">
                        حذف {getDeleteLabel()}
                    </h3>
                    <p className="text-textLight mb-6 leading-relaxed">
                        آیا از حذف {getDeleteLabel()} {deleteData.name ? <span className="font-bold text-textMain">«{deleteData.name}»</span> : ''} اطمینان دارید؟
                        {deleteData.type === 'folder' && <span className="block text-red-500 mt-3 font-medium text-sm bg-red-50 py-1 px-2 rounded-lg">هشدار: تمام محتویات داخل پوشه نیز حذف خواهند شد.</span>}
                        <span className="block mt-2 text-xs opacity-75">این عملیات غیرقابل بازگشت است.</span>
                    </p>
                    
                    <div className="flex gap-3 w-full">
                        <Button className="flex-1 !bg-red-500 hover:!bg-red-600 text-white border-none shadow-red-200 shadow-lg" onClick={confirmDelete}>
                            بله، حذف کن
                        </Button>
                        <Button variant="secondary" className="flex-1" onClick={() => setDeleteData(null)}>
                            انصراف
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
           <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
           >
              <X className="w-8 h-8" />
           </button>
           <img 
              src={selectedImage} 
              alt="Full View" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
           />
        </div>
      )}

    </div>
  );
};
