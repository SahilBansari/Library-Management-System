import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibrary } from '@/context/LibraryContext';
import { GlassCard } from '@/components/GlassCard';
import { FormInput, FormSelect } from '@/components/forms';
import { Upload, FileCheck, AlertCircle, X, CheckCircle, FolderSync, Settings, FolderSearch } from 'lucide-react';
import { departmentOptions, categoryLabels } from '@/data/mockData';
import type { CSVImportResult } from '@/types';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BulkImportModal({ isOpen, onClose }: BulkImportModalProps) {
  const { t, bulkImportBooks, setupHotFolderSync, triggerHotFolderSync, hotFolderConfig, addToast } = useLibrary();
  
  const [activeTab, setActiveTab] = useState<'csv' | 'hotfolder'>('csv');
  
  // CSV State
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<CSVImportResult | null>(null);

  // Hot Folder State
  const [folderPath, setFolderPath] = useState('');
  const [targetDept, setTargetDept] = useState('');
  const [targetCat, setTargetCat] = useState('');
  const [defaultPrice, setDefaultPrice] = useState('0');
  
  const folderInputRef = useRef<HTMLInputElement>(null);

  const deptOpts = departmentOptions.map(dept => ({ value: dept, label: dept }));
  const catOpts = Object.entries(categoryLabels).map(([value, label]) => ({ value, label }));

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  }, []);

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Due to browser security, full local paths are restricted.
      // We extract the top-level folder name and simulate a network/local path format.
      const relativePath = files[0].webkitRelativePath;
      const folderName = relativePath ? relativePath.split('/')[0] : 'Scanned_Documents';
      setFolderPath(`\\\\network-share\\library-sync\\${folderName}`);
    }
  };

  const handleUpload = (_file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setResult(null);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      const importResult = bulkImportBooks('');
      setResult(importResult);
      setIsUploading(false);
    }, 2500);
  };

  const handleConfigureHotFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderPath || !targetDept || !targetCat) {
      addToast('Please fill all hot folder config fields', 'error');
      return;
    }
    setupHotFolderSync({
      isActive: true,
      folderPath,
      targetDepartment: targetDept,
      targetCategory: targetCat as any,
      defaultPrice: parseFloat(defaultPrice || '0')
    });
  };

  const handleClose = () => {
    setResult(null);
    setUploadProgress(0);
    setIsUploading(false);
    onClose();
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
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <GlassCard className="w-full max-w-xl max-h-[90vh] overflow-y-auto" hover={false}>
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                <h2 className="text-2xl font-bold text-[#4B2E2B]">{t('bulkImport')}</h2>
                <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('csv')}
                  className={`flex-1 py-3 font-semibold flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'csv' ? 'text-[#4B2E2B] border-b-2 border-[#4B2E2B] bg-[#FFF8F0]' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Upload className="w-4 h-4" /> Offline CSV
                </button>
                <button
                  onClick={() => setActiveTab('hotfolder')}
                  className={`flex-1 py-3 font-semibold flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'hotfolder' ? 'text-[#138808] border-b-2 border-[#138808] bg-green-50/30' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <FolderSync className="w-4 h-4" /> Network Hot Folder
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'csv' ? (
                  !result ? (
                    <>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                          isDragging ? 'border-[#138808] bg-[#138808]/5' : 'border-gray-300 bg-white/50 hover:border-gray-400'
                        }`}
                      >
                        <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" id="csv-upload" />
                        <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                            isDragging ? 'bg-[#138808]/10' : 'bg-[#4B2E2B]/10'
                          }`}>
                            <Upload className={`w-8 h-8 ${isDragging ? 'text-[#138808]' : 'text-[#4B2E2B]'}`} />
                          </div>
                          <p className="text-lg font-medium text-gray-700 mb-2">{t('dragDropCSV')}</p>
                          <p className="text-sm text-gray-500 hover:text-[#4B2E2B] transition-colors underline">Click to browse files instead</p>
                          <p className="text-xs text-gray-400 mt-2">Supports: .csv files up to 10MB</p>
                        </label>
                      </div>

                      {isUploading && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Uploading and Parsing...</span>
                            <span className="text-sm font-bold text-[#138808]">{uploadProgress}%</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                              className="h-full bg-[#138808] rounded-full"
                              transition={{ duration: 0.2 }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#138808]/10 rounded-xl p-4 text-center border border-[#138808]/20">
                          <FileCheck className="w-8 h-8 text-[#138808] mx-auto mb-2" />
                          <p className="text-3xl font-bold text-[#138808]">{result.success}</p>
                          <p className="text-sm text-gray-600 font-medium">{t('successfullyImported')}</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                          <p className="text-3xl font-bold text-red-500">{result.errors}</p>
                          <p className="text-sm text-gray-600 font-medium">{t('errors')}</p>
                        </div>
                      </div>
                      {result.errors > 0 && (
                        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                          <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Error Details</h4>
                          <ul className="space-y-1">
                            {result.errorDetails.map((err, i) => (
                              <li key={i} className="text-sm text-red-600 flex items-start gap-2"><span className="text-red-400 mt-0.5">•</span>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <motion.button onClick={handleClose} className="w-full btn-saffron flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" /> {t('close')}
                      </motion.button>
                    </motion.div>
                  )
                ) : (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-800 text-sm">
                      <Settings className="w-5 h-5 flex-shrink-0" />
                      <p>Point to a network folder or local directory. When new digital documents are placed there, the system will automatically upload, assign the department, and sync the catalog.</p>
                    </div>

                    <form onSubmit={handleConfigureHotFolder} className="space-y-5">
                      {/* Integrated Browse Input for Hot Folder */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Network Folder Path (UNC / Local URI) <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={folderPath}
                            onChange={(e) => setFolderPath(e.target.value)}
                            required
                            placeholder="\\server\library\new_acquisitions"
                            className="flex-1 w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm transition-colors focus:outline-none focus:border-[#138808] focus:ring-1 focus:ring-[#138808]"
                          />
                          <input 
                            type="file" 
                            ref={folderInputRef} 
                            /* @ts-expect-error - webkitdirectory is non-standard but widely supported in modern browsers */
                            webkitdirectory=""
                            className="hidden" 
                            onChange={handleFolderSelect}
                          />
                          <button
                            type="button"
                            onClick={() => folderInputRef.current?.click()}
                            className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 transition-colors flex items-center gap-2 shrink-0 shadow-sm"
                          >
                            <FolderSearch className="w-4 h-4" /> Browse...
                          </button>
                        </div>
                      </div>

                      <FormSelect 
                        label="Target Department for these files" 
                        value={targetDept} 
                        onChange={(e) => setTargetDept(e.target.value)} 
                        options={[{ value: '', label: 'Select Department' }, ...deptOpts]} 
                        required 
                      />
                      <FormSelect 
                        label="Target Category" 
                        value={targetCat} 
                        onChange={(e) => setTargetCat(e.target.value)} 
                        options={[{ value: '', label: 'Select Category' }, ...catOpts]} 
                        required 
                      />
                      <FormInput 
                        label="Default Rental Price (₹)" 
                        type="number" 
                        value={defaultPrice} 
                        onChange={(e) => setDefaultPrice(e.target.value)} 
                        required 
                        placeholder="0 for free documents" 
                      />

                      <button type="submit" className="w-full btn-primary bg-[#138808] hover:bg-green-700 mt-4 flex justify-center items-center gap-2 shadow-lg shadow-[#138808]/20">
                        <FolderSync className="w-5 h-5" /> Establish Hot Folder Sync Link
                      </button>
                    </form>

                    {hotFolderConfig?.isActive && (
                      <div className="border-t border-gray-200 pt-6 mt-6 text-center">
                        <h4 className="font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5 text-[#138808]" /> Active Link Status
                        </h4>
                        <p className="text-sm text-gray-500 mb-4">Tracking: <code className="bg-gray-100 px-2 py-1 rounded border border-gray-200 text-gray-700">{hotFolderConfig.folderPath}</code></p>
                        <div className="flex justify-center items-center gap-4 text-sm font-medium">
                           <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-gray-700 shadow-sm">
                             Total Synced: <span className="text-[#138808] text-base font-bold ml-1">{hotFolderConfig.totalSynced}</span>
                           </div>
                           <button onClick={triggerHotFolderSync} className="text-[#138808] font-bold hover:underline">
                             Trigger Manual Sync Cycle
                           </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}