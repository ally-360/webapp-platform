import { useRef, useEffect, useState } from 'react';
import { type SaleWindow } from 'src/redux/pos/posSlice';

/**
 * Hook para manejar el estado de scroll en el tab bar
 */
export const useScrollState = (salesWindows: SaleWindow[]) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check if scroll is needed and update scroll button states
  const updateScrollState = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;

    setShowScrollButtons(scrollWidth > clientWidth);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    updateScrollState();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollState);
      return () => container.removeEventListener('scroll', updateScrollState);
    }
  }, [salesWindows]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.7;
    const newScrollLeft =
      direction === 'left' ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  return {
    scrollContainerRef,
    showScrollButtons,
    canScrollLeft,
    canScrollRight,
    handleScroll
  };
};
