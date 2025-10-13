import React from 'react';
// 💡 CRITICAL CHANGE: Import Bootstrap components from react-bootstrap
import Dropdown from 'react-bootstrap/Dropdown';

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
            
            {/* 1. File Info Section: Takes up maximum space */}
            <div 
                className="d-flex align-items-center flex-grow-1" 
                onClick={() => toggleSelection(file._id)} 
                style={{ cursor: 'pointer', minWidth: 0 }}
            >
                <input 
                    type="checkbox" 
                    className="form-check-input me-3" 
                    checked={isSelected} 
                    onChange={() => toggleSelection(file._id)}
                    style={{ cursor: 'pointer', transform: 'scale(1.3)' }}
                    onClick={(e) => e.stopPropagation()} 
                />
                <span onClick={() => handleView(file)} className="me-3"> 
                    {renderFilePreview(file)}
                </span>
                
                {/* FILENAME CONTAINER: Uses flex-grow-1 and relies on text-truncate */}
                <div 
                    className="align-self-center flex-grow-1"
                    style={{ minWidth: 0 }} 
                >
                    <span className="fw-bold d-block text-truncate">{file.fileName}</span> 
                    <small className="text-muted d-block">
                        {formatFileSize(file.size)} | {new Date(file.createdAt).toLocaleDateString()}
                    </small>
                </div>
            </div>
            
            {/* 2. Action Buttons: CONSOLIDATED INTO REACT-BOOTSTRAP DROPDOWN */}
            <Dropdown align="end" onClick={(e) => e.stopPropagation()}>
                {/* The Dropdown.Toggle is the button that opens the menu */}
                <Dropdown.Toggle variant="light" size="sm" id={`dropdown-basic-${file._id}`} className="p-1">
                    <span className="fs-5">⋮</span> {/* Three vertical dots (Kebab menu icon) */}
                </Dropdown.Toggle>

                {/* The Dropdown.Menu contains the list of actions */}
                <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleView(file)}>View</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleRename(file)}>Rename</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleShare(file)}>Share</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item className="text-danger" onClick={() => handleDelete(file._id)}>
                        Delete
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </li>
    );
};

export default FileListItem;