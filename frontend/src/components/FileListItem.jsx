import React from 'react';

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const renderFilePreview = (file) => {
    const baseStyle = { width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' };
    
    if (file.thumbnailUrl) {
        return (
            <img 
                src={file.thumbnailUrl} 
                alt="Preview" 
                className="me-3 rounded shadow-sm" 
                style={baseStyle} 
            />
        );
    }

    let icon = '📁';
    if (file.fileType.startsWith('image/')) icon = '🖼️';
    else if (file.fileType.startsWith('video/')) icon = '🎬';
    else if (file.fileType === 'application/pdf') icon = '📄';
    else if (file.fileType.includes('zip')) icon = '📦';
    else if (file.fileType.includes('text')) icon = '📝';

    return <span className="me-3 display-6" style={{ fontSize: '1.5rem', cursor: 'pointer' }}>{icon}</span>;
};


const FileListItem = ({ file, isSelected, toggleSelection, handleView, handleShare, handleRename, handleDelete }) => {
    return (
        <li 
            key={file._id} 
            className={`list-group-item d-flex justify-content-between align-items-center shadow-sm py-3 my-2 rounded ${isSelected ? 'list-group-item-secondary' : ''}`}
        >
            <div className="d-flex align-items-center flex-grow-1">
                <input 
                    type="checkbox" 
                    className="form-check-input me-3" 
                    checked={isSelected} 
                    onChange={() => toggleSelection(file._id)}
                    style={{ cursor: 'pointer', transform: 'scale(1.3)' }}
                />
                <span onClick={() => handleView(file)}>
                    {renderFilePreview(file)}
                </span>
                <div 
                    className="flex-grow-1 align-self-center"
                    style={{cursor: 'pointer'}} 
                    onClick={() => toggleSelection(file._id)} 
                >
                    <span className="fw-bold">{file.fileName}</span> 
                    <small className="text-muted d-block">
                        {formatFileSize(file.size)} | {new Date(file.createdAt).toLocaleDateString()}
                    </small>
                </div>
            </div>
            
            <div className="d-flex">
                <button 
                    className="btn btn-sm btn-secondary me-2" 
                    onClick={(e) => { e.stopPropagation(); handleRename(file); }}
                >
                    Rename
                </button>
                <button 
                    className="btn btn-sm btn-info me-2 text-white" 
                    onClick={(e) => { e.stopPropagation(); handleShare(file); }}
                >
                    Share
                </button>
                <button 
                    className="btn btn-sm btn-primary me-2" 
                    onClick={(e) => { e.stopPropagation(); handleView(file); }}
                >
                    View
                </button>
                <button 
                    className="btn btn-sm btn-danger" 
                    onClick={(e) => { e.stopPropagation(); handleDelete(file._id); }}
                >
                    Delete
                </button>
            </div>
        </li>
    );
};

export default FileListItem;