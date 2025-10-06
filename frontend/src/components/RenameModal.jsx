// frontend/src/components/RenameModal.jsx (NEW)

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

const RenameModal = ({ file, show, onClose, onRename }) => {
    const [newFileName, setNewFileName] = useState('');
    const [fileExtension, setFileExtension] = useState('');

    useEffect(() => {
        if (file) {
            const parts = file.fileName.split('.');
            if (parts.length > 1) {
                // Separate name from extension
                const extension = parts.pop();
                const nameWithoutExt = parts.join('.');
                setNewFileName(nameWithoutExt);
                setFileExtension(`.${extension}`);
            } else {
                // No extension found
                setNewFileName(file.fileName);
                setFileExtension('');
            }
        }
    }, [file]);

    const handleRenameSubmit = (e) => {
        e.preventDefault();
        
        if (!newFileName.trim()) {
            toast.error('File name cannot be empty.');
            return;
        }

        const finalNewName = newFileName.trim() + fileExtension;
        
        // Call the parent function which handles the API call
        onRename(file._id, finalNewName);
    };

    const handleClose = () => {
        setNewFileName(''); // Clear state on close
        onClose();
    }

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Rename File: {file?.fileName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleRenameSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>New File Name</Form.Label>
                        <div className="input-group">
                            <Form.Control
                                type="text"
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                placeholder="Enter new file name"
                                required
                            />
                            {fileExtension && (
                                <span className="input-group-text">{fileExtension}</span>
                            )}
                        </div>
                        <Form.Text className="text-muted">
                            The file extension **{fileExtension || ' (no extension)'}** will be preserved.
                        </Form.Text>
                    </Form.Group>
                    <div className="d-flex justify-content-end">
                        <Button variant="secondary" onClick={handleClose} className="me-2">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Confirm Rename
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default RenameModal;