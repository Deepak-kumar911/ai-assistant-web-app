// components/common/ai-agent/tabs/AgentTraining.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiFile,
    FiUpload,
    FiX,
    FiSave,
    FiPlus,
    FiTrash2,
    FiCheckCircle,
    FiAlertCircle,
    FiClock,
    FiDatabase,
    FiLink,
    FiGlobe,
    FiRefreshCw,
    FiInfo,
    FiLoader
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { uploadMediaApi } from '../../../../api/uploadApi';
import { addAgentKnowledgeApi, getAgentKnowledgeListApi, removeAgentKnowledgeApi, updateAgentKnowledgeApi } from '../../../../api/agent/knowledgeApi';
import { useSelector } from 'react-redux';
import { data } from 'react-router-dom';


export default function AgentTraining() {
    const { details } = useSelector(state => state?.ai_agent);
    const [documents, setDocuments] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [website, setWebsite] = useState({ url: '', status: 'idle' });
    const [activeTab, setActiveTab] = useState('document');
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);

    // Document Handlers
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !details?._id) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.');
            return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            const result = await uploadMediaApi(formData);
            const newDocument = {
                name: file.name,
                type: file.type,
                size: file.size,
                url: result?.data?.file?.url || '',
                sourceType: getFileType(file.type),
            };
            const response = await addAgentKnowledgeApi({
                agentId: details?._id,
                sourceType: "document",
                title: file.name,
                data: newDocument
            });
            if (result?.data?.success) {
                setDocuments(prev => [...prev, response?.data?.data || { metadata: newDocument }]);
            }
            toast.success(`${file.name} uploaded successfully`);
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error(`Failed to upload ${file.name}`);
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const getFileType = (mimeType) => {
        if (mimeType.includes('pdf')) return 'pdf';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'docx';
        if (mimeType.includes('text')) return 'txt';
        return 'txt';
    };

    const removeDocument = async (id) => {
        try {
            setDocuments(prev => prev.map(doc => doc._id === id ? { ...doc, removing: true } : doc));
            const result = await removeAgentKnowledgeApi(id);
            toast.info('Document removed');
            setDocuments(prev => prev.filter(doc => doc._id !== id));
        } catch (error) {
            toast.error('Failed to remove document');
            setDocuments(prev => prev.map(doc => doc._id === id ? { ...doc, removing: false } : doc));
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // FAQ Handlers
    const addNewFAQ = () => {
        if (faqs.length >= 20) {
            toast.error('Maximum 20 FAQs allowed');
            return;
        }

        const newFAQ = {
            id: Date.now().toString(),
            question: '',
            answer: '',
            status: 'unsaved'
        };
        setFaqs(prev => [...prev, newFAQ]);
    };

    const updateFAQ = (idx, field, value) => {
        setFaqs(prev => prev.map((faq, index) =>
            index === idx ? { ...faq, [field]: value, status: 'unsaved' } : faq
        ));
    };

    const saveFAQ = async (idx) => {
        const faq = faqs[idx];
        if (!faq) return;

        // Validate question length (70-80 characters max)
        if (faq.question.length < 5 || faq.question.length > 80) {
            toast.error('Question must be between 5 and 80 characters');
            return;
        }

        // Validate answer length (max 500 characters)
        if (faq.answer.length > 500) {
            toast.error('Answer must be less than 500 characters');
            return;
        }

        if (!faq.question.trim() || !faq.answer.trim()) {
            toast.error('Please fill in both question and answer');
            return;
        }

        setFaqs(prev => prev.map((f, index) =>
            index === idx ? { ...f, status: 'saving' } : f
        ));

        try {
            const payload = {
                sourceType: "faq",
                agentId: details?._id,
                data: {
                    question: faq.question,
                    answer: faq.answer
                }
            };

            const response = faq?._id ? await updateAgentKnowledgeApi(faq._id, payload) : await addAgentKnowledgeApi(payload);
            setFaqs(prev => prev.map((f, index) =>
                index === idx ? { ...f, _id: response?.data?.data?._id, status: 'saved' } : f
            ));

            toast.success('FAQ saved successfully');
            setFaqs(prev => prev.map((f, index) =>
                index === idx && f.status === 'saved' ? { ...f, status: 'saved' } : f
            ));
        } catch (error) {
            setFaqs(prev => prev.map((f, index) =>
                index === idx ? { ...f, status: 'unsaved' } : f
            ));
            toast.error('Failed to save FAQ');
        }
    };

    const deleteFAQ = async (idx) => {
        const faq = faqs[idx];
        try {
            if (faq?._id) {
                setFaqs(prev => prev.map((f, index) =>
                    index === idx ? { ...f, status: 'deleting' } : f
                ));
                await removeAgentKnowledgeApi(faq._id);
            }
            setFaqs(prev => prev.filter((_, index) => index !== idx));
            toast.info('FAQ deleted');
        } catch (error) {
            setFaqs(prev => prev.map((f, index) =>
                index === idx ? { ...f, status: 'saved' } : f
            ));
            toast.error('Failed to delete FAQ');
        }
    };

    // Website Handlers
    const handleWebsiteCrawl = async () => {
        if (!website.url) {
            toast.error('Please enter a website URL');
            return;
        }

        // Validate URL
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        if (!urlPattern.test(website.url)) {
            toast.error('Please enter a valid URL');
            return;
        }

        // Add https if not present
        let finalUrl = website.url;
        if (!finalUrl.startsWith('http')) {
            finalUrl = 'https://' + finalUrl;
        }

        setWebsite(prev => ({ ...prev, status: 'crawling', url: finalUrl }));

        try {
            const payload = {
                agentId: details?._id,
                sourceType: "website",
                data: {
                    url: finalUrl,
                    status: 'crawling'
                }
            }

            const result = website?._id ? await updateAgentKnowledgeApi(website?._id,payload) : await addAgentKnowledgeApi(payload);
            toast.success(`Website url ${website?._id ? 'updated' : 'added'} successfully`);
            setWebsite(prev => ({ ...prev, status: 'idle' }));
        } catch (error) {
            setWebsite(prev => ({ ...prev, status: 'failed' }));
            toast.error('Failed to add website url');
        } finally {
            setWebsite(prev => ({ ...prev, status: 'idle' }));
        }
    };

    const loadKnowledgeBasedOnSource = async () => {
        try {
            setLoading(true)
            const result = await getAgentKnowledgeListApi({ agentId: details?._id, sourceType: activeTab });
            if (result?.data?.success) {
                const knowledgeList = result?.data?.data || [];
                if (activeTab === 'document') {
                    setDocuments(knowledgeList);
                } else if (activeTab === 'faq') {
                    setFaqs(knowledgeList?.map(item => ({ question: item?.metadata?.question, answer: item?.metadata?.answer, status: 'saved', _id: item?._id })));
                } else if (activeTab === 'website' && knowledgeList[0]?.metadata) {
                    setWebsite({ ...knowledgeList[0]?.metadata, status: 'idle', _id: knowledgeList?.[0]?._id });
                }
            }
        } catch (error) {
            toast.error('Failed to load knowledge data');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadKnowledgeBasedOnSource();
    }, [activeTab]);

    const tabs = [
        { id: 'document', label: 'Documents', icon: FiFile, count: documents.length },
        { id: 'faq', label: 'FAQ', icon: FiDatabase, count: faqs.length },
        { id: 'website', label: 'Website', icon: FiGlobe }
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Tab Navigation */}
            <div className="flex border-b border-white/10 px-6">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all
                ${isActive
                                    ? 'text-cyan-400'
                                    : 'text-gray-400 hover:text-gray-300'
                                }
              `}
                        >
                            <Icon size={16} />
                            <span>{tab.label}</span>
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`
                  px-1.5 py-0.5 text-xs rounded-full
                  ${isActive
                                        ? 'bg-cyan-500/20 text-cyan-400'
                                        : 'bg-white/10 text-gray-400'
                                    }
                `}>
                                    {tab.count}
                                </span>
                            )}
                            {isActive && (
                                <motion.div
                                    layoutId="trainingTabIndicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-violet-500"
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <AnimatePresence mode="wait">
                    {/* Documents Tab */}
                    {activeTab === 'document' && (
                        <motion.div
                            key="documents"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Upload Area */}
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className={`
                    flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl
                    transition-all cursor-pointer
                    ${uploading
                                            ? 'border-white/10 bg-white/5 cursor-wait'
                                            : 'border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/5'
                                        }
                  `}
                                >
                                    <div className="p-3 rounded-full bg-cyan-500/10 mb-3">
                                        {uploading ? (
                                            <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                                        ) : (
                                            <FiUpload size={24} className="text-cyan-400" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-300 mb-1">
                                        {uploading ? 'Uploading...' : 'Click to upload document'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PDF, DOC, DOCX, TXT (Max 10MB)
                                    </p>
                                </label>
                            </div>

                            {/* Documents List */}
                            {documents.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-gray-300">Uploaded Documents</h3>
                                    <div className="space-y-2">
                                        {documents.map((doc) => (
                                            <motion.div
                                                key={doc.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className={` p-2 rounded-lg bg-emerald-500/10 `}>
                                                        <FiCheckCircle className="text-emerald-400" size={18} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-white">{doc?.metadata?.name}</p>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <p className="text-xs text-gray-500">{formatFileSize(doc?.metadata?.size)}</p>
                                                            <p className="text-xs text-gray-500 capitalize">{doc?.metadata?.sourceType}</p>

                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => removeDocument(doc._id)}
                                                    disabled={doc.removing}
                                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-red-400"
                                                >
                                                    {doc.removing ? <FiLoader size={16} className="animate-spin" /> : <FiTrash2 size={16} />}
                                                </button>

                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {documents.length === 0 && !uploading && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                        <FiFile size={24} className="text-gray-500" />
                                    </div>
                                    <p className="text-sm text-gray-400">No documents uploaded yet</p>
                                    <p className="text-xs text-gray-500 mt-1">Upload documents to train your agent</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* FAQ Tab */}
                    {activeTab === 'faq' && (
                        <motion.div
                            key="faq"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {/* Add FAQ Button */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-medium text-white">Frequently Asked Questions</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {faqs.length}/20 FAQs added
                                    </p>
                                </div>
                                <button
                                    onClick={addNewFAQ}
                                    disabled={faqs.length >= 20}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    <FiPlus size={14} />
                                    Add FAQ
                                </button>
                            </div>

                            {/* FAQ List */}
                            <div className="space-y-4">
                                {faqs.map((faq, idx) => (
                                    <motion.div
                                        key={faq.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-4 bg-white/5 rounded-xl border border-white/10"
                                    >
                                        {/* Question Input */}
                                        <div className="mb-3">
                                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                                Question (5-80 characters)
                                            </label>
                                            <input
                                                type="text"
                                                value={faq.question}
                                                onChange={(e) => updateFAQ(idx, 'question', e.target.value)}
                                                placeholder="e.g., How do I reset my password?"
                                                maxLength={80}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                                            />
                                            <div className="flex justify-end mt-1">
                                                <span className="text-xs text-gray-500">
                                                    {faq.question.length}/80
                                                </span>
                                            </div>
                                        </div>

                                        {/* Answer Input */}
                                        <div className="mb-3">
                                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                                Answer (Max 500 characters)
                                            </label>
                                            <textarea
                                                value={faq.answer}
                                                onChange={(e) => updateFAQ(idx, 'answer', e.target.value)}
                                                placeholder="Provide a detailed answer to the question..."
                                                maxLength={500}
                                                rows={3}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                                            />
                                            <div className="flex justify-between mt-1">
                                                <span className="text-xs text-gray-500">
                                                    {faq.answer.length}/500 characters
                                                </span>
                                                {faq.status === 'saved' && (
                                                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                                                        <FiCheckCircle size={10} />
                                                        Saved
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => deleteFAQ(idx)}
                                                disabled={faq.status === 'deleting'}
                                                className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                {faq.status === 'deleting' ? 'Deleting...' : 'Delete'}
                                            </button>
                                            <button
                                                onClick={() => saveFAQ(idx)}
                                                disabled={faq.status === 'saving'}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-all disabled:opacity-50"
                                            >
                                                {faq.status === 'saving' ? (
                                                    <>
                                                        <div className="w-3 h-3 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiSave size={12} />
                                                        Save FAQ
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Empty State */}
                            {faqs.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                        <FiDatabase size={24} className="text-gray-500" />
                                    </div>
                                    <p className="text-sm text-gray-400">No FAQs added yet</p>
                                    <p className="text-xs text-gray-500 mt-1">Click "Add FAQ" to create your first FAQ</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Website Tab */}
                    {activeTab === 'website' && (
                        <motion.div
                            key="website"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* URL Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Website URL
                                </label>
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="url"
                                            value={website.url}
                                            onChange={(e) => setWebsite(prev => ({ ...prev, url: e.target.value, status: 'idle' }))}
                                            placeholder="https://example.com"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>
                                    <button
                                        onClick={handleWebsiteCrawl}
                                        disabled={website.status === 'crawling'}
                                        className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {website.status === 'crawling' ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Crawling...
                                            </>
                                        ) : (
                                            <>
                                                <FiRefreshCw size={14} />
                                                Start Crawl
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                                <div className="flex items-start gap-3">
                                    <FiInfo size={18} className="text-cyan-400 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-medium text-white mb-1">How website crawling works</h4>
                                        <p className="text-xs text-gray-400">
                                            Our crawler will scan your website and extract relevant content from all public pages.
                                            This helps your agent understand your website's structure and content for better responses.
                                            The process may take a few minutes depending on your site size.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Crawl Status */}
                            {website.status !== 'idle' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`
                                            p-4 rounded-xl border
                                            ${website.status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/20' : ''}
                                            ${website.status === 'failed' ? 'bg-red-500/5 border-red-500/20' : ''}
                                            ${website.status === 'crawling' ? 'bg-cyan-500/5 border-cyan-500/20' : ''}  `}>
                                    <div className="flex items-center gap-3">
                                        {website.status === 'crawling' && (
                                            <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                                        )}
                                        {website.status === 'completed' && <FiCheckCircle className="text-emerald-400" size={20} />}
                                        {website.status === 'failed' && <FiAlertCircle className="text-red-400" size={20} />}

                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">
                                                {website.status === 'crawling' && 'Crawling in progress...'}
                                                {website.status === 'completed' && 'Crawl completed successfully!'}
                                                {website.status === 'failed' && 'Crawl failed. Please try again.'}
                                            </p>
                                            {website.status === 'completed' && website.pagesCrawled && (
                                                <div className="flex items-center gap-4 mt-2">
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <FiGlobe size={10} />
                                                        {website.pagesCrawled} pages crawled
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Empty State */}
                            {website.status === 'idle' && !website.url && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                        <FiGlobe size={24} className="text-gray-500" />
                                    </div>
                                    <p className="text-sm text-gray-400">Enter a website URL to start crawling</p>
                                    <p className="text-xs text-gray-500 mt-1">Your agent will learn from your website content</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}