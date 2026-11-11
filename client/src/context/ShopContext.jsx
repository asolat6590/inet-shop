import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const { i18n } = useTranslation();
  const [currentView, setCurrentView] = useState('home'); // home, catalog, builder, fps, admin
  const [secretAdminPath, setSecretAdminPath] = useState('vault-admin-99');
  
  // Products & Games loaded from API
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cart
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('shop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // PC Builder Configuration
  const [builderConfig, setBuilderConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('pc_builder_config');
      return saved ? JSON.parse(saved) : {
        case: null,
        cpu: null,
        motherboard: null,
        cooler: null,
        ram: null,
        gpu: null,
        storage: null,
        psu: null
      };
    } catch {
      return {
        case: null,
        cpu: null,
        motherboard: null,
        cooler: null,
        ram: null,
        gpu: null,
        storage: null,
        psu: null
      };
    }
  });

  // Visualizer settings
  const [visualizerSettings, setVisualizerSettings] = useState({
    rgbEnabled: true,
    rgbColor: 'cyan', // cyan, purple, green, rainbow, white
    sideGlassOpen: false,
    zoomLevel: 1.0
  });

  // Compatibility & FPS live states
  const [compatibility, setCompatibility] = useState({
    isCompatible: true,
    totalWattage: 75,
    recommendedPsuWattage: 450,
    issues: [],
    warnings: []
  });

  const [fpsSettings, setFpsSettings] = useState({
    resolution: '1080p',
    preset: 'high'
  });
  const [fpsResults, setFpsResults] = useState([]);
  const [bottleneck, setBottleneck] = useState(null);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [pickerModalSlot, setPickerModalSlot] = useState(null); // category slug when picking part for builder

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem('shop_cart', JSON.stringify(cart));
  }, [cart]);

  // Save builder config to local storage
  useEffect(() => {
    localStorage.setItem('pc_builder_config', JSON.stringify(builderConfig));
  }, [builderConfig]);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [catRes, prodRes, gamesRes] = await Promise.all([
        fetch('/api/categories').catch(() => null),
        fetch('/api/products').catch(() => null),
        fetch('/api/games').catch(() => null)
      ]);

      if (catRes?.ok) setCategories(await catRes.json());
      if (prodRes?.ok) setProducts(await prodRes.json());
      if (gamesRes?.ok) setGames(await gamesRes.json());
    } catch (err) {
      console.error('Failed to load initial shop data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run compatibility check whenever builderConfig changes
  useEffect(() => {
    const runCompatibilityCheck = async () => {
      try {
        const res = await fetch('/api/compatibility/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parts: builderConfig })
        });
        if (res.ok) {
          const data = await res.json();
          setCompatibility(data);
        }
      } catch (e) {
        console.warn('Compatibility check offline', e);
      }
    };
    runCompatibilityCheck();
  }, [builderConfig]);

  // Run FPS calculation whenever builderConfig or fpsSettings change
  useEffect(() => {
    const runFpsCalculation = async () => {
      try {
        const res = await fetch('/api/games/calculate-fps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: builderConfig,
            resolution: fpsSettings.resolution,
            preset: fpsSettings.preset
          })
        });
        if (res.ok) {
          const data = await res.json();
          setFpsResults(data.results || []);
          setBottleneck(data.bottleneck);
        }
      } catch (e) {
        console.warn('FPS calculation offline', e);
      }
    };
    runFpsCalculation();
  }, [builderConfig, fpsSettings]);

  // Currency Formatter in Uzbekistani Som (UZS)
  const formatUzs = (amount) => {
    const num = Number(amount) || 0;
    const formatted = new Intl.NumberFormat('ru-RU').format(num);
    const currText = i18n.language === 'en' ? 'UZS' : 'сум';
    return `${formatted} ${currText}`;
  };

  // Language switch
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  // Builder actions
  const setBuilderSlot = (slotSlug, product) => {
    setBuilderConfig(prev => ({
      ...prev,
      [slotSlug]: product
    }));
  };

  const removeBuilderSlot = (slotSlug) => {
    setBuilderConfig(prev => ({
      ...prev,
      [slotSlug]: null
    }));
  };

  const clearBuilder = () => {
    setBuilderConfig({
      case: null,
      cpu: null,
      motherboard: null,
      cooler: null,
      ram: null,
      gpu: null,
      storage: null,
      psu: null
    });
  };

  // Calculate total price of current PC build
  const builderTotalPrice = Object.values(builderConfig)
    .filter(Boolean)
    .reduce((sum, item) => sum + (item.price_uzs || 0), 0);

  const builderPartsCount = Object.values(builderConfig).filter(Boolean).length;

  // Cart actions
  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.id !== productId));
  };

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(i => i.id === productId ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setCart([]);

  const addEntireBuildToCart = () => {
    const parts = Object.values(builderConfig).filter(Boolean);
    if (parts.length === 0) return;

    setCart(prev => {
      const newCart = [...prev];
      parts.forEach(part => {
        const found = newCart.find(i => i.id === part.id);
        if (found) {
          found.quantity += 1;
        } else {
          newCart.push({ ...part, quantity: 1 });
        }
      });
      return newCart;
    });

    setIsCartOpen(true);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price_uzs * item.quantity), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ShopContext.Provider value={{
      currentView,
      setCurrentView,
      secretAdminPath,
      setSecretAdminPath,
      products,
      categories,
      games,
      isLoading,
      fetchInitialData,
      formatUzs,
      changeLanguage,
      language: i18n.language,
      // Builder
      builderConfig,
      setBuilderSlot,
      removeBuilderSlot,
      clearBuilder,
      builderTotalPrice,
      builderPartsCount,
      addEntireBuildToCart,
      visualizerSettings,
      setVisualizerSettings,
      compatibility,
      // FPS
      fpsSettings,
      setFpsSettings,
      fpsResults,
      bottleneck,
      // Cart
      cart,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      cartTotal,
      cartItemsCount,
      // Modals
      isCartOpen,
      setIsCartOpen,
      isCheckoutOpen,
      setIsCheckoutOpen,
      pickerModalSlot,
      setPickerModalSlot
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
