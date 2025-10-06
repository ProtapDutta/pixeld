// frontend/src/pages/Upload.jsx

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone'; 
import { Button, Form, ProgressBar, Alert, Card, ListGroup } from 'react-bootstrap';
import api from '../api/axios.js'; // Using your correct import path
import toast from 'react-hot-toast';

// Define the initial status for a file
const initialFileStatus = {
    progress: 0,
    status: 'Pending', // Pending, Uploading, Success, Error
    id: null, // Will store the MongoDB ID after successful upload
    error: null,
};

const Upload = () => {
    // filesToUpload: List of File objects received from dropzone
    const [filesToUpload, setFilesToUpload] = useState([]); 
    
    // fileStatuses: Map of file names to their upload status
    const [fileStatuses, setFileStatuses] = useState({}); 

    const [uploading, setUploading] = useState(false);
    // Removed unused uploadError state
    const navigate = useNavigate();

    // Use useCallback for dropzone configuration
    const onDrop = useCallback((acceptedFiles) => {
        setFilesToUpload(prevFiles => {
            const newFilesMap = new Map();
            
            // Collect existing files
            prevFiles.forEach(file => newFilesMap.set(file.name, file));

            // Add new files, ensuring no duplicates and initializing status
            acceptedFiles.forEach(file => {
                if (!newFilesMap.has(file.name)) {
                    newFilesMap.set(file.name, file);
                    // Initialize the status for the new file
                    setFileStatuses(prev => ({
                        ...prev,
                        [file.name]: { ...initialFileStatus }
                    }));
                }
            });

            return Array.from(newFilesMap.values());
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
    });

    // Helper to calculate total successful uploads
    const successfulUploads = useMemo(() => {
        return Object.values(fileStatuses).filter(s => s.status === 'Success').length;
    }, [fileStatuses]);
    
    // Helper to calculate total errors
    const errorUploads = useMemo(() => {
        return Object.values(fileStatuses).filter(s => s.status === 'Error').length;
    }, [fileStatuses]);

    // Function to remove a file from the list
    const removeFile = (fileName) => {
        setFilesToUpload(prevFiles => prevFiles.filter(file => file.name !== fileName));
        setFileStatuses(prevStatuses => {
            const newStatuses = { ...prevStatuses };
            delete newStatuses[fileName];
            return newStatuses;
        });
    };

    // --- File Upload Handler ---
    const handleUpload = async (e) => {
        e.preventDefault();

        if (filesToUpload.length === 0) {
            return toast.error("Please select files to upload.");
        }

        setUploading(true);

        // Filter files to only include those that are Pending or Error
        const filesToProcess = filesToUpload.filter(file => 
            fileStatuses[file.name]?.status !== 'Success'
        );

        const uploadPromises = filesToProcess.map(file => {
            
            // Set initial uploading status for files being processed
            setFileStatuses(prev => ({
                ...prev,
                [file.name]: { ...initialFileStatus, status: 'Uploading' }
            }));

            const formData = new FormData();
            formData.append('file', file); 

            return api.post('/files/upload', formData, { 
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                // Real-time progress update for the current file
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setFileStatuses(prev => ({
                        ...prev,
                        [file.name]: { 
                            ...prev[file.name], 
                            progress: percent,
                            status: 'Uploading' 
                        }
                    }));
                },
            })
            .then(response => {
                // Success
                setFileStatuses(prev => ({
                    ...prev,
                    [file.name]: { 
                        ...prev[file.name], 
                        progress: 100, 
                        status: 'Success',
                        id: response.data._id,
                    }
                }));
            })
            .catch(error => {
                // Error
                const errMsg = error.response?.data?.message || 'Upload failed.';
                setFileStatuses(prev => ({
                    ...prev,
                    [file.name]: { 
                        ...prev[file.name], 
                        status: 'Error',
                        error: errMsg,
                        progress: 0 
                    }
                }));
                return Promise.resolve(); // Ensure Promise.all resolves even if one file fails
            });
        });

        await Promise.all(uploadPromises); 

        setUploading(false);
    };
    // --- End File Upload Handler ---

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Upload Files</h2>

            <Card className="p-4 mb-4">
                <div 
                    {...getRootProps()} 
                    style={{
                        border: `2px dashed ${isDragActive ? '#007bff' : '#ced4da'}`,
                        padding: '40px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: isDragActive ? '#e9f2ff' : '#f8f9fa',
                        minHeight: '150px'
                    }}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p className="lead text-primary">Drop the files here...</p>
                    ) : (
                        <p className="lead">Drag 'n' drop some files here, or click to select files.</p>
                    )}
                    <small className="text-muted">Multiple files are supported.</small>
                </div>
            </Card>

            {filesToUpload.length > 0 && (
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5>Files Ready to Upload ({filesToUpload.length}):</h5>
                        {uploading && <span className="text-info">Uploading...</span>}
                        {!uploading && successfulUploads > 0 && (
                            <span className="text-success">
                                {successfulUploads} file(s) uploaded successfully!
                            </span>
                        )}
                        {!uploading && errorUploads > 0 && (
                            <span className="text-danger">
                                {errorUploads} file(s) failed to upload.
                            </span>
                        )}
                    </div>
                    
                    <ListGroup>
                        {filesToUpload.map((file, index) => {
                            const statusData = fileStatuses[file.name] || initialFileStatus;
                            let variant = 'primary';
                            if (statusData.status === 'Success') variant = 'success';
                            if (statusData.status === 'Error') variant = 'danger';
                            if (statusData.status === 'Pending') variant = 'secondary';

                            return (
                                <ListGroup.Item 
                                    key={index} 
                                    className="d-flex justify-content-between align-items-center"
                                >
                                    <div>
                                        <strong>{file.name}</strong> 
                                        <small className="text-muted ms-2">
                                            ({(file.size / 1024).toFixed(1)} KB)
                                        </small>
                                        
                                        {statusData.status === 'Error' && (
                                            <div className="text-danger small mt-1">
                                                Error: {statusData.error || 'Failed to connect.'}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ width: '50%', minWidth: '150px' }} className="d-flex align-items-center ms-3">
                                        {/* Renders the progress bar if the file is Uploading or has successfully completed (100%) */}
                                        {statusData.status === 'Uploading' || statusData.status === 'Success' ? (
                                            <ProgressBar 
                                                now={statusData.progress} 
                                                label={`${statusData.progress}%`}
                                                variant={variant}
                                                className="flex-grow-1 me-2"
                                                animated={statusData.status === 'Uploading'}
                                            />
                                        ) : (
                                             // Placeholder for Pending/Error to maintain layout
                                             <ProgressBar 
                                                now={statusData.progress} // 0%
                                                label={`${statusData.progress}%`}
                                                variant={variant}
                                                className="flex-grow-1 me-2"
                                                style={{ visibility: 'hidden' }} // Keep space but hide content for pending
                                             />
                                        )}
                                        
                                        {/* Status Text / Button */}
                                        <span className={`text-${variant} me-2 text-capitalize`} style={{ minWidth: '70px' }}>
                                            {statusData.status}
                                        </span>
                                        <Button 
                                            variant="danger" 
                                            size="sm" 
                                            onClick={() => removeFile(file.name)}
                                            // Disable removal if currently uploading OR if already successful
                                            disabled={uploading || statusData.status === 'Success'} 
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </ListGroup.Item>
                            );
                        })}
                    </ListGroup>
                </div>
            )}

            <Form onSubmit={handleUpload}>
                <div className="d-flex justify-content-between mt-4">
                    <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                        Go to Dashboard
                    </Button>
                    <Button 
                        variant="primary" 
                        type="submit" 
                        // Disable if uploading or if all listed files have already succeeded
                        disabled={uploading || filesToUpload.length === successfulUploads}
                    >
                        {uploading ? 'Uploading...' : `Start Upload (${filesToUpload.length - successfulUploads} remaining)`}
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default Upload;