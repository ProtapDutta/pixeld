import React, { useState, useCallback } from 'react';
import { Button, Form, ProgressBar, Card, ListGroup } from 'react-bootstrap';
import toast from 'react-hot-toast';
import UploadArea from '../components/UploadArea';
import api from '../api/axios.js';

const VERCEL_UPLOAD_LIMIT = 4.5 * 1024 * 1024; // 4.5MB in bytes

const initialFileStatus = {
    progress: 0,
    status: 'Pending',
    id: null,
    error: null,
};

const Upload = () => {
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [fileStatuses, setFileStatuses] = useState({});
    const [uploading, setUploading] = useState(false);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        handleFileSelection(files);
    }, []);

    const handleFileSelection = useCallback((files) => {
        let tooLarge = false;
        const filteredFiles = Array.from(files).filter(file => {
            if (file.size > VERCEL_UPLOAD_LIMIT) {
                tooLarge = true;
                return false;
            }
            return true;
        });

        if (tooLarge) toast.error('Each file must be under 4.5MB (Vercel limit).');

        setFilesToUpload(prevFiles => {
            const existing = new Set(prevFiles.map(f => f.name));
            const uniqueFiles = [...prevFiles, ...filteredFiles.filter(f => !existing.has(f.name))];
            uniqueFiles.forEach(f =>
                setFileStatuses(prev => ({
                    ...prev,
                    [f.name]: prev[f.name] || { ...initialFileStatus }
                }))
            );
            return uniqueFiles;
        });
    }, []);

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (filesToUpload.length === 0) return toast.error("Please select files to upload.");

        setUploading(true);

        const filesToProcess = filesToUpload.filter(file =>
            fileStatuses[file.name]?.status !== 'Success'
        );

        await Promise.all(filesToProcess.map(file => {
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
                onUploadProgress: progressEvent => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setFileStatuses(prev => ({
                        ...prev,
                        [file.name]: { ...prev[file.name], progress: percent, status: 'Uploading' }
                    }));
                }
            })
                .then(response => {
                    setFileStatuses(prev => ({
                        ...prev,
                        [file.name]: {
                            ...prev[file.name],
                            progress: 100,
                            status: 'Success',
                            id: response.data._id,
                            error: null
                        }
                    }));
                    toast.success(`${file.name}: Upload succeeded!`);
                })
                .catch(error => {
                    let errMsg = error.response?.data?.message || 'Upload failed.';
                    if (
                        error.response?.status === 413 ||
                        errMsg.toLowerCase().includes('payload too large') ||
                        errMsg.toLowerCase().includes('file too large')
                    ) {
                        errMsg = `${file.name}: File is too large (Vercel limit: 4.5MB)`;
                    }
                    setFileStatuses(prev => ({
                        ...prev,
                        [file.name]: {
                            ...prev[file.name],
                            status: 'Error',
                            error: errMsg,
                            progress: 0
                        }
                    }));
                    toast.error(errMsg);
                });
        }));
        setUploading(false);
    };

    const handleDragOver = (e) => e.preventDefault();
    const handleDragLeave = (e) => e.preventDefault();

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Upload Files</h2>

            <UploadArea
                uploading={uploading}
                uploadingFiles={filesToUpload.map(file => ({
                    id: file.name,
                    fileName: file.name,
                    status: fileStatuses[file.name]?.status || 'Pending',
                    progress: fileStatuses[file.name]?.progress || 0
                }))}
                handleFileUpload={handleFileUpload}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
            />

            {/* Status cards/list gets handled inside your UploadArea already */}
        </div>
    );
};

export default Upload;
