import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { GlassCard } from '@/components/GlassCard';
import { FormInput, FormSelect, FormTextarea } from '@/components/forms';
import { ScanLine, X, UploadCloud, CheckCircle, IndianRupee } from 'lucide-react';
import { categoryLabels, floorOptions, rowOptions, shelfOptions, departmentOptions } from '@/data/mockData';
import type { BookFormData } from '@/types';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialFormData: BookFormData = {
  title: '',
  author: '',
  isbn: '',
  publishYear: '',
  category: '',
  department: '',
  rentalPrice: '',
  bookType: 'physical',
  floor: '1',
  row: 'A',
  shelf: '1',
  description: '',
  digitalContent: '',
  fileUrl: '',
};

export function AddBookModal({ isOpen, onClose }: AddBookModalProps) {
  const { t, addBook, addToast } = useLibrary();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<BookFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof BookFormData, string>>>({});
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const categoryOpts = Object.entries(categoryLabels).map(([value, label]) => ({
    value,
    label,
  }));

  const deptOpts = departmentOptions.map(dept => ({
    value: dept,
    label: dept
  }));

  const floorOpts = floorOptions.map(f => ({ value: f, label: `Floor ${f}` }));
  const rowOpts = rowOptions.map(r => ({ value: r, label: `Row ${r}` }));
  const shelfOpts = shelfOptions.map(s => ({ value: s, label: `Shelf ${s}` }));

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BookFormData, string>> = {};

    if (!formData.title.trim()) newErrors.title = t('required');
    if (!formData.author.trim()) newErrors.author = t('required');
    
    if (!formData.isbn.trim()) {
      newErrors.isbn = t('required');
    } else if (!/^\d{3}-\d{2}-\d{4}-\d{3}-\d{1}$/.test(formData.isbn)) {
      newErrors.isbn = 'Invalid ISBN format (978-XX-XXXX-XXX-X)';
    }
    
    if (!formData.publishYear.trim()) {
      newErrors.publishYear = t('required');
    } else if (!/^\d{4}$/.test(formData.publishYear)) {
      newErrors.publishYear = 'Invalid year format';
    }
    
    if (!formData.category) newErrors.category = t('required');
    if (!formData.department) newErrors.department = t('required');
    
    if (formData.bookType === 'physical' && (!formData.rentalPrice || isNaN(Number(formData.rentalPrice)))) {
      newErrors.rentalPrice = 'Valid price required for physical books';
    }

    // Fix: Allow EITHER standard digital text OR an uploaded file URL 
    if (formData.bookType === 'digital' && !formData.digitalContent && !formData.fileUrl) {
       addToast('Please upload a document or provide digital text.', 'error');
       return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    // If it's a text file, we can still extract it to be flipped natively page by page
    if (file.type.startsWith('text/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setFormData(prev => ({
            ...prev,
            fileUrl: '',
            rentalPrice: '0',
            digitalContent: content
          }));
          setIsUploading(false);
          addToast('Text document processed natively!', 'success');
        };
        reader.onerror = () => {
          setIsUploading(false);
          addToast('Error reading the file stream.', 'error');
        };
        reader.readAsText(file);
    } else {
        // If it's a PDF/Image, we DO NOT extract fake text.
        // We link directly to the native Blob so the iframe handles the render perfectly.
        const fileUrl = URL.createObjectURL(file);
        setFormData(prev => ({
          ...prev,
          fileUrl: fileUrl,
          rentalPrice: '0', 
          digitalContent: '' // Clear out any text, avoiding the OCR mockup completely
        }));
        setIsUploading(false);
        addToast('Document attached successfully!', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const pages = formData.digitalContent ? formData.digitalContent.split('\n\n') : [];
      addBook({ ...formData, digitalPages: pages });
      setFormData(initialFormData);
      setFileName('');
      onClose();
    }
  };

  const handleScanBarcode = () => {
    setIsScanning(true);
    setTimeout(() => {
      setFormData(prev => ({ ...prev, isbn: '978-93-1234-567-8' }));
      setIsScanning(false);
    }, 1500);
  };

  const updateField = (field: keyof BookFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" hover={false}>
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-[#4B2E2B]">{t('addBook')}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <FormInput
                    label={t('title')}
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    error={errors.title}
                    required
                    placeholder="Enter book title"
                  />

                  {/* Author */}
                  <FormInput
                    label={t('author')}
                    value={formData.author}
                    onChange={(e) => updateField('author', e.target.value)}
                    error={errors.author}
                    required
                    placeholder="Enter author name"
                  />

                  {/* ISBN */}
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="block text-base font-semibold text-[#4B2E2B]">
                      {t('isbn')} <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.isbn}
                        onChange={(e) => updateField('isbn', e.target.value)}
                        placeholder="978-XX-XXXX-XXX-X"
                        className={`flex-1 bg-white border-2 rounded-xl px-4 py-3 text-base transition-colors ${
                          errors.isbn ? 'border-red-500' : 'border-gray-200 focus:border-[#C08552]'
                        } focus:outline-none`}
                      />
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleScanBarcode}
                        disabled={isScanning}
                        className="btn-navy px-4 flex items-center gap-2"
                      >
                        <ScanLine className="w-5 h-5" />
                        {isScanning ? 'Scanning...' : t('barcodeScan')}
                      </motion.button>
                    </div>
                    {errors.isbn && <p className="text-sm font-medium text-red-500">{errors.isbn}</p>}
                  </div>

                  {/* Publication Year */}
                  <FormInput
                    label={t('publishYear')}
                    type="number"
                    value={formData.publishYear}
                    onChange={(e) => updateField('publishYear', e.target.value)}
                    error={errors.publishYear}
                    required
                    placeholder="YYYY"
                  />

                  {/* Category */}
                  <FormSelect
                    label={t('category')}
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    options={[{ value: '', label: 'Select Category' }, ...categoryOpts]}
                    error={errors.category}
                    required
                  />

                  {/* Department */}
                  <FormSelect
                    label="Department / College Cell"
                    value={formData.department}
                    onChange={(e) => updateField('department', e.target.value)}
                    options={[{ value: '', label: 'Assign Department' }, ...deptOpts]}
                    error={errors.department}
                    required
                  />

                  {/* Rental Price */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Rental Price (₹) <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        disabled={formData.bookType === 'digital'}
                        value={formData.rentalPrice}
                        onChange={(e) => updateField('rentalPrice', e.target.value)}
                        placeholder={formData.bookType === 'digital' ? 'Free (Digital)' : 'e.g. 50'}
                        className={`w-full pl-9 pr-4 py-2 bg-white border rounded-xl text-sm transition-colors focus:outline-none ${
                          errors.rentalPrice ? 'border-red-500' : 'border-gray-200 focus:border-[#C08552]'
                        } ${formData.bookType === 'digital' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                      />
                    </div>
                    {errors.rentalPrice && <p className="text-xs text-red-500 mt-1">{errors.rentalPrice}</p>}
                  </div>

                  {/* Format Toggle */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Book Format</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={formData.bookType === 'physical'} onChange={() => { updateField('bookType', 'physical'); updateField('digitalContent', ''); }} className="text-[#4B2E2B]" />
                        <span className="text-sm font-medium">Physical Book</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={formData.bookType === 'digital'} onChange={() => { updateField('bookType', 'digital'); updateField('rentalPrice', '0'); }} className="text-[#138808]" />
                        <span className="text-sm font-medium">Digital Archive</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  {formData.bookType === 'physical' ? (
                    <div className="space-y-4">
                      <label className="block text-base font-semibold text-[#4B2E2B]">{t('location')}</label>
                      <div className="grid grid-cols-3 gap-3">
                        <FormSelect label="" value={formData.floor} onChange={(e) => updateField('floor', e.target.value)} options={floorOpts} />
                        <FormSelect label="" value={formData.row} onChange={(e) => updateField('row', e.target.value)} options={rowOpts} />
                        <FormSelect label="" value={formData.shelf} onChange={(e) => updateField('shelf', e.target.value)} options={shelfOpts} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-[#138808] flex items-center gap-2">
                        <UploadCloud className="w-5 h-5" /> Upload Document
                      </label>
                      
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                          (formData.digitalContent || formData.fileUrl)
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
                        
                        {!isUploading && !formData.digitalContent && !formData.fileUrl && (
                          <div className="flex flex-col items-center">
                            <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                            <p className="text-gray-700 font-medium">Click to browse or drag and drop</p>
                            <p className="text-gray-500 text-xs mt-1">PDF, TXT, JPG, or PNG</p>
                          </div>
                        )}

                        {isUploading && (
                          <div className="flex flex-col items-center w-full max-w-sm mx-auto">
                            <ScanLine className="w-8 h-8 text-[#C08552] animate-pulse mb-3" />
                            <p className="text-gray-700 font-medium text-sm mb-2">Processing {fileName}...</p>
                          </div>
                        )}

                        {(formData.digitalContent || formData.fileUrl) && !isUploading && (
                          <div className="flex flex-col items-center">
                            <CheckCircle className="w-10 h-10 text-[#138808] mb-3" />
                            <p className="text-[#138808] font-bold">{fileName || 'Document'} Ready!</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Only render text area if we extracted raw string data (e.g. .txt files) */}
                      {formData.digitalContent && (
                        <textarea 
                          value={formData.digitalContent} 
                          onChange={e => updateField('digitalContent', e.target.value)} 
                          className="w-full border border-green-200 bg-green-50/10 rounded-lg px-4 py-3 focus:border-[#138808] outline-none min-h-[100px] text-sm" 
                        />
                      )}
                    </div>
                  )}
                </div>

                <FormTextarea
                  label={t('description')}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Enter book description"
                  rows={3}
                />

                <div className="flex gap-3 pt-4">
                  <motion.button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200">
                    {t('cancel')}
                  </motion.button>
                  <motion.button type="submit" disabled={isUploading} className={`flex-1 px-6 py-3 rounded-xl font-semibold text-white ${formData.bookType === 'digital' ? 'bg-[#138808] hover:bg-green-700' : 'bg-[#4B2E2B] hover:bg-[#000066]'}`}>
                    {t('addToCatalog')}
                  </motion.button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}