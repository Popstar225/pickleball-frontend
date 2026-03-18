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
    setInputValue('');
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
          className={`pr-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:ring-[#ace600]/50 focus-visible:border-[#ace600]/50 disabled:opacity-35 ${className}`}
          autoComplete="off"
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
      </div>

      {showOptions && filteredOptions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-[#0d1117] border border-white/[0.08] rounded-lg shadow-2xl max-h-60 overflow-auto">
          {filteredOptions.map((state) => (
            <li
              key={state.code}
              className={`px-4 py-2 cursor-pointer transition-colors text-sm ${
                value === state.code
                  ? 'bg-[#ace600]/10 text-[#ace600]'
                  : 'hover:bg-white/[0.05] text-white/80'
              }`}
              onMouseDown={() => handleOptionClick(state.code)}
            >
              <div className="flex justify-between items-center">
                <span>{state.state}</span>
                <span className="text-white/30 text-xs ml-2">{state.code}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showOptions && filteredOptions.length === 0 && inputValue && (
        <ul className="absolute z-50 mt-1 w-full bg-[#0d1117] border border-white/[0.08] rounded-lg shadow-2xl p-3">
          <li className="text-white/40 text-sm">No se encontraron estados</li>
        </ul>
      )}
    </div>
  );
};
