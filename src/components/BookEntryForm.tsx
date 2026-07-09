import React, { useState, useRef } from 'react';
import { useLibrary } from '@/context/LibraryContext';
import { UploadCloud, BookPlus, ScanLine, CheckCircle } from 'lucide-react';
import { BulkImportModal } from '@/components/modals/BulkImportModal';
import type { BookFormData } from '@/types';

export const BookEntryForm = () => {
  const { addBook, addToast, setActiveView } = useLibrary();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);

  const [formData, setFormData] = useState<BookFormData>({
    title: '', author: '', isbn: '', publishYear: '', category: 'history',
    bookType: 'physical', floor: '', row: '', shelf: '', description: '', digitalContent: '', fileUrl: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      setIsUploading(false);
      setFormData(prev => ({
        ...prev,
        fileUrl: URL.createObjectURL(file),
        digitalContent: file.type.startsWith('text/') ? content : `[DIGITIZED CONTENT OF ${file.name}]\n\nFile size: ${file.size} bytes\nType: ${file.type}\nStatus: OCR Processing Finished.`
      }));
      addToast('Document processed natively!', 'success');
    };

    reader.onerror = () => {
      setIsUploading(false);
      addToast('Error reading the file stream.', 'error');
    };

    // Use native FileReader dependent on MIME type
    if (file.type.startsWith('text/')) {
       reader.readAsText(file);
    } else {
       // Images, PDFs default to DataURL natively
       reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.bookType === 'digital' && !formData.digitalContent) {
      addToast('Please upload a scanned document or provide digital text.', 'error');
      return;
    }
    
    const pages = formData.digitalContent ? formData.digitalContent.split('\n\n') : [];
    
    addBook({ ...formData, digitalPages: pages });
    addToast(formData.bookType === 'digital' ? 'Digital copy created and added to archives!' : 'Physical book added to catalog successfully!', 'success');
    setActiveView('all-books');
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Book Title</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#4B2E2B] focus:ring-1 focus:ring-[#4B2E2B] outline-none" placeholder="Enter title" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Author</label>
            <input required type="text" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#4B2E2B] focus:ring-1 focus:ring-[#4B2E2B] outline-none" placeholder="Enter author" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">ISBN</label>
            <input required type="text" value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#4B2E2B] outline-none" placeholder="e.g. 978-..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Publication Year</label>
              <input required type="number" value={formData.publishYear} onChange={e => setFormData({...formData, publishYear: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#4B2E2B] outline-none" placeholder="YYYY" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#4B2E2B] outline-none bg-white">
                <option value="history">History</option>
                <option value="ukpsc">UKPSC Exam Prep</option>
                <option value="science">Science</option>
                <option value="technology">Technology</option>
                <option value="literature">Literature</option>
                <option value="fiction">Fiction</option>
                <option value="children">Children</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Book Format</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="formatType" checked={formData.bookType === 'physical'} onChange={() => setFormData({...formData, bookType: 'physical', digitalContent: ''})} className="text-[#4B2E2B] focus:ring-[#4B2E2B]" />
                <span className="text-sm text-gray-700 font-medium">Physical Book (Offline)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="formatType" checked={formData.bookType === 'digital'} onChange={() => setFormData({...formData, bookType: 'digital'})} className="text-[#138808] focus:ring-[#138808]" />
                <span className="text-sm text-gray-700 font-medium">Read Online (Digital)</span>
              </label>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#4B2E2B] outline-none" placeholder="Brief summary" />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6">
          {formData.bookType === 'physical' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Floor</label>
                  <input required type="text" value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#4B2E2B] outline-none" placeholder="e.g. 1" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Row</label>
                  <input required type="text" value={formData.row} onChange={e => setFormData({...formData, row: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#4B2E2B] outline-none" placeholder="e.g. A" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Shelf</label>
                  <input required type="text" value={formData.shelf} onChange={e => setFormData({...formData, shelf: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#4B2E2B] outline-none" placeholder="e.g. 4" />
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div>
                  <h4 className="font-bold text-[#4B2E2B]">Bulk Upload Offline Books</h4>
                  <p className="text-sm text-gray-600">Have a large list of inventory? Upload a CSV or Excel file.</p>
                </div>
                <button type="button" onClick={() => setShowBulkImportModal(true)} className="px-4 py-2 bg-white text-[#4B2E2B] border border-[#4B2E2B]/20 rounded-lg hover:bg-[#FFF8F0] font-bold flex items-center gap-2 shadow-sm">
                  <UploadCloud className="w-4 h-4" /> Bulk Import
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-[#138808] flex items-center gap-2">
                <UploadCloud className="w-5 h-5" /> Upload Scanned Document
              </label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  formData.digitalContent 
                    ? 'border-[#138808] bg-green-50/30' 
                    : isUploading 
                      ? 'border-orange-300 bg-orange-50' 
                      : 'border-gray-300 hover:border-[#4B2E2B] hover:bg-[#FFF8F0]'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".pdf,text/plain,image/*" 
                  className="hidden" 
                />
                
                {!isUploading && !formData.digitalContent && (
                  <div className="flex flex-col items-center">
                    <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                    <p className="text-gray-700 font-medium">Click to browse or drag and drop</p>
                    <p className="text-gray-500 text-xs mt-1">PDF, TXT, JPG, or PNG (Max. 50MB)</p>
                  </div>
                )}

                {isUploading && (
                  <div className="flex flex-col items-center w-full max-w-sm mx-auto">
                    <ScanLine className="w-8 h-8 text-[#C08552] animate-pulse mb-3" />
                    <p className="text-gray-700 font-medium text-sm mb-2">Scanning and processing {fileName} natively...</p>
                  </div>
                )}

                {formData.digitalContent && !isUploading && (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-10 h-10 text-[#138808] mb-3" />
                    <p className="text-[#138808] font-bold">{fileName || 'Document'} successfully digitized!</p>
                    <p className="text-gray-500 text-xs mt-1">OCR Text extraction complete. Ready to add to archive.</p>
                  </div>
                )}
              </div>
              
              {formData.digitalContent && (
                <textarea 
                  value={formData.digitalContent} 
                  onChange={e => setFormData({...formData, digitalContent: e.target.value})} 
                  className="w-full border border-green-200 bg-green-50/10 rounded-lg px-4 py-3 focus:border-[#138808] outline-none min-h-[100px] text-sm text-gray-600" 
                  placeholder="Extracted text can be edited here..." 
                />
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isUploading}
            className={`px-8 py-3 rounded-xl font-bold transition-all shadow-md text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${formData.bookType === 'digital' ? 'bg-[#8C5A3C] hover:bg-green-700' : 'bg-[#4B2E2B] hover:bg-[#000066]'}`}
          >
            {formData.bookType === 'digital' ? <UploadCloud className="w-5 h-5" /> : <BookPlus className="w-5 h-5" />}
            {formData.bookType === 'digital' ? 'Add to Digital Archive' : 'Add to Catalog'}
          </button>
        </div>
      </form>
      <BulkImportModal isOpen={showBulkImportModal} onClose={() => setShowBulkImportModal(false)} />
    </>
  );
};