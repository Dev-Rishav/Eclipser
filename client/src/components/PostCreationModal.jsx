/**
 * Enhanced Post Creation Modal
 * Supports all post types: query, discussion, achievement
 * Proper validation and structured data handling
 * Styled with space theme to match newUI
 */

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { HighlightSyntax } from './HighlightSyntax';
import { FaCode, FaTags, FaQuestionCircle, FaComments, FaTrophy, FaTimes, FaPlus, FaStar } from 'react-icons/fa';

const POST_TYPES = {
  query: {
    icon: FaQuestionCircle,
    label: '❓ Query',
    description: 'Ask a question or seek help',
    color: 'bg-stellar-blue/10 border-stellar-blue/30 text-stellar-blue',
    selectedColor: 'bg-stellar-blue/20 border-stellar-blue text-stellar-blue shadow-stellar-blue-glow'
  },
  discussion: {
    icon: FaComments, 
    label: '💬 Discussion',
    description: 'Start a conversation or share insights',
    color: 'bg-stellar-green/10 border-stellar-green/30 text-stellar-green',
    selectedColor: 'bg-stellar-green/20 border-stellar-green text-stellar-green shadow-stellar-green-glow'
  },
  achievement: {
    icon: FaTrophy,
    label: '🏆 Achievement', 
    description: 'Share your accomplishments',
    color: 'bg-stellar-orange/10 border-stellar-orange/30 text-stellar-orange',
    selectedColor: 'bg-stellar-orange/20 border-stellar-orange text-stellar-orange shadow-stellar-orange-glow'
  }
};

const PROGRAMMING_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'dart', label: 'Dart' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'bash', label: 'Bash' },
  { value: 'powershell', label: 'PowerShell' }
];

export const PostCreationModal = ({ isOpen, onClose, onPostCreated, initialPostType = 'query' }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    postType: initialPostType,
    tags: [],
    codeSnippet: null,
    attachments: []
  });

  const [currentTag, setCurrentTag] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes or when initialPostType changes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        content: '',
        postType: initialPostType,
        tags: [],
        codeSnippet: null,
        attachments: []
      });
      setCurrentTag('');
      setShowCodeEditor(false);
      setErrors({});
      setIsSubmitting(false);
    } else {
      // Update post type when modal opens with new type
      setFormData(prev => ({ ...prev, postType: initialPostType }));
    }
  }, [isOpen, initialPostType]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    } else if (formData.content.length > 10000) {
      newErrors.content = 'Content must be less than 10,000 characters';
    }

    if (!formData.postType) {
      newErrors.postType = 'Post type is required';
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    } else if (formData.tags.length > 10) {
      newErrors.tags = 'Maximum 10 tags allowed';
    }

    if (showCodeEditor && formData.codeSnippet) {
      if (!formData.codeSnippet.code.trim()) {
        newErrors.codeSnippet = 'Code snippet cannot be empty';
      }
      if (!formData.codeSnippet.language) {
        newErrors.language = 'Programming language is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = () => {
    const tag = currentTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setCurrentTag('');
      // Clear tag error if it exists
      if (errors.tags) {
        setErrors(prev => ({ ...prev, tags: undefined }));
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleCodeSnippetToggle = () => {
    setShowCodeEditor(!showCodeEditor);
    if (!showCodeEditor) {
      // Initialize code snippet
      setFormData(prev => ({
        ...prev,
        codeSnippet: {
          language: 'javascript',
          code: '// Enter your code here...'
        }
      }));
    } else {
      // Remove code snippet
      setFormData(prev => ({
        ...prev,
        codeSnippet: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data according to backend schema
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        postType: formData.postType,
        tags: formData.tags,
        ...(formData.codeSnippet && {
          codeSnippet: {
            language: formData.codeSnippet.language,
            code: formData.codeSnippet.code
          }
        })
      };

      await onPostCreated(postData);
      toast.success('Post created successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border-2 border-purple-400/50 rounded-2xl shadow-2xl shadow-purple-400/20 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
        {/* Cockpit Corner Indicators */}
        <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-purple-400 rounded-tl-lg"></div>
        <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-purple-400 rounded-tr-lg"></div>
        <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-purple-400 rounded-bl-lg"></div>
        <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-purple-400 rounded-br-lg"></div>
        {/* Header - Cockpit Control Panel */}
        <div className="flex items-center justify-between p-6 border-b-2 border-purple-400/30 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative">
          {/* Cockpit Status Lights */}
          <div className="absolute left-6 top-2 flex gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse shadow-lg shadow-pink-400/50" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="flex items-center gap-3 mt-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center border-2 border-purple-300 shadow-lg shadow-purple-400/30">
              <FaStar className="text-black" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-purple-300 tracking-wide uppercase">
                Mission Control
              </h2>
              <p className="text-purple-400/70 text-sm font-mono">Post Creation Interface</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-purple-400 hover:text-white hover:bg-red-500/20 border border-red-400/50 rounded-lg transition-all duration-300 hover:border-red-400 hover:shadow-lg hover:shadow-red-400/30"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-black">
          <div className="p-6 space-y-6">
            {/* Post Type Selection - Control Panel */}
            <div className="border border-purple-400/30 rounded-xl p-4 bg-gradient-to-r from-gray-900/50 to-black/50">
              <label className="block text-sm font-medium text-purple-300 mb-3 uppercase tracking-wider">
                <FaStar className="inline mr-2 text-purple-400" />
                Mission Type Selection
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
                      whileHover={{ scale: 1.05, rotateY: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                        isSelected 
                          ? 'border-purple-400 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-400/30 text-purple-100'
                          : 'border-gray-600 bg-gradient-to-br from-gray-800/50 to-black/50 hover:border-purple-400/50 text-gray-300 hover:text-purple-200'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 animate-pulse"></div>
                      )}
                      <div className="relative flex flex-col items-center space-y-2">
                        <IconComponent size={28} className={isSelected ? 'text-purple-300' : 'text-gray-400'} />
                        <span className="font-bold text-sm uppercase tracking-wide">{config.label}</span>
                        <span className="text-xs text-center opacity-80">
                          {config.description}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              {errors.postType && (
                <p className="mt-2 text-sm text-red-400 font-mono">{errors.postType}</p>
              )}
            </div>

            {/* Title - Main Input Console */}
            <div className="border border-purple-400/30 rounded-xl p-4 bg-gradient-to-r from-gray-900/30 to-black/30">
              <label className="block text-sm font-medium text-purple-300 mb-2 uppercase tracking-wider">
                Mission Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter mission designation..."
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.title 
                    ? 'border-red-400 focus:border-red-300 focus:ring-red-400/30' 
                    : 'border-gray-600 focus:border-purple-400 focus:ring-purple-400/30'
                } bg-black text-purple-100 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all font-mono`}
                maxLength={200}
              />
              <div className="flex justify-between mt-2">
                {errors.title && (
                  <p className="text-sm text-red-400 font-mono">{errors.title}</p>
                )}
                <p className="text-sm text-purple-400/70 ml-auto font-mono">
                  {formData.title.length}/200
                </p>
              </div>
            </div>

            {/* Content - Main Data Input */}
            <div className="border border-purple-400/30 rounded-xl p-4 bg-gradient-to-r from-gray-900/30 to-black/30">
              <label className="block text-sm font-medium text-purple-300 mb-2 uppercase tracking-wider">
                Mission Brief *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Detailed mission parameters and objectives..."
                rows={6}
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.content 
                    ? 'border-red-400 focus:border-red-300 focus:ring-red-400/30' 
                    : 'border-gray-600 focus:border-purple-400 focus:ring-purple-400/30'
                } bg-black text-purple-100 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all resize-none font-mono`}
                maxLength={10000}
              />
              <div className="flex justify-between mt-2">
                {errors.content && (
                  <p className="text-sm text-red-400 font-mono">{errors.content}</p>
                )}
                <p className="text-sm text-purple-400/70 ml-auto font-mono">
                  {formData.content.length}/10,000
                </p>
              </div>
            </div>

            {/* Tags - Tactical Labels */}
            <div className="border border-purple-400/30 rounded-xl p-4 bg-gradient-to-r from-gray-900/30 to-black/30">
              <label className="block text-sm font-medium text-purple-300 mb-2 uppercase tracking-wider">
                <FaTags className="inline mr-2 text-purple-400" />
                Tactical Tags * (Max 10)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 border border-purple-400/50 hover:bg-purple-400/30 transition-all shadow-lg shadow-purple-400/20"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-purple-300/70 hover:text-red-400 focus:outline-none transition-colors"
                    >
                      <FaTimes size={12} />
                    </button>
                  </motion.span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Deploy tactical tag..."
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-600 bg-black text-purple-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 transition-all font-mono"
                  maxLength={30}
                />
                <motion.button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!currentTag.trim() || formData.tags.length >= 10}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-black font-bold rounded-xl hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-purple-400/30 border border-purple-300"
                >
                  <FaPlus />
                </motion.button>
              </div>
              {errors.tags && (
                <p className="mt-2 text-sm text-red-400 font-mono">{errors.tags}</p>
              )}
            </div>

            {/* Code Snippet - Programming Terminal */}
            <div className="border border-purple-400/30 rounded-xl p-4 bg-gradient-to-r from-gray-900/30 to-black/30">
              <motion.button
                type="button"
                onClick={handleCodeSnippetToggle}
                whileHover={{ scale: 1.02, rotateX: 2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-gray-800 to-black border-2 border-green-400/50 hover:border-green-400 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20"
              >
                <FaCode className="text-green-400" size={20} />
                <span className="text-green-300 font-bold uppercase tracking-wide">
                  {showCodeEditor ? 'Disengage Code Terminal' : 'Engage Code Terminal'}
                </span>
                <div className="ml-auto w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              </motion.button>

              {showCodeEditor && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4 p-4 bg-black rounded-xl border-2 border-green-400/30"
                >
                  <div>
                    <label className="block text-sm font-medium text-green-300 mb-2 uppercase tracking-wider">
                      Programming Language Protocol
                    </label>
                    <select
                      value={formData.codeSnippet?.language || 'javascript'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        codeSnippet: {
                          ...prev.codeSnippet,
                          language: e.target.value
                        }
                      }))}
                      className="px-3 py-2 bg-black border-2 border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 text-green-200 transition-all font-mono"
                    >
                      {PROGRAMMING_LANGUAGES.map(lang => (
                        <option key={lang.value} value={lang.value} className="bg-black text-green-200">
                          {lang.label}
                        </option>
                      ))}
                    </select>
                    {errors.language && (
                      <p className="mt-1 text-sm text-red-400 font-mono">{errors.language}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-300 mb-2 uppercase tracking-wider">
                      Code Execution Block
                    </label>
                    <div className="border-2 border-green-400/30 rounded-xl overflow-hidden">
                      <HighlightSyntax
                        language={formData.codeSnippet?.language || 'javascript'}
                        value={formData.codeSnippet?.code || ''}
                        onChange={(value) => setFormData(prev => ({
                          ...prev,
                          codeSnippet: {
                            ...prev.codeSnippet,
                            code: value
                          }
                        }))}
                        className="bg-black text-green-200 font-mono"
                      />
                    </div>
                    {errors.codeSnippet && (
                      <p className="mt-1 text-sm text-red-400 font-mono">{errors.codeSnippet}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer - Command Console */}
          <div className="p-6 border-t-2 border-purple-400/30 bg-gradient-to-r from-gray-900 via-black to-gray-900 relative">
            {/* Command Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-pulse"></div>
            
            <div className="flex justify-between items-center">
              {/* System Status */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs font-mono uppercase">SYSTEMS ONLINE</span>
                </div>
              </div>
              
              {/* Action Controls */}
              <div className="flex space-x-3">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.02, rotateX: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 text-gray-300 bg-gradient-to-r from-gray-800 to-black border-2 border-gray-600 rounded-xl hover:border-red-400/50 hover:text-red-300 transition-all duration-300 font-bold uppercase tracking-wide"
                >
                  Abort Mission
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02, rotateX: 2 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-black font-bold rounded-xl hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2 shadow-lg hover:shadow-purple-400/30 border-2 border-purple-300 uppercase tracking-wide"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Deploying...</span>
                    </>
                  ) : (
                    <>
                      <span>Deploy Mission</span>
                      <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostCreationModal;
