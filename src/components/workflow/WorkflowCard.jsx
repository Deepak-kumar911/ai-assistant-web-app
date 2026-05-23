// components/workflow/WorkflowCard.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MoreVertical, Edit2, Copy, Trash2, Play, Image, Video, Grid3x3, Users, MessageCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export default function WorkflowCard({ workflow, onEdit, onDelete, onDuplicate, viewMode }) {
    const [showMenu, setShowMenu] = useState(false);
    const [imageError, setImageError] = useState(false);

    const getPostTypeIcon = () => {
        switch (workflow.postType) {
            case 'reel':
                return <Video size={20} />;
            case 'carousel':
                return <Grid3x3 size={20} />;
            default:
                return <Image size={20} />;
        }
    };

    const getScheduleStatus = () => {
        const scheduleDate = new Date(workflow.scheduledDate);
        const now = new Date();

        if (scheduleDate < now) {
            return { status: 'expired', label: 'Past Due', color: '#ef4444' };
        }

        const diffHours = (scheduleDate - now) / (1000 * 60 * 60);
        if (diffHours < 24) {
            return { status: 'soon', label: 'Scheduled Soon', color: '#f59e0b' };
        }

        return { status: 'scheduled', label: 'Scheduled', color: '#10b981' };
    };

    const scheduleStatus = getScheduleStatus();

    const getMediaPreview = () => {
        if (!workflow.media || workflow.media.length === 0) return null;

        const firstMedia = workflow.media[0];
        if (firstMedia.type === 'image') {
            return firstMedia.url;
        } else if (firstMedia.type === 'video') {
            return firstMedia.thumbnail || firstMedia.url;
        }
        return null;
    };

    const previewUrl = getMediaPreview();

    if (viewMode === 'list') {
        return (
            <motion.div
                className="workflow-list-item"
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
                <div className="list-item-preview">
                    {previewUrl && !imageError ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="preview-placeholder">
                            {getPostTypeIcon()}
                        </div>
                    )}
                </div>

                <div className="list-item-content">
                    <div className="list-item-header">
                        <h3 className="list-item-title">{workflow.name}</h3>
                        <div className="list-item-badges">
                            <span className="post-type-badge">
                                {getPostTypeIcon()}
                                <span>{workflow.postType}</span>
                            </span>
                            <span className="status-badge" style={{ background: scheduleStatus.color + '20', color: scheduleStatus.color }}>
                                {scheduleStatus.label}
                            </span>
                        </div>
                    </div>

                    <p className="list-item-caption">{workflow.caption?.substring(0, 100)}...</p>

                    <div className="list-item-meta">
                        <div className="meta-item">
                            <Calendar size={14} />
                            <span>{format(new Date(workflow.scheduledDate), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="meta-item">
                            <Clock size={14} />
                            <span>{workflow.scheduledTime}</span>
                        </div>
                        {workflow.engagement && (
                            <div className="meta-item">
                                <MessageCircle size={14} />
                                <span>Auto-reply enabled</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="list-item-actions">
                    <button onClick={onEdit} className="action-btn edit" title="Edit">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={onDuplicate} className="action-btn duplicate" title="Duplicate">
                        <Copy size={16} />
                    </button>
                    <button onClick={onDelete} className="action-btn delete" title="Delete">
                        <Trash2 size={16} />
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="workflow-card"
            whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
        >
            {/* Media Preview */}
            <div className="card-media">
                {previewUrl && !imageError ? (
                    <img
                        src={previewUrl}
                        alt={workflow.name}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="media-placeholder">
                        {getPostTypeIcon()}
                        <span>No preview</span>
                    </div>
                )}

                <div className="media-overlay">
                    <button className="quick-edit-btn" onClick={onEdit}>
                        <Edit2 size={14} />
                    </button>
                </div>
            </div>

            {/* Card Content */}
            <div className="card-content">
                <div className="card-header">
                    <div className="post-type-indicator">
                        {getPostTypeIcon()}
                        <span className="post-type-label">{workflow.postType}</span>
                    </div>

                    <div className="menu-container">
                        <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>
                            <MoreVertical size={16} />
                        </button>

                        {showMenu && (
                            <div className="dropdown-menu">
                                <button onClick={onEdit}>
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                                <button onClick={onDuplicate}>
                                    <Copy size={14} />
                                    Duplicate
                                </button>
                                <button onClick={onDelete} className="danger">
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <h3 className="card-title">{workflow.name}</h3>

                <p className="card-caption">
                    {workflow.caption?.substring(0, 80)}
                    {workflow.caption?.length > 80 && '...'}
                </p>

                {/* Schedule Info */}
                <div className="schedule-info">
                    <div className="schedule-date">
                        <Calendar size={14} />
                        <span>{format(new Date(workflow.scheduledDate), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="schedule-time">
                        <Clock size={14} />
                        <span>{workflow.scheduledTime}</span>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="status-bar">
                    <div className="status-indicator" style={{ background: scheduleStatus.color }}>
                        <Play size={12} />
                    </div>
                    <div className="status-text" style={{ color: scheduleStatus.color }}>
                        {scheduleStatus.label}
                    </div>
                    <div className="time-remaining">
                        {scheduleStatus.status === 'scheduled' &&
                            `in ${formatDistanceToNow(new Date(workflow.scheduledDate), { addSuffix: false })}`
                        }
                    </div>
                </div>

                {/* Engagement Stats */}
                {workflow.engagement && (
                    <div className="engagement-stats">
                        <div className="stat">
                            <MessageCircle size={12} />
                            <span>Auto-reply active</span>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}