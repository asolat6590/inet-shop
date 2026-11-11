import React, { useEffect } from 'react';
import { useShop } from './context/ShopContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HeroSection from './components/home/HeroSection';
import CatalogView from './components/catalog/CatalogView';
import BuilderView from './components/builder/BuilderView';
import FpsCalculatorView from './components/fps/FpsCalculatorView';
import AdminView from './components/admin/AdminView';
import CartDrawer from './components/cart/CartDrawer';
import TelegramCheckoutModal from './components/cart/TelegramCheckoutModal';
import ComponentPickerModal from './components/builder/ComponentPickerModal';

export default function App() {
  const { currentView, setCurrentView } = useShop();

  // Check if browser URL directly accesses secret admin route e.g. /vault-admin-99
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('vault-admin') || path.includes('admin')) {
      setCurrentView('admin');
    }
  }, [setCurrentView]);

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <Header />

      <main className="flex-1">
        {currentView === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <HeroSection />
            <CatalogView />
          </div>
        )}

        {currentView === 'catalog' && <CatalogView />}

        {currentView === 'builder' && <BuilderView />}

        {currentView === 'fps' && <FpsCalculatorView />}

        {currentView === 'admin' && <AdminView />}
      </main>

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <TelegramCheckoutModal />
      <ComponentPickerModal />

      <Footer />
    </div>
  );
}
