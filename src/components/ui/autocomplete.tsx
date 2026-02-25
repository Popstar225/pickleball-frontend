import * as React from 'react';
import { Input } from './input';

interface AutocompleteProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  className = '',
}) => {
  const [inputValue, setInputValue] = React.useState(value || '');
  const [showOptions, setShowOptions] = React.useState(false);
  const [filteredOptions, setFilteredOptions] = React.useState<string[]>(options);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  React.useEffect(() => {
    setFilteredOptions(
      options.filter((option) => option.toLowerCase().includes(inputValue.toLowerCase())),
    );
  }, [inputValue, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowOptions(true);
    onChange('');
  };

  const handleOptionClick = (option: string) => {
    setInputValue(option);
    setShowOptions(false);
    onChange(option);
  };

  const handleBlur = () => {
    setTimeout(() => setShowOptions(false), 100);
  };

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowOptions(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        autoComplete="off"
      />
      {showOptions && filteredOptions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-lg max-h-48 overflow-auto">
          {filteredOptions.map((option) => (
            <li
              key={option}
              className="px-4 py-2 cursor-pointer hover:bg-emerald-600/20 text-slate-200"
              onMouseDown={() => handleOptionClick(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
