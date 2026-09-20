// components/common/ai-agent/tabs/AgentTraining.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFile,
  FiUpload,
  FiSave,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiDatabase,
  FiLink,
  FiGlobe,
  FiRefreshCw,
  FiInfo,
  FiLoader,
  FiFileText
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { uploadMediaApi } from '../../../../api/uploadApi';
import {
  addAgentKnowledgeApi,
  getAgentKnowledgeListApi,
  removeAgentKnowledgeApi,
  updateAgentKnowledgeApi
} from '../../../../api/agent/knowledgeApi';
import { useSelector } from 'react-redux';

export default function AgentTraining() {
  const { details } = useSelector((state) => state?.ai_agent);
  const [documents, setDocuments] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [website, setWebsite] = useState({ url: '', status: 'idle' });
  const [activeTab, setActiveTab] = useState('document');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load Knowledge
  const loadKnowledgeBasedOnSource = async () => {
    if (!details?._id) return;
    try {
      setLoading(true);
      const result = await getAgentKnowledgeListApi({ agentId: details?._id, sourceType: activeTab });
      if (result?.data?.success) {
        const knowledgeList = result?.data?.data || [];
        if (activeTab === 'document') {
          setDocuments(knowledgeList);
        } else if (activeTab === 'faq') {
          setFaqs(
            knowledgeList?.map((item) => ({
              question: item?.metadata?.question || '',
              answer: item?.metadata?.answer || '',
              status: 'saved',
              _id: item?._id
            }))
          );
        } else if (activeTab === 'website' && knowledgeList[0]?.metadata) {
          setWebsite({
            ...knowledgeList[0]?.metadata,
            status: 'idle',
            _id: knowledgeList?.[0]?._id
          });
        }
      }
    } catch (error) {
      console.error('Failed to load knowledge data:', error);
      toast.error('Failed to load knowledge data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKnowledgeBasedOnSource();
  }, [activeTab, details?._id]);

  // Document Handlers
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !details?._id) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.');
      return;
    }

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
        sourceType: getFileType(file.type)
      };

      const response = await addAgentKnowledgeApi({
        agentId: details?._id,
        sourceType: 'document',
        title: file.name,
        data: newDocument
      });

      if (result?.data?.success) {
        setDocuments((prev) => [...prev, response?.data?.data || { metadata: newDocument, _id: Date.now().toString() }]);
      }
      toast.success(`${file.name} uploaded successfully`);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to upload ${file.name}`);
    } finally {
      setUploading(false);
      e.target.value = '';
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
      setDocuments((prev) => prev.map((doc) => (doc._id === id ? { ...doc, removing: true } : doc)));
      await removeAgentKnowledgeApi(id);
      toast.info('Document removed');
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
    } catch (error) {
      toast.error('Failed to remove document');
      setDocuments((prev) => prev.map((doc) => (doc._id === id ? { ...doc, removing: false } : doc)));
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
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
    setFaqs((prev) => [newFAQ, ...prev]);
  };

  const updateFAQ = (idx, field, value) => {
    setFaqs((prev) =>
      prev.map((faq, index) => (index === idx ? { ...faq, [field]: value, status: 'unsaved' } : faq))
    );
  };

  const saveFAQ = async (idx) => {
    const faq = faqs[idx];
    if (!faq) return;

    if (faq.question.length < 5 || faq.question.length > 80) {
      toast.error('Question must be between 5 and 80 characters');
      return;
    }

    if (faq.answer.length > 500) {
      toast.error('Answer must be less than 500 characters');
      return;
    }

    if (!faq.question.trim() || !faq.answer.trim()) {
      toast.error('Please fill in both question and answer');
      return;
    }

    setFaqs((prev) =>
      prev.map((f, index) => (index === idx ? { ...f, status: 'saving' } : f))
    );

    try {
      const payload = {
        sourceType: 'faq',
        agentId: details?._id,
        data: {
          question: faq.question,
          answer: faq.answer
        }
      };

      const response = faq?._id
        ? await updateAgentKnowledgeApi(faq._id, payload)
        : await addAgentKnowledgeApi(payload);

      setFaqs((prev) =>
        prev.map((f, index) =>
          index === idx ? { ...f, _id: response?.data?.data?._id || f._id, status: 'saved' } : f
        )
      );

      toast.success('FAQ saved successfully');
    } catch (error) {
      setFaqs((prev) =>
        prev.map((f, index) => (index === idx ? { ...f, status: 'unsaved' } : f))
      );
      toast.error('Failed to save FAQ');
    }
  };

  const deleteFAQ = async (idx) => {
    const faq = faqs[idx];
    try {
      if (faq?._id) {
        setFaqs((prev) =>
          prev.map((f, index) => (index === idx ? { ...f, status: 'deleting' } : f))
        );
        await removeAgentKnowledgeApi(faq._id);
      }
      setFaqs((prev) => prev.filter((_, index) => index !== idx));
      toast.info('FAQ removed');
    } catch (error) {
      setFaqs((prev) =>
        prev.map((f, index) => (index === idx ? { ...f, status: 'saved' } : f))
      );
      toast.error('Failed to delete FAQ');
    }
  };

  // Website Handlers
  const handleWebsiteCrawl = async () => {
    if (!website.url) {
      toast.error('Please enter a website URL');
      return;
    }

    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(website.url)) {
      toast.error('Please enter a valid website URL');
      return;
    }

    let finalUrl = website.url;
    if (!finalUrl.startsWith('http')) {
      finalUrl = 'https://' + finalUrl;
    }

    setWebsite((prev) => ({ ...prev, status: 'crawling', url: finalUrl }));

    try {
      const payload = {
        agentId: details?._id,
        sourceType: 'website',
        data: {
          url: finalUrl,
          status: 'crawling'
        }
      };

      const result = website?._id
        ? await updateAgentKnowledgeApi(website?._id, payload)
        : await addAgentKnowledgeApi(payload);

      toast.success(`Website URL ${website?._id ? 'updated' : 'indexed'} successfully`);
      setWebsite((prev) => ({ ...prev, status: 'idle', _id: result?.data?.data?._id || prev._id }));
    } catch (error) {
      setWebsite((prev) => ({ ...prev, status: 'failed' }));
      toast.error('Failed to process website URL');
    }
  };

  const tabs = [
    { id: 'document', label: 'Documents', icon: FiFile, count: documents.length },
    { id: 'faq', label: 'FAQs', icon: FiDatabase, count: faqs.length },
    { id: 'website', label: 'Website Crawl', icon: FiGlobe }
  ];

  return (
    <div className="flex flex-col h-full space-y-6 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* 1. SUB-TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-cyan-400' : 'text-[#64748B]'} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'bg-white/[0.08] text-[#94A3B8]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. TAB CONTENT CONTAINER */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {/* DOCUMENTS TAB */}
          {activeTab === 'document' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Dropzone Upload */}
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="training-doc-upload"
                />
                <label
                  htmlFor="training-doc-upload"
                  className={`flex flex-col items-center justify-center p-8 sm:p-10 border-2 border-dashed rounded-2xl transition-all cursor-pointer text-center group ${
                    uploading
                      ? 'border-cyan-500/30 bg-cyan-500/[0.02] cursor-wait'
                      : 'border-white/15 bg-white/[0.02] hover:border-cyan-500/50 hover:bg-cyan-500/[0.04]'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiUpload size={24} className="text-cyan-400" />
                    )}
                  </div>
                  <p className="text-sm font-bold text-[#F8FAFC] mb-1">
                    {uploading ? 'Processing & Vectorizing Document...' : 'Upload Knowledge Document'}
                  </p>
                  <p className="text-xs text-[#94A3B8] max-w-sm leading-relaxed">
                    Click to browse or drag & drop files here. Supports PDF, DOC, DOCX, and TXT up to 10MB.
                  </p>
                </label>
              </div>

              {/* Documents List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#CBD5E1] uppercase tracking-wider">
                      Trained Documents ({documents.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {documents.map((doc) => {
                      const docName = doc?.metadata?.name || doc?.title || 'Document';
                      const docSize = doc?.metadata?.size || doc?.size;
                      const docType = (doc?.metadata?.sourceType || doc?.sourceType || 'txt').toUpperCase();

                      return (
                        <motion.div
                          key={doc._id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#0F172A]/60 border border-white/10 hover:border-white/20 backdrop-blur-md transition-all group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                              <FiFileText size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC] truncate">
                                {docName}
                              </p>
                              <div className="flex items-center gap-2.5 mt-0.5 text-[11px] text-[#94A3B8]">
                                <span>{formatFileSize(docSize)}</span>
                                <span className="text-white/20">•</span>
                                <span className="px-1.5 py-0.2 rounded bg-white/[0.06] text-cyan-400 font-mono text-[10px]">
                                  {docType}
                                </span>
                                <span className="text-white/20">•</span>
                                <span className="text-emerald-400 flex items-center gap-1">
                                  <FiCheckCircle size={11} /> Ready
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => removeDocument(doc._id)}
                            disabled={doc.removing}
                            className="p-2 rounded-xl text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-3 shrink-0 cursor-pointer disabled:opacity-50"
                            title="Delete document"
                          >
                            {doc.removing ? (
                              <FiLoader size={16} className="animate-spin text-rose-400" />
                            ) : (
                              <FiTrash2 size={16} />
                            )}
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-3 text-[#64748B]">
                    <FiFile size={22} />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#CBD5E1]">No documents uploaded yet</p>
                  <p className="text-[11px] text-[#64748B] mt-1">Upload company policies, handbooks, or FAQs to train your agent</p>
                </div>
              )}
            </motion.div>
          )}

          {/* FAQS TAB */}
          {activeTab === 'faq' && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header & Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                <div>
                  <h3 className="text-sm font-bold text-[#F8FAFC]">Frequently Asked Questions</h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {faqs.length} of 20 Q&A pairs added to agent knowledge base
                  </p>
                </div>
                <button
                  onClick={addNewFAQ}
                  disabled={faqs.length >= 20}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-[#080C14] shadow-[0_0_12px_rgba(6,182,212,0.25)] active:scale-95 transition-all disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <FiPlus size={15} />
                  <span>Add FAQ</span>
                </button>
              </div>

              {/* FAQ List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : faqs.length > 0 ? (
                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <motion.div
                      key={faq.id || faq._id || idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 sm:p-5 rounded-2xl bg-[#0F172A]/70 border border-white/10 backdrop-blur-xl space-y-3.5 shadow-lg"
                    >
                      {/* Question */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-[#CBD5E1]">
                            Question <span className="text-cyan-400">*</span>
                          </label>
                          <span className="text-[10px] text-[#64748B]">
                            {faq.question?.length || 0}/80
                          </span>
                        </div>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateFAQ(idx, 'question', e.target.value)}
                          placeholder="e.g. What is your cancellation and refund policy?"
                          maxLength={80}
                          className="w-full bg-[#131D31] border border-white/10 hover:border-white/20 focus:border-cyan-500 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] rounded-xl px-3.5 py-2.5 transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                        />
                      </div>

                      {/* Answer */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-[#CBD5E1]">
                            Answer <span className="text-cyan-400">*</span>
                          </label>
                          <span className="text-[10px] text-[#64748B]">
                            {faq.answer?.length || 0}/500
                          </span>
                        </div>
                        <textarea
                          value={faq.answer}
                          onChange={(e) => updateFAQ(idx, 'answer', e.target.value)}
                          placeholder="Provide a comprehensive answer for this specific query..."
                          maxLength={500}
                          rows={3}
                          className="w-full bg-[#131D31] border border-white/10 hover:border-white/20 focus:border-cyan-500 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] rounded-xl p-3.5 transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none custom-scrollbar"
                        />
                      </div>

                      {/* Actions Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                        <div>
                          {faq.status === 'saved' && (
                            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                              <FiCheckCircle size={12} /> Saved to knowledge base
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => deleteFAQ(idx)}
                            disabled={faq.status === 'deleting'}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
                          >
                            {faq.status === 'deleting' ? 'Deleting...' : 'Delete'}
                          </button>

                          <button
                            type="button"
                            onClick={() => saveFAQ(idx)}
                            disabled={faq.status === 'saving'}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-[#080C14] shadow-[0_0_10px_rgba(6,182,212,0.2)] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                          >
                            {faq.status === 'saving' ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-[#080C14] border-t-transparent rounded-full animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <FiSave size={13} />
                                <span>Save FAQ</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-3 text-[#64748B]">
                    <FiDatabase size={22} />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#CBD5E1]">No FAQs configured yet</p>
                  <p className="text-[11px] text-[#64748B] mt-1">Add curated question-and-answer pairs for direct, accurate responses</p>
                </div>
              )}
            </motion.div>
          )}

          {/* WEBSITE CRAWL TAB */}
          {activeTab === 'website' && (
            <motion.div
              key="website"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* URL Input Box */}
              <div className="p-5 rounded-2xl bg-[#0F172A]/70 border border-white/10 backdrop-blur-xl space-y-3">
                <label className="block text-xs font-bold text-[#CBD5E1] uppercase tracking-wider">
                  Public Website URL
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 flex items-center">
                    <span className="absolute left-3.5 text-[#64748B] pointer-events-none">
                      <FiLink size={16} />
                    </span>
                    <input
                      type="url"
                      value={website.url}
                      onChange={(e) => setWebsite((prev) => ({ ...prev, url: e.target.value, status: 'idle' }))}
                      placeholder="https://yourcompany.com"
                      className="w-full bg-[#131D31] border border-white/10 hover:border-white/20 focus:border-cyan-500 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] rounded-xl pl-10 pr-3.5 py-2.5 transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleWebsiteCrawl}
                    disabled={website.status === 'crawling'}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-[#080C14] shadow-[0_0_14px_rgba(6,182,212,0.25)] active:scale-95 transition-all disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {website.status === 'crawling' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#080C14] border-t-transparent rounded-full animate-spin" />
                        <span>Indexing...</span>
                      </>
                    ) : (
                      <>
                        <FiRefreshCw size={14} />
                        <span>Start Crawl</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Explanation Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-cyan-500/[0.04] border border-cyan-500/20 backdrop-blur-md">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0">
                    <FiInfo size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#F8FAFC] mb-1">
                      Automated Website Scraping & Vector Indexing
                    </h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      Our intelligent indexing pipeline crawls public pages, strips boilerplate markup, 
                      and converts content into vector embeddings. Your agent continuously cites verified 
                      website resources in customer discussions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Crawl Status Feedback */}
              {website.status !== 'idle' && (
                <div
                  className={`p-4 rounded-2xl border backdrop-blur-md ${
                    website.status === 'completed'
                      ? 'bg-emerald-500/[0.05] border-emerald-500/20'
                      : website.status === 'failed'
                      ? 'bg-rose-500/[0.05] border-rose-500/20'
                      : 'bg-cyan-500/[0.05] border-cyan-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {website.status === 'crawling' && (
                      <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
                    )}
                    {website.status === 'completed' && (
                      <FiCheckCircle className="text-emerald-400 shrink-0" size={20} />
                    )}
                    {website.status === 'failed' && (
                      <FiAlertCircle className="text-rose-400 shrink-0" size={20} />
                    )}
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC]">
                        {website.status === 'crawling' && 'Crawling and indexing website in progress...'}
                        {website.status === 'completed' && 'Website indexed successfully!'}
                        {website.status === 'failed' && 'Crawling encountered an error. Please verify the URL and try again.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}