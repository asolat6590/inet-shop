import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../../context/ShopContext';
import {
  Lock, KeyRound, LayoutDashboard, Box, Gamepad2,
  ShoppingBag, Settings, Plus, Edit, Trash2, CheckCircle2,
  AlertCircle, Send, RefreshCw, X, ShieldAlert, Cpu
} from 'lucide-react';

export default function AdminView() {
  const { t, i18n } = useTranslation();
  const { formatUzs, fetchInitialData, products, games } = useShop();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_token') ? true : false;
  });
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, products, games, orders, settings

  // Dashboard Stats
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({});

  // Modals & editing
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);

  // Status message
  const [alertMsg, setAlertMsg] = useState(null);

  const getAdminHeaders = () => ({
    'Content-Type': 'application/json',
    'x-admin-token': sessionStorage.getItem('admin_token') || 'admin123'
  });

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('admin_token', data.token);
        setIsAuthenticated(true);
        loadAdminData();
      } else {
        setAuthError(data.error || 'Неверный пароль');
      }
    } catch (err) {
      setAuthError('Ошибка подключения к серверу');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

  // Load all admin data
  const loadAdminData = async () => {
    try {
      const [overviewRes, ordersRes, settingsRes] = await Promise.all([
        fetch('/api/admin/overview', { headers: getAdminHeaders() }),
        fetch('/api/admin/orders', { headers: getAdminHeaders() }),
        fetch('/api/admin/settings', { headers: getAdminHeaders() })
      ]);

      if (overviewRes.ok) {
        const d = await overviewRes.json();
        setStats(d.stats);
      }
      if (ordersRes.ok) {
        setOrders(await ordersRes.json());
      }
      if (settingsRes.ok) {
        setSettings(await settingsRes.json());
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  // Product save
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const isEdit = !!editingProduct.id;
    const url = isEdit ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify(editingProduct)
      });
      if (res.ok) {
        setIsProductModalOpen(false);
        setEditingProduct(null);
        fetchInitialData();
        loadAdminData();
        setAlertMsg({ type: 'success', text: 'Комплектующее успешно сохранено!' });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Ошибка сохранения товара' });
    }
  };

  // Product delete
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту деталь?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      if (res.ok) {
        fetchInitialData();
        loadAdminData();
      }
    } catch (e) {}
  };

  // Game save (Allows adding 21st, 22nd+ games!)
  const handleSaveGame = async (e) => {
    e.preventDefault();
    const isEdit = !!editingGame.id;
    const url = isEdit ? `/api/admin/games/${editingGame.id}` : '/api/admin/games';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify(editingGame)
      });
      if (res.ok) {
        setIsGameModalOpen(false);
        setEditingGame(null);
        fetchInitialData();
        loadAdminData();
        setAlertMsg({ type: 'success', text: 'Игра успешно добавлена/обновлена в калькуляторе!' });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Ошибка сохранения игры' });
    }
  };

  // Game delete
  const handleDeleteGame = async (id) => {
    if (!window.confirm('Удалить эту игру из калькулятора FPS?')) return;
    try {
      const res = await fetch(`/api/admin/games/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      if (res.ok) {
        fetchInitialData();
        loadAdminData();
      }
    } catch (e) {}
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (e) {}
  };

  // Save Telegram & General Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setAlertMsg({ type: 'success', text: 'Настройки и токен Telegram успешно сохранены!' });
      }
    } catch (e) {
      setAlertMsg({ type: 'error', text: 'Ошибка сохранения настроек' });
    }
  };

  // Send Test Ping
  const handleTestTelegramPing = async () => {
    try {
      const res = await fetch('/api/admin/telegram/test', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ chatId: settings.tg_owner_chat_id })
      });
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({ type: 'success', text: t('admin.tg.testPingSuccess') });
      } else {
        setAlertMsg({ type: 'error', text: data.error || 'Ошибка отправки тестового сообщения' });
      }
    } catch (e) {
      setAlertMsg({ type: 'error', text: 'Не удалось отправить сообщение' });
    }
  };

  // Not authenticated view
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0e1424] border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-800/60 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-center text-white">
            {t('admin.hiddenTitle')}
          </h2>
          <p className="text-xs text-center text-slate-400 mt-1 mb-6">
            {t('admin.enterPin')}
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-300">
                {authError}
              </div>
            )}

            <div>
              <input
                type="password"
                required
                placeholder={t('admin.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm shadow-lg shadow-cyan-500/20 transition"
            >
              {t('admin.login')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Admin Header */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-2xl p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              {t('admin.hiddenTitle')}
            </h1>
            <span className="text-xs text-slate-400 font-mono">
              Скрытый доступ: <code className="text-cyan-400">/vault-admin-99</code>
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-700 text-xs font-semibold transition"
        >
          {t('admin.logout')}
        </button>
      </div>

      {/* Alert toast if any */}
      {alertMsg && (
        <div className={`p-4 rounded-xl border mb-6 flex items-center justify-between text-xs ${
          alertMsg.type === 'success' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-red-950/40 border-red-800 text-red-300'
        }`}>
          <span>{alertMsg.text}</span>
          <button onClick={() => setAlertMsg(null)} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800">
        {[
          { id: 'dashboard', label: t('admin.dashboard'), icon: LayoutDashboard },
          { id: 'products', label: t('admin.products'), icon: Box },
          { id: 'games', label: t('admin.games'), icon: Gamepad2 },
          { id: 'orders', label: t('admin.orders'), icon: ShoppingBag },
          { id: 'settings', label: t('admin.settings'), icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'bg-[#0e1424] border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#0e1424] border border-slate-800 p-6 rounded-2xl">
              <span className="text-xs text-slate-400 uppercase font-semibold">{t('admin.stats.products')}</span>
              <div className="text-3xl font-black text-white font-mono mt-1">{stats.productsCount}</div>
            </div>
            <div className="bg-[#0e1424] border border-slate-800 p-6 rounded-2xl">
              <span className="text-xs text-slate-400 uppercase font-semibold">{t('admin.stats.games')}</span>
              <div className="text-3xl font-black text-cyan-400 font-mono mt-1">{stats.gamesCount}</div>
            </div>
            <div className="bg-[#0e1424] border border-slate-800 p-6 rounded-2xl">
              <span className="text-xs text-slate-400 uppercase font-semibold">{t('admin.stats.orders')}</span>
              <div className="text-3xl font-black text-purple-400 font-mono mt-1">{stats.ordersCount}</div>
            </div>
            <div className="bg-[#0e1424] border border-slate-800 p-6 rounded-2xl">
              <span className="text-xs text-slate-400 uppercase font-semibold">{t('admin.stats.revenue')}</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{formatUzs(stats.totalRevenue)}</div>
            </div>
          </div>

          {/* Quick Telegram Bot Status Card */}
          <div className="bg-[#0e1424] border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Статус Telegram Bot интеграции</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {settings.tg_bot_token ? t('admin.tg.botConnected') : t('admin.tg.botDisconnected')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('settings')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold transition"
            >
              Настроить Telegram токен →
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS CRUD */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Управление комплектующими</h2>
            <button
              onClick={() => {
                setEditingProduct({
                  category_slug: 'cpu',
                  name_ru: '',
                  name_en: '',
                  brand: '',
                  model: '',
                  price_uzs: 1000000,
                  in_stock: 5,
                  image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80',
                  description_ru: '',
                  description_en: '',
                  socket: '',
                  form_factor: '',
                  tdp: 65,
                  memory_type: 'DDR5',
                  wattage: '',
                  benchmark_score: 25000
                });
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              {t('admin.addProduct')}
            </button>
          </div>

          <div className="bg-[#0e1424] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Товар</th>
                    <th className="p-4">Категория</th>
                    <th className="p-4">Цена</th>
                    <th className="p-4">Склад</th>
                    <th className="p-4">Характеристики</th>
                    <th className="p-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/50">
                      <td className="p-4 flex items-center gap-3">
                        <img src={p.image_url} alt="" className="w-10 h-10 object-cover rounded bg-slate-950" />
                        <div>
                          <div className="font-bold text-white">{p.name_ru}</div>
                          <div className="text-slate-400 text-[10px]">{p.brand} {p.model}</div>
                        </div>
                      </td>
                      <td className="p-4 font-mono uppercase text-cyan-400">{p.category_slug}</td>
                      <td className="p-4 font-bold text-white font-mono">{formatUzs(p.price_uzs)}</td>
                      <td className="p-4 font-mono">{p.in_stock} шт</td>
                      <td className="p-4 text-slate-400 font-mono text-[11px]">
                        {p.socket && <span>{p.socket} </span>}
                        {p.tdp > 0 && <span>{p.tdp}W </span>}
                        {p.vram_gb && <span>{p.vram_gb}GB </span>}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct({ ...p });
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GAMES CRUD (20 Heavy Games + ability to add new ones) */}
      {activeTab === 'games' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">База игр для расчета FPS</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Изначальная база из 20 самых тяжелых игр. Вы можете добавлять новые игры и настраивать их требования!
              </p>
            </div>
            <button
              onClick={() => {
                setEditingGame({
                  title: '',
                  genre: 'Action RPG',
                  release_year: 2024,
                  cover_image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
                  description_ru: '',
                  description_en: '',
                  base_gpu_requirement: 20000,
                  base_cpu_requirement: 22000,
                  min_vram_gb: 8,
                  rec_vram_gb: 12,
                  min_ram_gb: 16
                });
                setIsGameModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              {t('admin.addGame')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((g) => (
              <div key={g.id} className="p-4 rounded-xl bg-[#0e1424] border border-slate-800 flex items-center gap-4">
                <img src={g.cover_image} alt="" className="w-16 h-20 object-cover rounded-lg bg-slate-950 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{g.title}</h4>
                  <div className="text-[11px] text-cyan-400">{g.genre} • {g.release_year}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    GPU Req: {g.base_gpu_requirement} | CPU Req: {g.base_cpu_requirement}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingGame({ ...g });
                        setIsGameModalOpen(true);
                      }}
                      className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGame(g.id)}
                      className="p-1 rounded bg-slate-800 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Список заказов клиентов</h2>

          <div className="bg-[#0e1424] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Заказ</th>
                    <th className="p-4">Клиент</th>
                    <th className="p-4">Телефон / TG</th>
                    <th className="p-4">Чек об оплате</th>
                    <th className="p-4">Сумма</th>
                    <th className="p-4">Статус</th>
                    <th className="p-4 text-right">Управление</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500">
                        Заказов пока нет
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-900/50">
                        <td className="p-4 font-mono font-bold text-cyan-400">{o.order_number}</td>
                        <td className="p-4 text-white font-medium">{o.customer_name}</td>
                        <td className="p-4 font-mono text-slate-300">
                          {o.customer_phone}
                          {o.customer_tg && <span className="block text-purple-400">@{o.customer_tg.replace('@', '')}</span>}
                        </td>
                        <td className="p-4">
                          {o.receipt_url ? (
                            <a
                              href={o.receipt_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 hover:bg-cyan-900/60 text-[11px] font-semibold"
                            >
                              <span>📸 Посмотреть чек</span>
                            </a>
                          ) : (
                            <span className="text-slate-500 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-white font-mono">{formatUzs(o.total_uzs)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            o.status === 'paid' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            o.status === 'cancelled' ? 'bg-red-950 text-red-400 border border-red-800' :
                            'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1.5">
                          <button
                            onClick={() => handleUpdateOrderStatus(o.id, 'paid')}
                            className="px-2 py-1 rounded bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 text-[10px] font-semibold"
                          >
                            Оплачен
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(o.id, 'cancelled')}
                            className="px-2 py-1 rounded bg-red-950/60 text-red-400 hover:bg-red-900 text-[10px] font-semibold"
                          >
                            Отклонить
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TELEGRAM & SECRETS SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-[#0e1424] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-cyan-400" />
              {t('admin.tg.title')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Настройте бота для получения заказов и уведомлений об оплате прямо в ваш личный Telegram.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {t('admin.tg.botToken')}
              </label>
              <input
                type="text"
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                value={settings.tg_bot_token || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, tg_bot_token: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {t('admin.tg.ownerChatId')}
              </label>
              <input
                type="text"
                placeholder="987654321"
                value={settings.tg_owner_chat_id || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, tg_owner_chat_id: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                {t('admin.tg.howToGetId')}
              </span>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition"
              >
                {t('admin.tg.saveSettings')}
              </button>

              <button
                type="button"
                onClick={handleTestTelegramPing}
                disabled={!settings.tg_bot_token || !settings.tg_owner_chat_id}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-cyan-800/40 transition disabled:opacity-50"
              >
                {t('admin.tg.testPing')}
              </button>
            </div>
          </form>

          {/* Change Admin Password */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-400" />
              Смена пароля админ-панели
            </h3>
            <div>
              <input
                type="password"
                placeholder="Новый пароль админа"
                value={settings.admin_password || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, admin_password: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#0d121f] border border-slate-700 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingProduct.id ? 'Редактировать деталь' : 'Добавить деталь'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400">Категория</label>
                  <select
                    value={editingProduct.category_slug}
                    onChange={(e) => setEditingProduct(p => ({ ...p, category_slug: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="case">Корпус</option>
                    <option value="cpu">Процессор</option>
                    <option value="motherboard">Материнская плата</option>
                    <option value="cooler">Кулер / СЖО</option>
                    <option value="ram">Оперативная память</option>
                    <option value="gpu">Видеокарта</option>
                    <option value="storage">Накопитель</option>
                    <option value="psu">Блок питания</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Цена (UZS)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price_uzs}
                    onChange={(e) => setEditingProduct(p => ({ ...p, price_uzs: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Название (RU)</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name_ru}
                  onChange={(e) => setEditingProduct(p => ({ ...p, name_ru: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Название (EN)</label>
                <input
                  type="text"
                  value={editingProduct.name_en}
                  onChange={(e) => setEditingProduct(p => ({ ...p, name_en: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400">Бренд</label>
                  <input
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct(p => ({ ...p, brand: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Модель</label>
                  <input
                    type="text"
                    value={editingProduct.model}
                    onChange={(e) => setEditingProduct(p => ({ ...p, model: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400">Сокет</label>
                  <input
                    type="text"
                    placeholder="LGA1700 / AM5"
                    value={editingProduct.socket || ''}
                    onChange={(e) => setEditingProduct(p => ({ ...p, socket: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">TDP (Вт)</label>
                  <input
                    type="number"
                    value={editingProduct.tdp || 0}
                    onChange={(e) => setEditingProduct(p => ({ ...p, tdp: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Бенчмарк балл</label>
                  <input
                    type="number"
                    value={editingProduct.benchmark_score || 0}
                    onChange={(e) => setEditingProduct(p => ({ ...p, benchmark_score: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Ссылка на картинку (URL)</label>
                <input
                  type="text"
                  value={editingProduct.image_url}
                  onChange={(e) => setEditingProduct(p => ({ ...p, image_url: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  {t('admin.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 text-black font-bold text-xs"
                >
                  {t('admin.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GAME MODAL (Adding 21st, 22nd+ games!) */}
      {isGameModalOpen && editingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#0d121f] border border-slate-700 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingGame.id ? 'Редактировать игру' : 'Добавить новую игру в FPS-калькулятор'}
              </h3>
              <button onClick={() => setIsGameModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGame} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400">Название игры</label>
                <input
                  type="text"
                  required
                  placeholder="Grand Theft Auto VI / DOOM: The Dark Ages"
                  value={editingGame.title}
                  onChange={(e) => setEditingGame(g => ({ ...g, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400">Жанр</label>
                  <input
                    type="text"
                    value={editingGame.genre}
                    onChange={(e) => setEditingGame(g => ({ ...g, genre: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Год релиза</label>
                  <input
                    type="number"
                    value={editingGame.release_year}
                    onChange={(e) => setEditingGame(g => ({ ...g, release_year: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400">Базовые требования GPU</label>
                  <input
                    type="number"
                    value={editingGame.base_gpu_requirement}
                    onChange={(e) => setEditingGame(g => ({ ...g, base_gpu_requirement: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Базовые требования CPU</label>
                  <input
                    type="number"
                    value={editingGame.base_cpu_requirement}
                    onChange={(e) => setEditingGame(g => ({ ...g, base_cpu_requirement: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Постер / Обложка (URL)</label>
                <input
                  type="text"
                  value={editingGame.cover_image}
                  onChange={(e) => setEditingGame(g => ({ ...g, cover_image: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Описание (RU)</label>
                <textarea
                  rows="2"
                  value={editingGame.description_ru}
                  onChange={(e) => setEditingGame(g => ({ ...g, description_ru: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGameModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  {t('admin.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 text-black font-bold text-xs"
                >
                  {t('admin.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
