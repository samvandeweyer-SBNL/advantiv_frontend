
import React, { useState, useRef, useEffect } from 'react';

const MOCK_CUSTOMERS = [
  "All Customers",
  "123planten",
  "Art & Craft",
  "BENU",
  "Ben",
  "Blink",
  "Delta",
  "TechTrendz Inc.",
  "Springbok Agency",
  "Global Mart",
  "Eco Solutions",
  "Future Dynamics"
];

interface Props {
  selected: string;
  onSelect: (name: string) => void;
}

const CustomerDropdown: React.FC<Props> = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCustomers = MOCK_CUSTOMERS.filter(c => 
    c.toLowerCase().includes(search.toLowerCase())
  );

  const displaySelected = selected || "All Customers";

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-[#161b2c] border border-slate-800 rounded-xl hover:bg-[#1c233a] transition-colors group min-w-[200px]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="text-sm font-medium text-slate-200">
          {displaySelected} <span className="text-slate-500 font-normal ml-1">({MOCK_CUSTOMERS.length})</span>
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-auto text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-[#111626] border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                autoFocus
                type="text"
                className="w-full bg-[#1c233a] border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto p-2">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Customers ({filteredCustomers.length})
            </div>
            <div className="space-y-1">
              {filteredCustomers.map(customer => {
                const isActive = displaySelected === customer;
                return (
                  <button
                    key={customer}
                    onClick={() => {
                      onSelect(customer);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive 
                        ? 'bg-indigo-600 text-white font-medium' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {customer}
                  </button>
                );
              })}
              {filteredCustomers.length === 0 && (
                <div className="px-3 py-4 text-sm text-slate-500 text-center italic">
                  No customers found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDropdown;
