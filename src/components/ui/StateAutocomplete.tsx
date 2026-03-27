import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Mexico } from '@/constants/constants';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({});
  const inputRef = React.useRef<HTMLInputElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

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

  // Recalculate portal position whenever dropdown opens or window scrolls/resizes
  const updateDropdownPosition = React.useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      // Override pointer-events: none that Radix Dialog sets on document.body
      pointerEvents: 'auto',
    });
  }, []);

  React.useEffect(() => {
    if (!showOptions) return;
    updateDropdownPosition();
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [showOptions, updateDropdownPosition]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowOptions(true);
  };

  const handleOptionClick = (stateCode: string) => {
    onChange(stateCode);
    setShowOptions(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowOptions(false), 150);
  };

  const handleFocus = () => {
    setInputValue('');
    setShowOptions(true);
  };

  const dropdown =
    showOptions && filteredOptions.length > 0
      ? ReactDOM.createPortal(
          <ul
            style={dropdownStyle}
            className="bg-[#0d1117] border border-white/[0.08] rounded-lg shadow-2xl max-h-60 overflow-auto"
          >
            {filteredOptions.map((state) => (
              <li
                key={state.code}
                className={`px-4 py-2 cursor-pointer transition-colors text-sm ${
                  value === state.code
                    ? 'bg-[#ace600]/10 text-[#ace600]'
                    : 'hover:bg-white/[0.05] text-white/80'
                }`}
                onMouseDown={(e) => { e.preventDefault(); handleOptionClick(state.code); }}
              >
                <div className="flex justify-between items-center">
                  <span>{state.state}</span>
                  <span className="text-white/30 text-xs ml-2">{state.code}</span>
                </div>
              </li>
            ))}
          </ul>,
          document.body,
        )
      : showOptions && filteredOptions.length === 0 && inputValue
        ? ReactDOM.createPortal(
            <ul
              style={dropdownStyle}
              className="bg-[#0d1117] border border-white/[0.08] rounded-lg shadow-2xl p-3"
            >
              <li className="text-white/40 text-sm">No se encontraron estados</li>
            </ul>,
            document.body,
          )
        : null;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          className={cn(
            'flex w-full rounded-md border px-3 py-2 outline-none transition-colors pr-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#ace600]/50 focus:border-[#ace600]/50 disabled:opacity-35 disabled:cursor-not-allowed',
            className,
          )}
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
      </div>

      {dropdown}
    </div>
  );
};
