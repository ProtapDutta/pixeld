import React from 'react';

// A generic, reusable Bootstrap confirmation modal component
const ConfirmationModal = ({ show, title, body, onConfirm, onCancel }) => {
    // If the modal should not be shown, return null to render nothing
    if (!show) {
        return null;
    }

    // The 'show d-block' classes are used to manually display the modal when using React state
    return (
        <div 
            className={`modal fade ${show ? 'show d-block' : ''}`} 
            tabIndex="-1" 
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }} 
            role="dialog"
            aria-labelledby="confirmationModalLabel"
            aria-modal="true"
        >
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="confirmationModalLabel">{title}</h5>
                        {/* Cross button */}
                        <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
                    </div>
                    <div className="modal-body">
                        <p className="lead">{body}</p>
                        <p className="text-danger fw-bold">This action is permanent and cannot be undone.</p>
                    </div>
                    <div className="modal-footer">
                        {/* Cancel button */}
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                        {/* OK/Confirm button */}
                        <button type="button" className="btn btn-danger" onClick={onConfirm}>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;