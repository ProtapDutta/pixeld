import React from 'react';
import FileListItem from './FileListItem';

// Helper component for pagination buttons
const PaginationButtons = ({ currentPage, totalPages, handlePageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);

    if (currentPage === 1 && totalPages > 2) endPage = Math.min(totalPages, 3);
    if (currentPage === totalPages && totalPages > 2) startPage = Math.max(1, totalPages - 2);
    
    startPage = Math.max(1, startPage);
    endPage = Math.min(totalPages, endPage);

    for (let i = startPage; i <= endPage; i++) {
        pages.push(
            <li key={i} className={`page-item ${i === currentPage ? 'active' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(i)}>
                    {i}
                </button>
            </li>
        );
    }
    
    if (startPage > 1) {
        pages.unshift(<li key="ellipsis-start" className="page-item disabled"><span className="page-link">...</span></li>);
    }
    if (endPage < totalPages) {
        pages.push(<li key="ellipsis-end" className="page-item disabled"><span className="page-link">...</span></li>);
    }

    return (
        <ul className="pagination pagination-sm m-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                    Previous
                </button>
            </li>
            {pages}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                    Next
                </button>
            </li>
        </ul>
    );
};


const FileTable = ({ 
    files, totalCount, searchTerm, selectedFileIds, 
    currentPage, limit, totalPages,
    toggleFileSelection, handleView, handleShare, handleRename, handleDelete,
    handlePageChange
}) => {
    return (
        <>
            {/* Pagination Controls (Top) */}
            <div className="d-flex justify-content-end mb-3">
                <PaginationButtons 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    handlePageChange={handlePageChange} 
                />
            </div>

            {/* File List */}
            <ul className="list-group list-group-flush">
                {files.map(file => (
                    <FileListItem 
                        key={file._id}
                        file={file}
                        isSelected={selectedFileIds.includes(file._id)}
                        toggleSelection={toggleFileSelection}
                        handleView={handleView}
                        handleShare={handleShare}
                        handleRename={handleRename}
                        handleDelete={handleDelete}
                    />
                ))}
            </ul>

            {/* No Files Message */}
            {totalCount === 0 && (
                <div className="alert alert-info text-center mt-4">
                    {searchTerm 
                        ? `No files found matching "${searchTerm}".` 
                        : 'Your file list is currently empty. Upload a file to get started!'}
                </div>
            )}
            
            {/* File List Footer (Pagination and Count Summary) */}
            <div className="d-flex justify-content-between align-items-center mt-4 mb-5">
                <small className="text-muted">
                    {totalCount > 0 
                        ? `Showing files ${(currentPage - 1) * limit + 1} to ${Math.min(currentPage * limit, totalCount)} of ${totalCount}` 
                        : ''}
                </small>
                <PaginationButtons 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    handlePageChange={handlePageChange} 
                />
            </div>
        </>
    );
};

export default FileTable;