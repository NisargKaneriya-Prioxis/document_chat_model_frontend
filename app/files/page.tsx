"use client"; 

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { File, Trash, Loader2, ArrowLeft, FileText, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { deleteFile, fetchFiles, deleteAllFiles } from '../../api/chatService'; 

const FileDashboard = () => {
  const router = useRouter();
  
  const [files, setFiles] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);


  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchFiles();
      setFiles(data.files);
      setTotalCount(data.count);
    } catch (err) {
      setError("Failed to fetch file list.");
    } finally {
      setIsLoading(false);
    }
  };

  // Single File Deletion Logic 
  const requestDelete = (fileName: string) => setFileToDelete(fileName);
  
  const confirmDelete = async () => {
    if (!fileToDelete) return;
    const fileName = fileToDelete;
    setFileToDelete(null); 
    setDeletingFile(fileName); 

    try {
      await deleteFile(fileName);
      setFiles((prev) => prev.filter((f) => f !== fileName));
      setTotalCount((prev) => prev - 1);
    } catch (err) {
      alert("Failed to delete file.");
    } finally {
      setDeletingFile(null);
    }
  };

  // Delete All Logic 
  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      const result = await deleteAllFiles();
      setFiles([]);
      setTotalCount(0);
      setShowResetModal(false); // Close modal
      alert(`System Reset Complete. Deleted ${result.details.deleted_files_count} files.`);
      
    } catch (err) {
      alert("System reset failed. Check console.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      
      {/* SINGLE FILE DELETE MODAL */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
             <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete File?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-800">"{fileToDelete}"</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setFileToDelete(null)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ALL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-900/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border-2 border-red-100 animate-in fade-in zoom-in duration-200">
             <div className="flex items-center gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-red-700">Sure to Delete ?</h3>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              This will permanently delete <span className="font-bold text-gray-900">{totalCount} files</span> and wipe the entire AI memory/cache.
            </p>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowResetModal(false)} 
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                disabled={isResetting}
              >
                Cancel
              </button>
              
              <button 
                onClick={handleConfirmReset} 
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
                disabled={isResetting}
              >
                {isResetting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">File Manager</h1>
              {!isLoading && !error && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold border border-purple-200">
                  {totalCount} {totalCount === 1 ? 'file' : 'files'}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">Manage your uploaded documents</p>
          </div>
        </div>

        {/* DELETE ALL BUTTON */}
        {files.length > 0 && (
          <button 
            onClick={() => setShowResetModal(true)}
            className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Trash size={16} />
            Delete All Files
          </button>
        )}
      </div>

      {/*  MAIN TABLE CONTENT */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {isLoading && (
          <div className="p-12 text-center text-gray-500">
            <Loader2 size={40} className="animate-spin mx-auto mb-4 text-purple-600" />
            <p>Loading files...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="p-12 text-center text-red-500 bg-red-50">
            <p>{error}</p>
            <button onClick={loadFiles} className="mt-4 underline">Try Again</button>
          </div>
        )}

        {!isLoading && !error && totalCount === 0 && (
          <div className="p-12 text-center text-gray-400">
            <File size={48} className="mx-auto mb-4 opacity-20" />
            <p>No files found.</p>
          </div>
        )}

        {!isLoading && !error && files.length > 0 && (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                  <th className="px-6 py-4">Document Name</th>
                  <th className="px-6 py-4 w-32 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {files.map((file, index) => {
                  const isDeleting = deletingFile === file;
                  return (
                    <tr key={index} className="hover:bg-purple-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <FileText size={20} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium transition-colors ${isDeleting ? 'text-gray-400' : 'text-gray-700'}`}>
                              {file}
                            </span>
                            {isDeleting && (
                              <span className="text-xs text-red-500 italic animate-pulse">Deleting...</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isDeleting ? (
                          <div className="flex justify-center">
                            <Loader2 size={18} className="animate-spin text-red-500" />
                          </div>
                        ) : (
                          <button
                            onClick={() => requestDelete(file)}
                            disabled={deletingFile !== null} 
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                          >
                            <Trash size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-right text-xs text-gray-500">
              Showing {files.length} of {totalCount} total documents
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileDashboard;