// components/workflow/WorkflowValidation.jsx
import { motion } from 'framer-motion';
import { X, AlertCircle, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export default function WorkflowValidation({ validation, nodes, onClose, onFix }) {
    const getNodeName = (nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        return node ? `${node.type.charAt(0).toUpperCase() + node.type.slice(1)} Node` : 'Unknown Node';
    };

    return (
        <div className="validation-modal-overlay" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="validation-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="validation-header">
                    <div className="validation-title">
                        <AlertCircle size={24} />
                        <h2>Workflow Validation</h2>
                    </div>
                    <button onClick={onClose} className="close-btn">
                        <X size={20} />
                    </button>
                </div>

                <div className="validation-summary">
                    <div className={`summary-badge ${validation.isValid ? 'success' : 'error'}`}>
                        {validation.isValid ? (
                            <>
                                <CheckCircle size={20} />
                                <span>Valid Workflow</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle size={20} />
                                <span>{validation.errors.length} Error(s) Found</span>
                            </>
                        )}
                    </div>

                    {validation.warnings.length > 0 && (
                        <div className="summary-badge warning">
                            <AlertTriangle size={20} />
                            <span>{validation.warnings.length} Warning(s)</span>
                        </div>
                    )}
                </div>

                <div className="validation-content">
                    {validation.errors.length > 0 && (
                        <div className="validation-section">
                            <h3 className="section-title error">Errors</h3>
                            <div className="error-list">
                                {validation.errors.map((error, index) => (
                                    <div key={index} className="validation-item error">
                                        <div className="item-icon">
                                            <X size={16} />
                                        </div>
                                        <div className="item-content">
                                            <p className="item-message">{error.message}</p>
                                            {error.nodeId && (
                                                <div className="item-meta">
                                                    <span className="node-name">{getNodeName(error.nodeId)}</span>
                                                    <span className="field-name">{error.field}</span>
                                                </div>
                                            )}
                                        </div>
                                        {onFix && error.nodeId && (
                                            <button
                                                onClick={() => onFix(error.nodeId, error.field)}
                                                className="fix-btn"
                                            >
                                                Fix <ArrowRight size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {validation.warnings.length > 0 && (
                        <div className="validation-section">
                            <h3 className="section-title warning">Warnings</h3>
                            <div className="warning-list">
                                {validation.warnings.map((warning, index) => (
                                    <div key={index} className="validation-item warning">
                                        <div className="item-icon">
                                            <AlertTriangle size={16} />
                                        </div>
                                        <div className="item-content">
                                            <p className="item-message">{warning.message}</p>
                                            {warning.nodeId && (
                                                <div className="item-meta">
                                                    <span className="node-name">{getNodeName(warning.nodeId)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="validation-footer">
                    <button onClick={onClose} className="close-validation-btn">
                        {validation.isValid ? 'Close' : 'Review & Fix'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}