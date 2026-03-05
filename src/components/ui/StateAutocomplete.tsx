import * as React from 'react';
import { Input } from './input';
import { Mexico } from '@/constants/constants';
import { ChevronDown } from 'lucide-react';

interface StateAutocompleteProps {
  value: string; // state code (e.g., 'AGU') or empty string
  onChange: (stateCode: string) => void; // returns state code
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export const StateAutocomplete: React.FC<StateAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Search and select state...',
  disabled = false,
  className = '',
  required = false,
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const [showOptions, setShowOptions] = React.useState(false);
  const [filteredOptions, setFilteredOptions] = React.useState(Mexico);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Get display value (state name) from code value
  const displayValue = React.useMemo(() => {
    if (!value) return '';
    const found = Mexico.find((s) => s.code === value);
    return found ? found.state : '';
  }, [value]);

  React.useEffect(() => {
    setInputValue(displayValue);
  }, [displayValue]);

  // Filter options based on input
  React.useEffect(() => {
    const searchTerm = inputValue ? inputValue.toLowerCase() : '';
    const filtered = Mexico.filter(
      (state) =>
        state.state.toLowerCase().includes(searchTerm) ||
        state.code.toLowerCase().includes(searchTerm),
    );
    setFilteredOptions(filtered);
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowOptions(true);
  };

  const handleOptionClick = (stateCode: string) => {
    onChange(stateCode); // Pass code to onChange
    setShowOptions(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowOptions(false), 150);
  };

  const handleFocus = () => {
    setShowOptions(true);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`pr-10 ${className}`}
          autoComplete="off"
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      </div>

      {showOptions && filteredOptions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((state) => (
            <li
              key={state.code}
              className={`px-4 py-2 cursor-pointer transition-colors ${
                value === state.code
                  ? 'bg-emerald-600/30 text-emerald-200'
                  : 'hover:bg-slate-700/50 text-slate-200'
              }`}
              onMouseDown={() => handleOptionClick(state.code)}
            >
              <div className="flex justify-between items-center">
                <span>{state.state}</span>
                <span className="text-slate-400 text-sm ml-2">{state.code}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showOptions && filteredOptions.length === 0 && inputValue && (
        <ul className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-lg p-3">
          <li className="text-slate-400 text-sm">No states found</li>
        </ul>
      )}
    </div>
  );
};
