// frontend/src/components/ShareModal.jsx (FIXED: Simplified Permanent Link Generation)

import React, { useState } from 'react'; 
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
// Removed unused imports: api, Spinner, useEffect

// 💡 CRITICAL: Update this to match your backend's base URL (e.g., VITE_API_URL)
const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


const ShareModal = ({ file, show, onClose }) => {
    const [copied, setCopied] = useState(false);

    // 1. Construct the permanent, non-expiring link statically
    const sharingLink = file 
        ? `${SERVER_URL}/api/files/public/share/${file._id}` 
        : '';

    const handleCopy = () => {
        if (sharingLink) {
            navigator.clipboard.writeText(sharingLink)
                .then(() => {
                    setCopied(true);
                    toast.success('Public link copied to clipboard!');
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(err => {
                    console.error("Failed to copy text: ", err);
                    toast.error("Failed to copy link.");
                });
        }
    };
    
    // 2. Function to open the link in a new tab for viewing
    const handleView = () => {
        if (sharingLink) {
            // Opens the link in a new window/tab
            window.open(sharingLink, '_blank');
            onClose(); // Close modal after initiating the view/download
        }
    };

    if (!file) return null;

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Share File: {file.fileName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                
                <p className="text-success fw-bold">
                    A permanent, public link has been created for **{file.fileName}**.
                </p>
                <p className="text-muted small">
                    Recipients can **view the unencrypted file** directly in their browser.
                </p>
                
                <hr />

                <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Shareable Link (Permanent)</Form.Label>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            value={sharingLink}
                            readOnly
                            onClick={(e) => e.target.select()}
                        />
                        <Button 
                            variant={copied ? "success" : "outline-secondary"} 
                            onClick={handleCopy}
                            title="Copy the public link"
                        >
                            {copied ? 'Copied! ✅' : 'Copy Link'}
                        </Button>
                    </InputGroup>
                </Form.Group>
                
                <div className="d-grid gap-2">
                    <Button 
                        variant="primary" 
                        onClick={handleView}
                        disabled={!sharingLink}
                    >
                        Preview/Open File in New Tab
                    </Button>
                </div>

            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ShareModal;