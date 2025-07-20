/**
 * Simplified Aerospace Cockpit Post Creation Modal
 * Clean, minimal design with space theme
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuestionCircle, FaComments, FaTrophy, FaTimes, FaPlus, FaRocket, FaCode, FaEye, FaEyeSlash } from 'react-icons/fa';

const POST_TYPES = {
  query: { icon: FaQuestionCircle, label: 'Query', color: 'stellar-blue' },
  discussion: { icon: FaComments, label: 'Discussion', color: 'stellar-purple' },
  achievement: { icon: FaTrophy, label: 'Achievement', color: 'stellar-orange' }
};

const QUICK_TAGS = ['javascript', 'python', 'react', 'node', 'css', 'html', 'help', 'bug', 'feature'];

const CODE_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'plaintext', label: 'Plain Text' }
];

export const PostCreationModal = ({ isOpen, onClose, onPostCreated, initialPostType = 'query' }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    postType: initialPostType,
    tags: [],
    codeSnippet: '',
    codeLanguage: 'javascript'
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        content: '',
        postType: initialPostType,
        tags: [],
        codeSnippet: '',
        codeLanguage: 'javascript'
      });
      setCurrentTag('');
      setIsSubmitting(false);
      setShowCodePreview(false);
    }
  }, [isOpen, initialPostType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || formData.tags.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onPostCreated(formData);
      toast.success('Post created successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = (tag) => {
    if (!formData.tags.includes(tag) && formData.tags.length < 8) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddCustomTag = () => {
    const tag = currentTag.trim().toLowerCase();
    if (tag) {
      addTag(tag);
      setCurrentTag('');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-space-void/90 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-gradient-to-br from-space-dark via-space-darker to-space-dark border border-stellar-blue/30 rounded-2xl shadow-2xl shadow-stellar-blue/10 overflow-hidden flex flex-col"
        >
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-6 border-b border-space-gray/30 bg-gradient-to-r from-space-dark to-space-darker flex-shrink-0">
            <div className="flex items-center space-x-3">
              <FaRocket className="text-stellar-blue text-xl animate-pulse" />
              <h2 className="text-xl font-bold text-space-text uppercase tracking-wider">
                Mission Control
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-space-muted hover:text-stellar-blue transition-colors rounded-lg hover:bg-space-light/20"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Scrollable Form Container */}
          <div className="flex-1 overflow-y-auto">
            {/* Form */}
            <form id="post-creation-form" onSubmit={handleSubmit} className="p-6 space-y-6 bg-space-void">
              {/* Post Type Selection */}
              <div>
                <label className="block text-sm font-medium text-stellar-blue mb-3 uppercase tracking-wider">
                  Mission Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(POST_TYPES).map(([type, config]) => {
                    const IconComponent = config.icon;
                    const isSelected = formData.postType === type;
                    return (
                      <motion.button
                        key={type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, postType: type }))}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          isSelected 
                            ? `border-${config.color} bg-${config.color}/10 text-${config.color} shadow-${config.color}-glow`
                            : 'border-space-gray bg-space-dark hover:border-stellar-blue/50 text-space-muted hover:text-stellar-blue'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <IconComponent size={24} />
                          <span className="font-medium text-sm uppercase tracking-wide">{config.label}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-stellar-blue mb-2 uppercase tracking-wider">
                Mission Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter mission title..."
                className="w-full px-4 py-3 bg-space-dark border border-space-gray rounded-xl text-space-text placeholder-space-muted focus:border-stellar-blue focus:outline-none focus:ring-2 focus:ring-stellar-blue/20 transition-colors"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-stellar-blue mb-2 uppercase tracking-wider">
                Mission Brief
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Describe your mission..."
                rows={6}
                className="w-full px-4 py-3 bg-space-dark border border-space-gray rounded-xl text-space-text placeholder-space-muted focus:border-stellar-blue focus:outline-none focus:ring-2 focus:ring-stellar-blue/20 transition-colors resize-none"
                required
              />
            </div>

            {/* Code Snippet Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-stellar-blue uppercase tracking-wider">
                  <FaCode className="inline mr-2" />
                  Code Snippet (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-space-muted">Language:</label>
                  <select
                    value={formData.codeLanguage}
                    onChange={(e) => setFormData(prev => ({ ...prev, codeLanguage: e.target.value }))}
                    className="px-2 py-1 text-xs bg-space-dark border border-space-gray rounded text-space-text focus:border-stellar-blue focus:outline-none"
                  >
                    {CODE_LANGUAGES.map(lang => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCodePreview(!showCodePreview)}
                    className="p-1 text-stellar-blue hover:text-stellar-blue/80 transition-colors"
                    title={showCodePreview ? "Hide Preview" : "Show Preview"}
                  >
                    {showCodePreview ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <textarea
                  value={formData.codeSnippet}
                  onChange={(e) => setFormData(prev => ({ ...prev, codeSnippet: e.target.value }))}
                  placeholder={`// Add your ${formData.codeLanguage} code here...\nfunction example() {\n  return "Mission accomplished!";\n}`}
                  rows={8}
                  className="w-full px-4 py-3 bg-space-darker border border-space-gray rounded-xl text-space-text placeholder-space-muted focus:border-stellar-blue focus:outline-none focus:ring-2 focus:ring-stellar-blue/20 transition-colors resize-none font-mono text-sm"
                />
                
                {/* Code Preview */}
                {showCodePreview && formData.codeSnippet && (
                  <div className="border border-space-gray rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-space-dark border-b border-space-gray">
                      <span className="text-xs text-space-muted font-medium">
                        Preview - {CODE_LANGUAGES.find(l => l.value === formData.codeLanguage)?.label}
                      </span>
                      <span className="text-xs text-stellar-blue">
                        {formData.codeSnippet.split('\n').length} lines
                      </span>
                    </div>
                    <pre className="p-4 bg-space-darker text-space-text text-sm overflow-x-auto">
                      <code className={`language-${formData.codeLanguage}`}>
                        {formData.codeSnippet}
                      </code>
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-stellar-blue mb-2 uppercase tracking-wider">
                Mission Tags
              </label>
              
              {/* Current Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-stellar-purple/20 text-stellar-purple border border-stellar-purple/30"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-stellar-purple/60 hover:text-stellar-purple"
                      >
                        <FaTimes size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Quick Tags */}
              <div className="mb-3">
                <div className="text-xs text-space-muted mb-2">Quick Tags:</div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      disabled={formData.tags.includes(tag)}
                      className="px-3 py-1 text-xs rounded-full bg-space-dark border border-space-gray hover:border-stellar-blue text-space-muted hover:text-stellar-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Tag Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                  placeholder="Custom tag..."
                  className="flex-1 px-3 py-2 bg-space-dark border border-space-gray rounded-lg text-space-text placeholder-space-muted focus:border-stellar-blue focus:outline-none focus:ring-1 focus:ring-stellar-blue/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="px-4 py-2 bg-stellar-blue text-white rounded-lg hover:bg-stellar-blue/80 transition-colors"
                >
                  <FaPlus size={14} />
                </button>
              </div>
            </div>
            </form>
          </div>

            {/* Footer Buttons - Fixed at bottom */}
            <div className="flex justify-between items-center p-6 border-t border-space-gray/30 bg-space-void flex-shrink-0">
              <div className="text-xs text-space-muted">
                {formData.tags.length}/8 tags
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-space-muted bg-space-dark border border-space-gray rounded-xl hover:border-stellar-blue/50 hover:text-stellar-blue transition-colors font-medium"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="px-6 py-3 bg-gradient-to-r from-stellar-blue to-stellar-purple text-white font-medium rounded-xl hover:shadow-stellar-blue-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
                  form="post-creation-form"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deploying...</span>
                    </>
                  ) : (
                    <>
                      <FaRocket />
                      <span>Launch Mission</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default PostCreationModal;