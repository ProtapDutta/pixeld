import React from 'react';

// UploadStatusItem is a sub-component that should be defined here or in its own file
const UploadStatusItem = ({ file }) => {
    let barClass = 'bg-primary';
    let statusIcon = '⏳';
    
    if (file.status.includes('Processing')) {
        barClass = 'bg-warning text-dark';
        statusIcon = '⚙️';
    } else if (file.status.includes('Success')) {
        barClass = 'bg-success';
        statusIcon = '✅';
    } else if (file.status.includes('Failed')) {
        barClass = 'bg-danger';
        statusIcon = '❌';
    }

    return (
        <li className="list-group-item d-flex flex-column py-2">
            <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-bold text-truncate" style={{ maxWidth: '70%' }}>
                    {statusIcon} {file.fileName}
                </span>
                <span className={`badge ${file.status.includes('Failed') ? 'bg-danger' : 'bg-secondary'}`}>
                    {file.status}
                </span>
            </div>
            <div className="progress" style={{ height: '15px' }}>
                <div 
                    className={`progress-bar ${barClass}`}
                    role="progressbar" 
                    style={{ width: `${file.progress}%`, transition: 'width 0.2s ease-in-out' }} 
                    aria-valuenow={file.progress} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                >
                    {file.progress > 0 && file.progress < 100 && `${file.progress}%`}
                    {file.progress === 100 && file.status.includes('Processing') && 'Processing...'}
                </div>
            </div>
        </li>
    );
};

const UploadArea = ({ uploading, uploadingFiles, handleFileUpload, handleDragOver, handleDragLeave, handleDrop }) => {
    return (
        <div className="row mb-4">
            <div className="col-12">
                <div 
                    className={`card shadow-sm ${uploading ? 'bg-light' : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragLeave={handleDragLeave}
                    style={{ border: uploading ? '2px dashed #007bff' : '2px dashed transparent' }}
                >
                    <div className="card-header">
                        <h5>Upload New File(s)</h5>
                        <small className="text-muted">Drag & Drop files anywhere in this box or click to select.</small>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleFileUpload} className="d-flex flex-column">
                            <div className="d-flex align-items-center mb-3">
                                <input 
                                    type="file" 
                                    className="form-control me-2" 
                                    id="file-upload-input"
                                    multiple 
                                    disabled={uploading}
                                    required 
                                />
                                <button type="submit" className="btn btn-success" disabled={uploading}>
                                    {uploading ? 'Uploading...' : 'Upload File(s)'}
                                </button>
                            </div>
                        </form>

                        {/* Individual Upload Status Display */}
                        {uploadingFiles.length > 0 && (
                            <div className="mt-3">
                                <h6 className="mb-2">Active Uploads:</h6>
                                <ul className="list-group">
                                    {uploadingFiles.map(file => (
                                        <UploadStatusItem key={file.id} file={file} />
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadArea;