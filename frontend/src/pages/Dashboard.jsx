import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

// Import the new components
import UploadArea from '../components/UploadArea';
import FileListControls from '../components/FileListControls';
import FileTable from '../components/FileTable';

// Existing Modal Imports
import FileViewerModal from '../components/FileViewerModal';
import ConfirmationModal from '../components/ConfirmationModal';
import ShareModal from '../components/ShareModal';
import RenameModal from '../components/RenameModal';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    
    // --- CORE STATE ---
    const [files, setFiles] = useState([]);
    const [selectedFileIds, setSelectedFileIds] = useState([]);
    
    // --- UPLOAD STATE ---
    const [uploading, setUploading] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState([]);
    const lastProgressUpdateTime = useRef(0); 

    // --- PAGINATION, SEARCH & SORT STATE ---
    const [searchTerm, setSearchTerm] = useState(''); 
    const [currentPage, setCurrentPage] = useState(1); 
    // 💡 FIX: Changed default limit from 20 to 10
    const [limit, setLimit] = useState(10); 
    const [totalCount, setTotalCount] = useState(0); 
    const [totalPages, setTotalPages] = useState(1); 
    
    // NEW SORTING STATE
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');

    // --- MODAL STATE ---
    const [viewingFile, setViewingFile] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [fileToDeleteId, setFileToDeleteId] = useState(null);
    const [isBulkDelete, setIsBulkDelete] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [fileToShare, setFileToShare] = useState(null);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [fileToRename, setFileToRename] = useState(null);

    // -------------------------------------------------------------------------
    // 1. FETCH FILES (WITH SORTING)
    // -------------------------------------------------------------------------
    const fetchFiles = useCallback(async (searchQuery = searchTerm, page = currentPage, limitValue = limit) => {
        try {
            let url = `/files?page=${page}&limit=${limitValue}`;
            if (searchQuery) {
                url += `&search=${encodeURIComponent(searchQuery)}`;
            }
            // APPLY SORTING PARAMETERS
            url += `&sortBy=${sortBy}&sortDirection=${sortDirection}`;
                
            const res = await api.get(url);
            
            const { files: fetchedFiles, totalCount, totalPages, page: returnedPage, limit: returnedLimit } = res.data;
            
            setFiles(fetchedFiles);
            setTotalCount(totalCount);
            setTotalPages(totalPages);
            setCurrentPage(returnedPage); 
            setLimit(returnedLimit); 
            
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch files.');
        }
    }, [searchTerm, currentPage, limit, sortBy, sortDirection]);

    useEffect(() => {
        // Run fetch on mount and whenever dependencies change
        fetchFiles(searchTerm, currentPage, limit);
        setSelectedFileIds([]); // Clear selection on fetch
    }, [fetchFiles]);

    // -------------------------------------------------------------------------
    // 2. FILE CONTROL HANDLERS (Search, Limit, Page, Sort)
    // -------------------------------------------------------------------------

    const handleLimitChange = (e) => {
        setLimit(parseInt(e.target.value));
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };
    
    const handleClearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        const [newSortBy, newSortDirection] = e.target.value.split(':');
        setSortBy(newSortBy);
        setSortDirection(newSortDirection);
        setCurrentPage(1); // Reset to page 1 when sorting changes
    };

    // -------------------------------------------------------------------------
    // 3. UPLOAD LOGIC
    // -------------------------------------------------------------------------

    const processFilesUpload = async (filesToUpload) => {
        if (filesToUpload.length === 0) return;

        setUploading(true);
        
        const initialFilesState = filesToUpload.map(file => ({
            id: uuidv4(),
            fileName: file.name,
            progress: 0,
            status: 'Pending',
            file,
        }));
        setUploadingFiles(initialFilesState);
        
        const uploadPromises = initialFilesState.map(({ id, file }) => {
            const formData = new FormData();
            formData.append('files', file); 

            return api.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    const now = Date.now();
                    
                    if (percentCompleted === 100 || percentCompleted === 0 || (now - lastProgressUpdateTime.current > 100)) {
                        setUploadingFiles(prevFiles => prevFiles.map(f => {
                            if (f.id === id) {
                                return { 
                                    ...f, 
                                    progress: percentCompleted, 
                                    status: percentCompleted === 100 ? 'Processing...' : 'Uploading' 
                                };
                            }
                            return f;
                        }));
                        if (percentCompleted < 100) lastProgressUpdateTime.current = now;
                    }
                },
            })
            .then(res => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        setUploadingFiles(prevFiles => prevFiles.map(f => {
                            if (f.id === id) {
                                return { ...f, progress: 100, status: 'Success' };
                            }
                            return f;
                        }));
                        resolve({ status: 'fulfilled', message: res.data.message });
                    }, 700);
                });
            })
            .catch(error => {
                const errorMessage = error.response?.data?.message || 'Network Error';
                setUploadingFiles(prevFiles => prevFiles.map(f => {
                    if (f.id === id) {
                        return { ...f, progress: 0, status: `Failed: ${errorMessage}` };
                    }
                    return f;
                }));
                return { status: 'rejected', error: errorMessage }; 
            });
        });

        const results = await Promise.allSettled(uploadPromises);

        setUploading(false);
        // Ensure the fetch call uses the current (and now corrected) default limit
        fetchFiles(searchTerm, currentPage, limit); 
        
        const successfulUploads = results.filter(r => r.status === 'fulfilled').length;
        if (successfulUploads > 0) {
            toast.success(`${successfulUploads} of ${filesToUpload.length} file(s) uploaded successfully!`);
        } else if (results.length > 0) {
             toast.error(`All ${filesToUpload.length} uploads failed. Please check the logs.`);
        }
        
        setTimeout(() => {
            setUploadingFiles([]);
        }, 5000); 
    };

    // UPLOAD HANDLERS
    const handleFileUpload = (e) => {
        e.preventDefault();
        
        let filesToUpload = [];
        if (e.target && e.target.files) {
            filesToUpload = Array.from(e.target.files);
        } else {
            const fileInput = document.getElementById('file-upload-input');
            filesToUpload = Array.from(fileInput.files);
        }

        if (filesToUpload.length === 0) {
            toast.error('Please select at least one file.');
            return;
        }
        
        if (e.target) {
            e.target.value = null; 
        }

        processFilesUpload(filesToUpload);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('dragging');
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('dragging');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('dragging');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFilesUpload(Array.from(e.dataTransfer.files));
        }
    };
    
    // -------------------------------------------------------------------------
    // 4. MODAL/ACTION HANDLERS (File Operations)
    // -------------------------------------------------------------------------

    const toggleFileSelection = (fileId) => {
        setSelectedFileIds(prevSelected => prevSelected.includes(fileId) ? prevSelected.filter(id => id !== fileId) : [...prevSelected, fileId]);
    };
    const handleView = (file) => setViewingFile(file);
    const handleCloseModal = () => setViewingFile(null);
    const handleShare = (file) => { setFileToShare(file); setIsShareModalOpen(true); };
    const handleCloseShareModal = () => { setIsShareModalOpen(false); setFileToShare(null); };
    const handleRename = (file) => { setFileToRename(file); setIsRenameModalOpen(true); };
    const handleCloseRenameModal = () => { setIsRenameModalOpen(false); setFileToRename(null); };
    const handleDelete = (fileId) => { setFileToDeleteId(fileId); setIsBulkDelete(false); setIsConfirmModalOpen(true); };
    const handleCloseConfirmModal = () => { setIsConfirmModalOpen(false); setFileToDeleteId(null); setIsBulkDelete(false); };
    
    const handleBulkDelete = () => {
        if (selectedFileIds.length === 0) {
            toast.error('No files selected for deletion.');
            return;
        }
        setIsBulkDelete(true);
        setFileToDeleteId(null);
        setIsConfirmModalOpen(true);
    };

    const confirmRename = async (fileId, newFileName) => {
        try {
            await api.patch(`/files/rename/${fileId}`, { newFileName });
            toast.success(`File renamed successfully!`);
            fetchFiles(searchTerm, currentPage, limit);
        } catch (err) {
            toast.error(err.response?.data?.message || 'File renaming failed.');
        } finally {
            handleCloseRenameModal();
        }
    };

    const confirmDelete = async () => {
        setIsConfirmModalOpen(false); 

        try {
            let deletedCount = 0;
            if (isBulkDelete) {
                const res = await api.post('/files/delete-many', { fileIds: selectedFileIds });
                deletedCount = res.data.deletedCount;
                toast.success(res.data.message);
                setSelectedFileIds([]);
            } else if (fileToDeleteId) {
                await api.delete(`/files/${fileToDeleteId}`);
                deletedCount = 1;
                toast.success('File deleted successfully.');
            } else {
                toast.error('Deletion logic error.');
                return;
            }
            
            const newTotalCount = totalCount - deletedCount;
            const maxPage = Math.max(1, Math.ceil(newTotalCount / limit));

            if (currentPage > maxPage && newTotalCount > 0) {
                setCurrentPage(maxPage);
            } else if (newTotalCount === 0) {
                fetchFiles(searchTerm, 1, limit); 
            } else {
                fetchFiles(searchTerm, currentPage, limit);
            }

        } catch (err) {
            toast.error(err.response?.data?.message || 'Deletion failed.');
        } finally {
            setFileToDeleteId(null);
            setIsBulkDelete(false);
        }
    };

    const fileForConfirmation = files.find(f => f._id === fileToDeleteId);

    // -------------------------------------------------------------------------
    // 5. RENDER
    // -------------------------------------------------------------------------

    return (
        <div className="container">
            <nav className="navbar navbar-expand-lg navbar-light bg-light rounded-3 shadow-sm">
                <div className="container-fluid">
                    <span className="navbar-brand">Welcome, {user.userName}</span>
                    <button className="btn btn-danger" onClick={logout}>Logout</button>
                </div>
            </nav>

            <UploadArea 
                uploading={uploading} 
                uploadingFiles={uploadingFiles}
                handleFileUpload={handleFileUpload}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
            />

            {/* RESPONSIVE CONTROLS ROW */}
            <div className="row g-3 align-items-center mb-4 mt-3">
                
                {/* === COLUMN 1: SEARCH BAR === */}
                <div className="col-12 col-md-4">
                    <div className="input-group">
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <button 
                            className="btn btn-outline-secondary" 
                            type="button" 
                            onClick={handleClearSearch}
                            disabled={!searchTerm}
                        >
                            &times;
                        </button>
                    </div>
                </div>
                
                {/* === COLUMN 2: OTHER CONTROLS === */}
                <div className="col-12 col-md-8 d-flex flex-wrap justify-content-md-end justify-content-start align-items-center">
                    <FileListControls 
                        totalCount={totalCount}
                        selectedFileCount={selectedFileIds.length}
                        uploading={uploading}
                        limit={limit}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onLimitChange={handleLimitChange}
                        onSortChange={handleSortChange}
                        onBulkDelete={handleBulkDelete}
                    />
                </div>
            </div>
            {/* END RESPONSIVE CONTROLS ROW */}


            <div className="row">
                <div className="col-12">
                    
                    <FileTable 
                        files={files}
                        totalCount={totalCount}
                        searchTerm={searchTerm}
                        selectedFileIds={selectedFileIds}
                        currentPage={currentPage}
                        limit={limit}
                        totalPages={totalPages}
                        toggleFileSelection={toggleFileSelection}
                        handleView={handleView}
                        handleShare={handleShare}
                        handleRename={handleRename}
                        handleDelete={handleDelete}
                        handlePageChange={handlePageChange} 
                    />
                </div>
            </div>

            {/* MODALS */}
            <FileViewerModal file={viewingFile} show={!!viewingFile} onClose={handleCloseModal} />
            <ShareModal file={fileToShare} show={isShareModalOpen} onClose={handleCloseShareModal} />
            <RenameModal file={fileToRename} show={isRenameModalOpen} onClose={handleCloseRenameModal} onRename={confirmRename} />
            <ConfirmationModal 
                show={isConfirmModalOpen}
                title={isBulkDelete ? 'Confirm Bulk Deletion' : 'Confirm File Deletion'}
                body={isBulkDelete 
                    ? `Are you sure you want to delete the ${selectedFileIds.length} selected file(s)?` 
                    : `Are you sure you want to delete the file "${fileForConfirmation?.fileName || 'this file'}"?`}
                onConfirm={confirmDelete}
                onCancel={handleCloseConfirmModal}
            />
        </div>
    );
};

export default Dashboard;