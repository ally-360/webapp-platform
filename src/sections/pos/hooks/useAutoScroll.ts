import { useEffect, RefObject } from 'react';
import { type SaleWindow } from 'src/redux/pos/posSlice';

/**
 * Hook para manejar el scroll automático al tab activo
 */
export const useAutoScroll = (
  openTab: number,
  salesWindows: SaleWindow[],
  scrollContainerRef: RefObject<HTMLDivElement>
) => {
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const activeTabIndex = salesWindows.findIndex((tab) => tab.id === openTab);
    if (activeTabIndex >= 0) {
      const container = scrollContainerRef.current;
      const tabElements = container.querySelectorAll('[data-tab-button]');
      const activeElement = tabElements[activeTabIndex] as HTMLElement;

      if (activeElement) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = activeElement.getBoundingClientRect();

        // Check if element is outside visible area
        if (elementRect.right > containerRect.right || elementRect.left < containerRect.left) {
          activeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }
    }
  }, [openTab, salesWindows, scrollContainerRef]);
};
