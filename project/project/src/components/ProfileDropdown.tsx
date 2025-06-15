import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, Crown, Heart, ChevronDown } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileDropdownProps {
  user: SupabaseUser | null;
  onSignOut: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate avatar from email
  const getAvatarUrl = (email: string) => {
    const hash = btoa(email).slice(0, 8);
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${hash}&backgroundColor=ec4899,8b5cf6,06b6d4`;
  };

  const menuItems = [
    {
      icon: Settings,
      label: 'Settings',
      action: () => {
        console.log('Settings clicked');
        setIsOpen(false);
      }
    },
    {
      icon: Crown,
      label: 'Subscription',
      action: () => {
        console.log('Subscription clicked');
        setIsOpen(false);
      }
    },
    {
      icon: Heart,
      label: 'Favorites',
      action: () => {
        console.log('Favorites clicked');
        setIsOpen(false);
      }
    },
    {
      icon: LogOut,
      label: 'Sign Out',
      action: () => {
        onSignOut();
        setIsOpen(false);
      },
      danger: true
    }
  ];

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 bg-neural-800/60 border border-neural-700/50 rounded-xl hover:bg-neural-700/60 hover:border-cyber-pink-500/50 transition-all duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Avatar */}
        <div className="relative">
          <img
            src={getAvatarUrl(user.email || '')}
            alt="Profile"
            className="w-8 h-8 rounded-full bg-cyber-pink-600"
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-neural-900 rounded-full" />
        </div>

        {/* User Info */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-white truncate max-w-32">
            {user.email?.split('@')[0]}
          </p>
          <p className="text-xs text-neural-400">Pro Member</p>
        </div>

        {/* Dropdown Arrow */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-neural-400" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-64 bg-neural-900/95 backdrop-blur-xl border border-neural-700/50 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-neural-700/50">
              <div className="flex items-center gap-3">
                <img
                  src={getAvatarUrl(user.email || '')}
                  alt="Profile"
                  className="w-12 h-12 rounded-full bg-cyber-pink-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-neural-400 truncate">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Crown className="w-3 h-3 text-cyber-pink-400 fill-current" />
                    <span className="text-xs text-cyber-pink-400 font-medium">Pro Member</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={index}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 ${
                    item.danger
                      ? 'hover:bg-red-600/20 text-red-300 hover:text-red-200'
                      : 'hover:bg-neural-800/60 text-neural-300 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neural-700/50 bg-neural-800/30">
              <p className="text-xs text-neural-500 text-center">
                Dreamflux AI v1.0.0
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};