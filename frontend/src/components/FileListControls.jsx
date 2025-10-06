import React from 'react';

const FileListControls = ({ 
    totalCount, selectedFileCount, uploading, 
    limit, searchTerm, sortBy, sortDirection,
    onLimitChange, onSearchChange, onClearSearch, onSortChange, onBulkDelete 
}) => {
    return (
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
            
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
            
            {/* Search, Limit, and Sort Selects */}
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
                
                {/* 💡 SORTING SELECT */}
                <select 
                    className="form-select form-select-sm me-2" 
                    style={{ width: 'auto' }}
                    value={`${sortBy}:${sortDirection}`} // Combines both state values
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

                {/* Search Input with Clear Button */}
                <div className="input-group" style={{ width: '250px' }}>
                    <span className="input-group-text">🔍</span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search file name..."
                        value={searchTerm}
                        onChange={onSearchChange}
                        disabled={uploading}
                    />
                    {searchTerm && ( 
                        <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={onClearSearch}
                            disabled={uploading}
                            style={{ borderLeft: 0 }}
                        >
                            &times;
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileListControls;