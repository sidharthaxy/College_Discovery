import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CollegeSummary {
  id: number;
  slug: string;
  name: string;
  logoUrl: string;
  rating: number;
  location: string;
  fees: number;
  avgPackage: number;
  highestPackage: number;
  intake: number;
  topRecruiters: string[];
}

interface CompareContextType {
  compareList: CollegeSummary[];
  addToCompare: (college: CollegeSummary) => boolean; // returns true if added, false if max limit reached
  removeFromCompare: (id: number) => void;
  isInCompare: (id: number) => boolean;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<CollegeSummary[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('college_compare_list');
    if (saved) {
      try {
        setCompareList(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse compare list from localStorage', e);
      }
    }
  }, []);

  // Save to local storage when state changes
  const saveCompareList = (list: CollegeSummary[]) => {
    setCompareList(list);
    localStorage.setItem('college_compare_list', JSON.stringify(list));
  };

  const addToCompare = (college: CollegeSummary): boolean => {
    // Check if already in list
    if (compareList.some((item) => item.id === college.id)) {
      return true;
    }

    // Limit to max 3 items
    if (compareList.length >= 3) {
      return false;
    }

    const updated = [...compareList, college];
    saveCompareList(updated);
    return true;
  };

  const removeFromCompare = (id: number) => {
    const updated = compareList.filter((item) => item.id !== id);
    saveCompareList(updated);
  };

  const isInCompare = (id: number): boolean => {
    return compareList.some((item) => item.id === id);
  };

  const clearCompare = () => {
    saveCompareList([]);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
