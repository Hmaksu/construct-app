'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface SmartLocationInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    required?: boolean;
}

export default function SmartLocationInput({ value, onChange, placeholder = "Search for a location worldwide...", required = false }: SmartLocationInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchLocations = async (query: string) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            setIsOpen(false);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&accept-language=en`);
            const data = await response.json();

            if (data && data.length > 0) {
                // Nominatim returns a display_name property
                const formattedSuggestions = data.map((item: any) => {
                    // Extract a clean "City, Country" or "Region, Country" format if possible, else use display_name
                    const addr = item.address;
                    if (addr) {
                        const city = addr.city || addr.town || addr.village || addr.state || item.name;
                        const country = addr.country;
                        if (city && country && city !== country) {
                            return `${city}, ${country}`;
                        } else if (country) {
                            return country;
                        }
                    }
                    // Fallback to the first two parts of display name
                    return item.display_name.split(',').slice(0, 3).join(',');
                });

                // Remove duplicates
                const uniqueSuggestions = Array.from(new Set(formattedSuggestions)) as string[];

                setSuggestions(uniqueSuggestions);
                setIsOpen(true);
            } else {
                setSuggestions([]);
                setIsOpen(false);
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(val);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        setLoading(true);
        debounceTimeout.current = setTimeout(() => {
            fetchLocations(val);
        }, 500); // 500ms debounce
    };

    const handleSelect = (suggestion: string) => {
        onChange(suggestion);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <MapPin size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (value && suggestions.length > 0) setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    required={required}
                    autoComplete="off"
                    style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        transition: 'border-color 0.2s',
                    }}
                />
                {loading && (
                    <div style={{ position: 'absolute', right: '12px' }} className="spinner">
                        <Loader2 size={16} className="animate-spin" style={{ color: 'var(--text-secondary)' }} />
                    </div>
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    margin: '4px 0 0 0',
                    padding: '8px 0',
                    listStyle: 'none',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 50,
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                    {suggestions.map((sugg, idx) => (
                        <li
                            key={idx}
                            onClick={() => handleSelect(sugg)}
                            style={{
                                padding: '8px 16px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                (e.target as HTMLLIElement).style.backgroundColor = 'var(--bg-secondary)';
                            }}
                            onMouseLeave={(e) => {
                                (e.target as HTMLLIElement).style.backgroundColor = 'transparent';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MapPin size={14} style={{ color: 'var(--text-secondary)' }} />
                                <span>{sugg}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
