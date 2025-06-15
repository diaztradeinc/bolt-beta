import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Download, Upload, Trash2, X, Star, User, Grid, List } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import type { CivitaiModel } from '../types/models';

interface FavoritesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (model: CivitaiModel, type: 'model' | 'embedding' | 'lora') => void;
}

export const FavoritesManager: React.FC<FavoritesManagerProps> = ({
  isOpen,
  onClose,
  onSelectModel
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'model' | 'embedding' | 'lora'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    favorites,
    removeFromFavorites,
    clearFavorites,
    exportFavorites,
    importFavorites
  } = useFavorites();

  const filteredFavorites = favorites.filter(fav => {
    const matchesFilter = activeFilter === 'all' || fav.type === activeFilter;
    const matchesSearch = searchQuery.trim() === '' || 
      fav.model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.model.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.model.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const handleExport = () => {
    const data = exportFavorites();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dreamflux-favorites.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (importFavorites(content)) {
          alert('Favorites imported successfully!');
        } else {
          alert('Failed to import favorites. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTypeColor = (type: 'model' | 'embedding' | 'lora') => {
    switch (type) {
      case 'model':
        return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
      case 'embedding':
        return 'bg-purple-600/20 text-purple-300 border-purple-500/30';
      case 'lora':
        return 'bg-green-600/20 text-green-300 border-green-500/30';
      default:
        return 'bg-neural-600/20 text-neural-300 border-neural-500/30';
    }
  };

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
              <div className="p-2 bg-yellow-600/20 rounded-xl">
                <Heart className="w-6 h-6 text-yellow-400 fill-current" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-yellow-300 bg-clip-text text-transparent">
                  Favorites Manager
                </h2>
                <p className="text-sm text-neural-400">
                  {favorites.length} favorite items saved
                </p>
              </div>
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
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-neural-800/60 backdrop-blur-sm border border-neural-700/50 rounded-xl text-white placeholder-neural-400 focus:outline-none focus:border-cyber-pink-500/50 focus:ring-2 focus:ring-cyber-pink-500/20 transition-all duration-300"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-neural-800/60 rounded-xl border border-neural-700/50 overflow-hidden">
              {[
                { key: 'all', label: 'All', count: favorites.length },
                { key: 'model', label: 'Models', count: favorites.filter(f => f.type === 'model').length },
                { key: 'embedding', label: 'Embeddings', count: favorites.filter(f => f.type === 'embedding').length },
                { key: 'lora', label: 'LoRAs', count: favorites.filter(f => f.type === 'lora').length }
              ].map((filter) => (
                <motion.button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as any)}
                  className={`px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    activeFilter === filter.key
                      ? 'bg-cyber-pink-600 text-white'
                      : 'text-neural-400 hover:text-white'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {filter.label} ({filter.count})
                </motion.button>
              ))}
            </div>

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

            {/* Actions */}
            <div className="flex gap-2">
              <motion.button
                onClick={handleExport}
                className="px-3 py-3 bg-green-600/20 border border-green-500/30 text-green-300 rounded-xl hover:bg-green-600/30 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Export Favorites"
              >
                <Download className="w-4 h-4" />
              </motion.button>
              
              <motion.label
                className="px-3 py-3 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-xl hover:bg-blue-600/30 transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Import Favorites"
              >
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </motion.label>

              <motion.button
                onClick={clearFavorites}
                className="px-3 py-3 bg-red-600/20 border border-red-500/30 text-red-300 rounded-xl hover:bg-red-600/30 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Clear All Favorites"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Favorites List */}
          <div className="flex-1 overflow-hidden">
            {filteredFavorites.length === 0 ? (
              <div className="flex items-center justify-center h-full text-neural-400">
                <div className="text-center">
                  <Heart className="w-16 h-16 text-neural-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold mb-2">No Favorites Found</p>
                  <p className="text-sm">
                    {searchQuery.trim() 
                      ? 'Try adjusting your search query'
                      : 'Start adding models, embeddings, and LoRAs to your favorites'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className={`overflow-y-auto h-full pr-2 custom-scrollbar ${
                viewMode === 'grid' 
                  ? 'grid grid-cols-4 gap-4' 
                  : 'space-y-3'
              }`}>
                {filteredFavorites.map((favorite) => (
                  <motion.div
                    key={`${favorite.id}-${favorite.type}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border border-neural-700/50 bg-neural-800/30 hover:border-cyber-pink-500/50 hover:bg-neural-800/50 transition-all duration-300 cursor-pointer ${
                      viewMode === 'grid' 
                        ? 'p-4 rounded-xl' 
                        : 'p-3 rounded-lg flex items-center gap-4'
                    }`}
                    onClick={() => onSelectModel(favorite.model, favorite.type)}
                    whileHover={{ scale: viewMode === 'grid' ? 1.02 : 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        {/* Grid View */}
                        {favorite.model.modelVersions[0]?.images[0] && (
                          <div className="relative overflow-hidden rounded-lg mb-3 group">
                            <img
                              src={favorite.model.modelVersions[0].images[0].url}
                              alt={favorite.model.name}
                              className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-neural-900/80 via-transparent to-transparent" />
                            
                            {/* Remove Button */}
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromFavorites(favorite.id, favorite.type);
                              }}
                              className="absolute top-2 right-2 p-1 bg-red-600/80 text-red-200 rounded-full backdrop-blur-sm hover:bg-red-600 transition-all duration-300"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <X className="w-3 h-3" />
                            </motion.button>

                            <div className="absolute bottom-2 left-2 right-2">
                              <div className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(favorite.type)}`}>
                                {favorite.type.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <h3 className="font-semibold text-white text-sm line-clamp-2 leading-tight">
                            {favorite.model.name}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-xs text-neural-400">
                            <User className="w-3 h-3" />
                            <span className="truncate">{favorite.model.creator?.username || 'Unknown'}</span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-neural-300">4.8</span>
                            </div>
                            <span className="text-neural-500">
                              {new Date(favorite.addedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* List View */}
                        {favorite.model.modelVersions[0]?.images[0] && (
                          <div className="relative overflow-hidden rounded-lg w-16 h-16 flex-shrink-0">
                            <img
                              src={favorite.model.modelVersions[0].images[0].url}
                              alt={favorite.model.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white text-sm truncate">
                                {favorite.model.name}
                              </h3>
                              <div className="flex items-center gap-2 text-xs text-neural-400 mt-1">
                                <User className="w-3 h-3" />
                                <span className="truncate">{favorite.model.creator?.username || 'Unknown'}</span>
                                <div className={`px-2 py-1 rounded border ${getTypeColor(favorite.type)}`}>
                                  {favorite.type.toUpperCase()}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <div className="flex items-center gap-1 text-xs">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-neural-300">4.8</span>
                              </div>
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromFavorites(favorite.id, favorite.type);
                                }}
                                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <X className="w-4 h-4" />
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};