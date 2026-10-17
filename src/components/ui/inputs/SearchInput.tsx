"use client";

import React, { useEffect, useState, useRef } from "react";
import Input from "@/components/ui/inputs/Input";
import { IoSearchSharp } from "react-icons/io5";

interface SearchInputProps {
  value: string;
  onDebouncedChange: (value: string) => void;
  delay?: number;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onDebouncedChange,
  delay = 350,
  placeholder = "Search...",
  className = "",
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const isFirstRender = useRef(true);
  const callbackRef = useRef(onDebouncedChange);

  useEffect(() => {
    callbackRef.current = onDebouncedChange;
  }, [onDebouncedChange]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
      callbackRef.current(internalValue);
    }, delay);

    return () => clearTimeout(handler);
  }, [internalValue, delay]);

  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value);
    }
  }, [value]);

  return (
    <div className={`relative w-full ${className}`}>
      <Input
        type="text"
        icon={<IoSearchSharp className="w-4 h-4" />}
        placeholder={placeholder}
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
