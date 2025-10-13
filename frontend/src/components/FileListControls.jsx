import React from 'react';

const FileListControls = ({ 
    totalCount, selectedFileCount, uploading, 
    limit, sortBy, sortDirection,
    onLimitChange, onSortChange, onBulkDelete 
}) => {
    return (
        // Uses flex-wrap to ensure controls move to the next line if space runs out
        <div className="d-flex align-items-center flex-wrap"> 
            
            {/* Title and Bulk Delete */}
            <div className="d-flex align-items-center mb-2 me-3">
                <h4 className="mb-0 me-3">Your Files ({totalCount})</h4>
                <button 
                    className="btn btn-sm btn-danger" 
                    onClick={onBulkDelete}
                    disabled={selectedFileCount === 0 || uploading}
                >
                    Delete Selected ({selectedFileCount})
                </button>
            </div>
            
            {/* Limit and Sort Selects (Only remaining controls) */}
            <div className="d-flex align-items-center mb-2">
                {/* Limit Select */}
                <select 
                    className="form-select form-select-sm me-2" 
                    style={{ width: 'auto' }} 
                    value={limit} 
                    onChange={onLimitChange}
                >
                    <option value="10">10 / Page</option>
                    <option value="20">20 / Page</option>
                    <option value="30">30 / Page</option>
                </select>
                
                {/* SORTING SELECT */}
                <select 
                    className="form-select form-select-sm" 
                    style={{ width: 'auto' }}
                    value={`${sortBy}:${sortDirection}`} 
                    onChange={onSortChange} 
                >
                    <option disabled>Sort By:</option>
                    <option value="createdAt:desc">Date Uploaded (Newest)</option>
                    <option value="createdAt:asc">Date Uploaded (Oldest)</option>
                    <option value="fileName:asc">Name (A-Z)</option>
                    <option value="fileName:desc">Name (Z-A)</option>
                    <option value="size:desc">Size (Largest)</option>
                    <option value="size:asc">Size (Smallest)</option>
                    <option value="updatedAt:desc">Last Modified (Newest)</option>
                </select>
            </div>
        </div>
    );
};

export default FileListControls;