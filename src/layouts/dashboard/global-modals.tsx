import { useAppSelector } from 'src/hooks/store';
import React, { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { AIChatbotEnhanced } from 'src/components/ai-chatbot';

export default function GlobalModals() {
  const { contactsPopup: openContactModal } = useAppSelector((state) => state.contacts);
  const categoryOpen = useAppSelector((state) => state.categories.openPopup);
  const brandOpen = useAppSelector((state) => state.brands.openPopup);
  const pdvOpen = useAppSelector((state) => state.pdvs.openPopup);
  const location = useLocation();

  const UserPopupCreateView = lazy(() => import('src/sections/user/view/user-popup-create-view'));
  const PopupCreateCategory = lazy(() => import('src/sections/categories/PopupCreateCategory'));
  const PopupCreateBrand = lazy(() => import('src/sections/brands/PopupCreateBrand'));
  const FormPDVS = lazy(() => import('src/sections/PDVS/pdv-new-edit-form-simple'));

  const shouldShowChatbot = !location.pathname.startsWith('/pos');

  return (
    <>
      <Suspense fallback={null}>
        {openContactModal && <UserPopupCreateView />}
        {categoryOpen && <PopupCreateCategory />}
        {brandOpen && <PopupCreateBrand />}
        {pdvOpen && <FormPDVS />}
      </Suspense>

      {shouldShowChatbot && <AIChatbotEnhanced />}
    </>
  );
}
