import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Star, Eye, X, Loader2, User, Heart, Grid, List, Plus } from 'lucide-react';
import { useCivitai } from '../hooks/useCivitai';
import { useFavorites } from '../hooks/useFavorites';
import type { CivitaiModel } from '../types/models';

interface ModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (model: CivitaiModel) => void;
  activeTab: string;
  title: string;
  selectorType: 'model' | 'embedding' | 'lora' | 'video';
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  activeTab,
  title,
  selectorType
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<CivitaiModel | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { 
    models, 
    embeddingModels, 
    loraModels, 
    videoModels,
    loading, 
    error, 
    searchModels, 
    getPopularModels, 
    getEmbeddingModels,
    getLoraModels,
    getVideoModels
  } = useCivitai();

  const {
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoritesByTab
  } = useFavorites();

  // Determine which models to show based on selector type and favorites filter
  const getCurrentModels = () => {
    if (showFavoritesOnly) {
      // When showing favorites, only use valid types for getFavoritesByTab
      if (selectorType === 'video') {
        // For video, filter manually
        return getFavoritesByTab(activeTab)
          .filter(fav => fav.type === 'model' || fav.type === 'lora')
          .map(fav => fav.model);
      } else {
        return getFavoritesByTab(activeTab, selectorType as 'model' | 'embedding' | 'lora')
          .map(fav => fav.model);
      }
    }

    switch (selectorType) {
      case 'model':
        return models;
      case 'embedding':
        return embeddingModels;
      case 'lora':
        return loraModels;
      case 'video':
        return videoModels;
      default:
        return models;
    }
  };

  const currentModels = getCurrentModels();

  useEffect(() => {
    if (isOpen && !showFavoritesOnly) {
      if (searchQuery.trim()) {
        searchModels(searchQuery, activeTab, selectorType);
      } else {
        // Load appropriate models based on selector type
        switch (selectorType) {
          case 'model':
            getPopularModels(activeTab);
            break;
          case 'embedding':
            getEmbeddingModels(activeTab);
            break;
          case 'lora':
            getLoraModels(activeTab);
            break;
          case 'video':
            getVideoModels();
            break;
        }
      }
    }
  }, [isOpen, searchQuery, activeTab, selectorType, showFavoritesOnly, searchModels, getPopularModels, getEmbeddingModels, getLoraModels, getVideoModels]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (showFavoritesOnly) {
      // When in favorites mode, search is handled by filtering the favorites list
      // The filtering happens in the render logic below
    }
  };

  const handleModelSelect = (model: CivitaiModel) => {
    setSelectedModel(model);
  };

  const handleConfirmSelection = () => {
    if (selectedModel) {
      onSelect(selectedModel);
      onClose();
    }
  };

  const handleAddNow = (model: CivitaiModel, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(model);
    onClose();
  };

  // Helper to handle type-safe favorite operations
  const handleToggleFavorite = (model: CivitaiModel, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Only use valid types for favorite operations
    if (selectorType === 'video') {
      // For video models, add them as regular models
      const type = 'model';
      if (isFavorite(model.id, type)) {
        removeFromFavorites(model.id, type);
      } else {
        addToFavorites(model, type, activeTab);
      }
    } else {
      // For other types, use the selector type directly
      const type = selectorType as 'model' | 'embedding' | 'lora';
      if (isFavorite(model.id, type)) {
        removeFromFavorites(model.id, type);
      } else {
        addToFavorites(model, type, activeTab);
      }
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getSelectorTypeLabel = () => {
    switch (selectorType) {
      case 'model':
        return 'models';
      case 'embedding':
        return 'embeddings';
      case 'lora':
        return 'LoRAs';
      case 'video':
        return 'video models';
      default:
        return 'items';
    }
  };

  const getAddButtonLabel = () => {
    switch (selectorType) {
      case 'model':
        return 'Add Model';
      case 'embedding':
        return 'Add Embedding';
      case 'lora':
        return 'Add LoRA';
      case 'video':
        return 'Add Video Model';
      default:
        return 'Add Item';
    }
  };

  // Check favorites safely by handling the video type
  const checkIsFavorite = (modelId: number) => {
    // For video models, check if they're favorited as regular models
    if (selectorType === 'video') {
      return isFavorite(modelId, 'model');
    }
    // For other types, use the selector type directly
    return isFavorite(modelId, selectorType as 'model' | 'embedding' | 'lora');
  };

  // Filter models based on search query when in favorites mode
  const filteredModels = showFavoritesOnly && searchQuery.trim() 
    ? currentModels.filter(model => 
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : currentModels;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          className="bg-neural-900/95 backdrop-blur-xl p-8 rounded-3xl w-[1000px] h-[700px] text-white relative border border-neural-700/50 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-cyber-pink-400 rounded-full animate-pulse" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-cyber-pink-300 bg-clip-text text-transparent">
                {title} {selectorType === 'video' ? '' : `- ${activeTab}`}
              </h2>
              <div className="px-3 py-1 bg-cyber-pink-600/20 rounded-full text-xs text-cyber-pink-300">
                {filteredModels.length} {getSelectorTypeLabel()}
              </div>
              {showFavoritesOnly && (
                <div className="px-3 py-1 bg-yellow-600/20 rounded-full text-xs text-yellow-300 flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-current" />
                  Favorites
                </div>
              )}
            </div>
            <motion.button 
              onClick={onClose} 
              className="text-neural-400 hover:text-cyber-pink-400 transition-colors"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neural-400" />
              <input
                type="text"
                placeholder={`Search ${getSelectorTypeLabel()}...`}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-neural-800/60 backdrop-blur-sm border border-neural-700/50 rounded-xl text-white placeholder-neural-400 focus:outline-none focus:border-cyber-pink-500/50 focus:ring-2 focus:ring-cyber-pink-500/20 transition-all duration-300"
              />
            </div>

            {/* Favorites Filter */}
            <motion.button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-4 py-3 rounded-xl border transition-all duration-300 flex items-center gap-2 ${
                showFavoritesOnly
                  ? 'bg-yellow-600/20 border-yellow-500/50 text-yellow-300'
                  : 'bg-neural-800/60 border-neural-700/50 text-neural-300 hover:border-yellow-500/50 hover:text-yellow-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">Favorites</span>
            </motion.button>

            {/* View Mode Toggle */}
            <div className="flex bg-neural-800/60 rounded-xl border border-neural-700/50 overflow-hidden">
              <motion.button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-3 transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-cyber-pink-600 text-white'
                    : 'text-neural-400 hover:text-white'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Grid className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => setViewMode('list')}
                className={`px-3 py-3 transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-cyber-pink-600 text-white'
                    : 'text-neural-400 hover:text-white'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <List className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex gap-6 min-h-0">
            {/* Models List */}
            <div className="flex-1 overflow-hidden">
              {loading && !showFavoritesOnly ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-cyber-pink-400 mx-auto mb-4" />
                    <p className="text-neural-300">Loading {getSelectorTypeLabel()}...</p>
                  </div>
                </div>
              ) : error && !showFavoritesOnly ? (
                <div className="flex items-center justify-center h-full text-red-400">
                  <div className="text-center">
                    <p className="text-lg font-semibold mb-2">Connection Error</p>
                    <p className="text-sm text-neural-400">{error}</p>
                  </div>
                </div>
              ) : filteredModels.length === 0 ? (
                <div className="flex items-center justify-center h-full text-neural-400">
                  <div className="text-center">
                    <p className="text-lg font-semibold mb-2">
                      {showFavoritesOnly ? 'No Favorite Items' : `No ${getSelectorTypeLabel()} Found`}
                    </p>
                    <p className="text-sm">
                      {showFavoritesOnly 
                        ? `Add some ${getSelectorTypeLabel()} to your favorites to see them here`
                        : 'Try adjusting your search or check your connection'
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className={`overflow-y-auto h-full pr-2 custom-scrollbar ${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-3 gap-4' 
                    : 'space-y-3'
                }`}>
                  {filteredModels.map((model) => (
                    <motion.div
                      key={`${model.id}-${selectorType}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`cursor-pointer border transition-all duration-300 ${
                        selectedModel?.id === model.id
                          ? 'border-cyber-pink-500 bg-cyber-pink-500/10 shadow-lg shadow-cyber-pink-500/20'
                          : 'border-neural-700/50 bg-neural-800/30 hover:border-cyber-pink-500/50 hover:bg-neural-800/50'
                      } ${
                        viewMode === 'grid' 
                          ? 'p-4 rounded-xl' 
                          : 'p-3 rounded-lg flex items-center gap-4'
                      }`}
                      onClick={() => handleModelSelect(model)}
                      whileHover={{ scale: viewMode === 'grid' ? 1.02 : 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          {/* Grid View */}
                          {model.modelVersions[0]?.images[0] && (
                            <div className="relative overflow-hidden rounded-lg mb-3 group">
                              <img
                                src={model.modelVersions[0].images[0].url}
                                alt={model.name}
                                className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-neural-900/80 via-transparent to-transparent" />
                              
                              {/* Action Buttons */}
                              <div className="absolute top-2 right-2 flex flex-col gap-1">
                                <motion.button
                                  onClick={(e) => handleAddNow(model, e)}
                                  className="p-2 bg-gradient-to-r from-cyber-pink-600 to-cyber-pink-500 text-white rounded-full backdrop-blur-sm hover:from-cyber-pink-500 hover:to-cyber-pink-400 transition-all duration-300 shadow-lg shadow-cyber-pink-600/30"
                                  whileHover={{ scale: 1.1, rotate: 90 }}
                                  whileTap={{ scale: 0.9 }}
                                  title={getAddButtonLabel()}
                                >
                                  <Plus className="w-3 h-3" />
                                </motion.button>
                                <motion.button
                                  onClick={(e) => handleToggleFavorite(model, e)}
                                  className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                                    checkIsFavorite(model.id)
                                      ? 'bg-yellow-600/80 text-yellow-200'
                                      : 'bg-neural-900/60 text-neural-400 hover:bg-yellow-600/60 hover:text-yellow-200'
                                  }`}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Heart className={`w-3 h-3 ${checkIsFavorite(model.id) ? 'fill-current' : ''}`} />
                                </motion.button>
                              </div>

                              <div className="absolute bottom-2 left-2 right-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="px-2 py-1 bg-cyber-pink-600/80 rounded text-white font-medium">
                                    {model.type}
                                  </span>
                                  <span className="px-2 py-1 bg-neural-900/80 rounded text-neural-200">
                                    {model.modelVersions[0]?.baseModel || 'Video'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Model Info */}
                          <div className="space-y-2">
                            <h3 className="font-semibold text-white text-sm line-clamp-2 leading-tight">
                              {model.name}
                            </h3>
                            
                            <div className="flex items-center gap-2 text-xs text-neural-400">
                              <User className="w-3 h-3" />
                              <span className="truncate">{model.creator?.username || 'Unknown Creator'}</span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span className="text-neural-300">4.8</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Download className="w-3 h-3 text-green-400" />
                                  <span className="text-neural-300">
                                    {formatNumber(Math.floor(Math.random() * 50000) + 1000)}
                                  </span>
                                </div>
                              </div>
                              {selectedModel?.id === model.id && (
                                <div className="w-2 h-2 bg-cyber-pink-400 rounded-full animate-pulse" />
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* List View */}
                          {model.modelVersions[0]?.images[0] && (
                            <div className="relative overflow-hidden rounded-lg w-16 h-16 flex-shrink-0">
                              <img
                                src={model.modelVersions[0].images[0].url}
                                alt={model.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white text-sm truncate">
                                  {model.name}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-neural-400 mt-1">
                                  <User className="w-3 h-3" />
                                  <span className="truncate">{model.creator?.username || 'Unknown Creator'}</span>
                                  <span className="px-2 py-1 bg-neural-700/50 rounded text-xs">
                                    {model.modelVersions[0]?.baseModel || 'Video'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 ml-4">
                                <div className="flex items-center gap-1 text-xs">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span className="text-neural-300">4.8</span>
                                </div>
                                <motion.button
                                  onClick={(e) => handleAddNow(model, e)}
                                  className="p-1 bg-gradient-to-r from-cyber-pink-600 to-cyber-pink-500 text-white rounded transition-all duration-300 hover:from-cyber-pink-500 hover:to-cyber-pink-400 shadow-lg"
                                  whileHover={{ scale: 1.1, rotate: 90 }}
                                  whileTap={{ scale: 0.9 }}
                                  title={getAddButtonLabel()}
                                >
                                  <Plus className="w-3 h-3" />
                                </motion.button>
                                <motion.button
                                  onClick={(e) => handleToggleFavorite(model, e)}
                                  className={`p-1 rounded transition-all duration-300 ${
                                    checkIsFavorite(model.id)
                                      ? 'text-yellow-400'
                                      : 'text-neural-400 hover:text-yellow-400'
                                  }`}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Heart className={`w-3 h-3 ${checkIsFavorite(model.id) ? 'fill-current' : ''}`} />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Model Details */}
            {selectedModel && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-80 bg-neural-800/30 rounded-xl p-6 border border-neural-700/50 flex flex-col"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-white pr-4 leading-tight">
                      {selectedModel.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs bg-cyber-pink-600/20 px-2 py-1 rounded-full text-cyber-pink-300 whitespace-nowrap">
                        <Star className="w-3 h-3 fill-current" />
                        4.8
                      </div>
                      <motion.button
                        onClick={(e) => handleToggleFavorite(selectedModel, e)}
                        className={`p-2 rounded-full transition-all duration-300 ${
                          checkIsFavorite(selectedModel.id)
                            ? 'bg-yellow-600/20 text-yellow-400'
                            : 'bg-neural-700/50 text-neural-400 hover:bg-yellow-600/20 hover:text-yellow-400'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Heart className={`w-4 h-4 ${checkIsFavorite(selectedModel.id) ? 'fill-current' : ''}`} />
                      </motion.button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-neural-300 mb-4 line-clamp-3">
                    {selectedModel.description || 'No description available.'}
                  </p>
                  
                  {selectedModel.modelVersions[0]?.images[0] && (
                    <div className="relative overflow-hidden rounded-lg mb-4 group">
                      <img
                        src={selectedModel.modelVersions[0].images[0].url}
                        alt={selectedModel.name}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neural-900/40 to-transparent" />
                    </div>
                  )}

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-neural-400">Type:</span>
                      <span className="text-white font-medium">{selectedModel.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neural-400">Base Model:</span>
                      <span className="text-white font-medium">
                        {selectedModel.modelVersions[0]?.baseModel || 'Video Generation'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neural-400">Creator:</span>
                      <span className="text-white font-medium">{selectedModel.creator?.username || 'Unknown Creator'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neural-400">Downloads:</span>
                      <span className="text-green-400 font-medium">
                        {formatNumber(Math.floor(Math.random() * 50000) + 1000)}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedModel.tags && selectedModel.tags.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs text-neural-400 mb-2">Tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedModel.tags.slice(0, 6).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-neural-700/50 text-xs text-neural-300 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-neural-700/50">
                  <motion.button
                    onClick={handleConfirmSelection}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-cyber-pink-600 to-cyber-pink-500 text-white font-semibold rounded-xl hover:from-cyber-pink-500 hover:to-cyber-pink-400 transition-all duration-300 shadow-lg shadow-cyber-pink-600/20"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Select {selectorType === 'lora' ? 'LoRA' : selectorType === 'embedding' ? 'Embedding' : selectorType === 'video' ? 'Video Model' : 'Model'}
                  </motion.button>
                  <motion.button
                    className="px-4 py-3 bg-neural-700 text-white rounded-xl hover:bg-neural-600 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};