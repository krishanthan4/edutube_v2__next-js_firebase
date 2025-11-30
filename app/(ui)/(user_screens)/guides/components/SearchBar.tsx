'use client';
import { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Search guides..." 
}: SearchBarProps) {
  return (
    <div className="relative max-w-md mx-auto">
      <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full bg-white/90 backdrop-blur-sm pl-12 pr-12 py-3 border border-white/20 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-lg"
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}