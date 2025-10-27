import React, {
  ChangeEvent,
  KeyboardEvent,
  useState,
  InputHTMLAttributes,
} from "react";

interface FloatingInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  showPasswordToggle?: boolean;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  onKeyDown,
  required,
  className = "",
  showPasswordToggle = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`relative w-full ${className}`}>
      <input
        id={id}
        type={showPasswordToggle && showPassword ? "text" : type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        required={required}
        className="peer block w-full rounded-lg border border-gray-300 bg-transparent px-3 pt-5 pb-2 text-sm text-gray-900 placeholder-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        placeholder=" " // cần để label hoạt động với peer
        {...props}
      />
      <label
        htmlFor={id}
        className="absolute left-3 top-2.5 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-blue-500"
      >
        {label}
      </label>

      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-3 text-gray-500 text-sm"
        >
          {showPassword ? "Ẩn" : "Hiện"}
        </button>
      )}
    </div>
  );
};

export default FloatingInput;
