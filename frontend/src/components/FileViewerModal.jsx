// frontend/src/components/FileViewerModal.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const FileViewerModal = ({ file, show, onClose }) => {
    const [fileUrl, setFileUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Added dedicated error state

    // Fetches the decrypted file and creates a blob URL
    const fetchFileForViewing = useCallback(async (fileToView) => {
        if (!fileToView) return;

        setLoading(true);
        setError(null);
        setFileUrl(null); // Clear previous URL before fetching

        try {
            // Use the secure download route, which decrypts the file on the server.
            const response = await api.get(`/files/download/${fileToView._id}`, {
                responseType: 'blob', // IMPORTANT: Get the raw binary data as a Blob
            });

            // The content-type header from the response is the correct MIME type
            const mimeType = response.headers['content-type'] || fileToView.fileType;
            
            // 1. Create a Blob object from the response data
            const blob = new Blob([response.data], { type: mimeType });
            
            // 2. Create the Data URL for the browser to display
            const url = URL.createObjectURL(blob);
            setFileUrl(url);

        } catch (err) {
            console.error('File fetch or decryption failed:', err);
            const errorMessage = err.response?.data?.message || 'Failed to load file preview.';
            setError(errorMessage);
            toast.error(errorMessage);
            // Do NOT call onClose() here, allow the user to see the error message
        } finally {
            setLoading(false);
        }
    }, []); // This function is stable

    // Primary Effect Hook: Fetches file when modal opens or file changes
    useEffect(() => {
        if (show && file) {
            fetchFileForViewing(file);
        }
        
        // Cleanup function for the effect
        return () => {
             // Clean up the URL only if it was created by a previous successful run
             setFileUrl(prevUrl => {
                 if (prevUrl) {
                     URL.revokeObjectURL(prevUrl);
                 }
                 return null;
             });
        };
    }, [show, file, fetchFileForViewing]);


    if (!show || !file) {
        return null;
    }

    // Determine the viewer content based on MIME type
    const renderViewerContent = () => {
        if (loading) {
            return <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading and decrypting preview...</p>
            </div>;
        }
        
        if (error) {
             return <div className="alert alert-danger text-center p-5">
                 **Error loading preview:** {error}
             </div>;
        }

        if (!fileUrl) {
            return <div className="text-center p-5 text-warning">Preview not available.</div>;
        }

        const type = file.fileType.toLowerCase();

        if (type.startsWith('image/')) {
            return <img src={fileUrl} alt={file.fileName} style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', margin: 'auto' }} />;
        }
        if (type === 'application/pdf') {
            // Using the browser's built-in PDF viewer via iframe
            return <iframe src={fileUrl} title={file.fileName} style={{ width: '100%', height: '80vh', border: 'none' }} />;
        }
        if (type.startsWith('video/') || type.startsWith('audio/')) {
            // Browser's native media player
            const mediaTag = type.startsWith('video/') ? 'video' : 'audio';
            return React.createElement(mediaTag, { 
                src: fileUrl, 
                controls: true, 
                autoPlay: true, 
                style: { maxWidth: '100%', maxHeight: '80vh', display: 'block', margin: 'auto' } 
            });
        }
        
        return <div className="text-center p-5">Cannot display preview for type: **{file.fileType}**.</div>;
    };

    return (
        // Bootstrap Modal Structure (using your native HTML/CSS classes)
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{file.fileName}</h5>
                        {/* Use custom button for closing */}
                        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-0">
                        {renderViewerContent()}
                    </div>
                    <div className="modal-footer">
                        {/* Download link uses the generated Blob URL for a fast client-side download */}
                        <a href={fileUrl} download={file.fileName} className="btn btn-primary" disabled={!fileUrl}>
                            Download Now
                        </a>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileViewerModal;