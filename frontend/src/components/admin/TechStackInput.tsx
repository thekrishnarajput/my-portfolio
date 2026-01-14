import { useState, useEffect, useRef, useCallback } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { techStacksAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';

interface TechStack {
  _id: string;
  name: string;
}

interface TechStackInputProps {
  value: string[];
  onChange: (techStack: string[]) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Debounce hook for delaying API calls
 */
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const TechStackInput: React.FC<TechStackInputProps> = ({
  value,
  onChange,
  placeholder = 'Type to search or add technology...',
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<TechStack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showError, success } = useToast();

  // Debounce search query (300ms delay)
  const debouncedQuery = useDebounce(inputValue, 300);

  /**
   * Search tech stacks based on query
   */
  const searchTechStacks = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await techStacksAPI.search(query);
      const techStacks = response.data.data || [];
      
      // Filter out already selected tech stacks
      const filtered = techStacks.filter(
        (tech: TechStack) => !value.includes(tech.name.toLowerCase())
      );
      
      setSuggestions(filtered);
    } catch (error: any) {
      console.error('Error searching tech stacks:', error);
      // Don't show error toast for search failures, just log
    } finally {
      setIsLoading(false);
    }
  }, [value]);

  /**
   * Effect to trigger search when debounced query changes
   */
  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchTechStacks(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, searchTechStacks]);

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
  };

  /**
   * Handle selecting a suggestion
   */
  const handleSelectSuggestion = (techStack: TechStack) => {
    const techName = techStack.name.toLowerCase();
    
    // Check if already added
    if (!value.includes(techName)) {
      onChange([...value, techName]);
    }
    
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  /**
   * Handle creating a new tech stack
   */
  const handleCreateNew = async () => {
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) return;
    
    const techName = trimmedValue.toLowerCase();
    
    // Check if already in selected list
    if (value.includes(techName)) {
      setInputValue('');
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await techStacksAPI.create(trimmedValue);
      const newTechStack: TechStack = response.data.data;
      
      // Add to selected list (name is already stored in lowercase from backend)
      const normalizedName = newTechStack.name.toLowerCase();
      if (!value.includes(normalizedName)) {
        onChange([...value, normalizedName]);
      }
      setInputValue('');
      setShowSuggestions(false);
      success('Tech stack added successfully');
    } catch (error: any) {
      console.error('Error creating tech stack:', error);
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle deleting a tech stack from database
   */
  const handleDeleteTechStack = async (
    e: React.MouseEvent,
    techStack: TechStack
  ) => {
    e.stopPropagation(); // Prevent selecting the suggestion
    
    setIsDeleting(techStack._id);
    try {
      await techStacksAPI.delete(techStack._id);
      
      // Remove from suggestions if present
      setSuggestions((prev) =>
        prev.filter((tech) => tech._id !== techStack._id)
      );
      
      success('Tech stack deleted successfully');
    } catch (error: any) {
      console.error('Error deleting tech stack:', error);
      showError(error);
    } finally {
      setIsDeleting(null);
    }
  };

  /**
   * Handle key press
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // If there are suggestions, select the first one
      if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      } else if (inputValue.trim()) {
        // Otherwise, create new
        handleCreateNew();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  /**
   * Handle removing a selected tech stack
   */
  const handleRemoveTech = (tech: string) => {
    onChange(value.filter((t) => t !== tech));
  };

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <div className="flex gap-2 mb-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <FaSpinner className="animate-spin text-gray-400" />
            </div>
          )}
        </div>
        {inputValue.trim() && (
          <button
            type="button"
            onClick={handleCreateNew}
            disabled={isLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || inputValue.trim()) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((techStack) => (
                <li
                  key={techStack._id}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between group"
                  onClick={() => handleSelectSuggestion(techStack)}
                >
                  <span className="text-gray-900 dark:text-white capitalize">
                    {techStack.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteTechStack(e, techStack)}
                    disabled={isDeleting === techStack._id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-50"
                    title="Delete tech stack"
                  >
                    {isDeleting === techStack._id ? (
                      <FaSpinner className="animate-spin w-3 h-3" />
                    ) : (
                      <FaTimes className="w-3 h-3" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : inputValue.trim() ? (
            <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
              <p>No matches found. Press Enter or click "Add" to create "{inputValue}"</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Selected Tech Stacks */}
      <div className="flex flex-wrap gap-2">
        {value.map((tech) => (
          <span
            key={tech}
            className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full flex items-center gap-2 text-sm"
          >
            <span className="capitalize">{tech}</span>
            <button
              type="button"
              onClick={() => handleRemoveTech(tech)}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
              title="Remove from project"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Empty State */}
      {value.length === 0 && !inputValue && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          No technologies added yet. Start typing to search or add new ones.
        </p>
      )}
    </div>
  );
};

export default TechStackInput;
