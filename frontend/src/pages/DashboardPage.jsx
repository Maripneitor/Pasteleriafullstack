import React, { useEffect, useState } from 'react';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import client from '../config/axios';
import ordersApi from '../services/ordersApi';
import { clearToken } from '../utils/auth';
import { handlePdfResponse } from '../utils/pdfHelper';
import toast from 'react-hot-toast';
import { Search, PlusCircle, Mic, Calendar, User as UserIcon, LogOut, Users, ChefHat, PieChart, DollarSign, FileText, Printer, Store, Activity, ArrowRight, Clock } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';

import PageHeader from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { KpiCard } from '../components/ui/KpiCard';

// Helper for currency
const formatMoney = (amount) => `$${Number(amount || 0).toLocaleString()}`;

const DONUT_COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

const OwnerDashboard = ({ stats, navigate, handleLogout }) => {
  const m = stats?.metrics || {};
  const todaySales = m.todaySales || 0;
  const yesterdaySales = m.yesterdaySales || 0;
  const salesDiff = yesterdaySales > 0 ? Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100) : 0;
  const avgTicket = m.avgTicket || 0;
  const cancelledCount = m.cancelledCount || 0;
  const cancelledRevenue = m.cancelledRevenue || 0;
  const overdueOrders = stats?.overdueOrders || [];
  const topProducts = stats?.topProducts || [];
  const recentAudit = stats?.recentAudit || [];
  const branches = stats?.branchStats || [];

  // AI Morning Briefing
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return '¡Buenos días, Jefe!';
    if (hr < 18) return '¡Buenas tardes, Jefe!';
    return '¡Buenas noches, Jefe!';
  };

  const aiBriefing = (() => {
    const parts = [];
    if (todaySales > 0) {
      parts.push(`Hoy llevas ${formatMoney(todaySales)} en ventas`);
      if (salesDiff > 0) parts[0] += ` (⬆️ ${salesDiff}% vs ayer)`;
      else if (salesDiff < 0) parts[0] += ` (⬇️ ${Math.abs(salesDiff)}% vs ayer)`;
    } else {
      parts.push('Aún no hay ventas registradas hoy');
    }
    if (overdueOrders.length > 0) parts.push(`⚠️ Tienes ${overdueOrders.length} pedido(s) retrasado(s) que requieren atención`);
    if (cancelledCount > 0) parts.push(`Se han cancelado ${cancelledCount} pedidos (${formatMoney(cancelledRevenue)} perdidos)`);
    if (m.pendingOrders > 0) parts.push(`${m.pendingOrders} pedidos pendientes de producción`);
    return parts.join('. ') + '.';
  })();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 fade-in pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-text-main tracking-tight flex items-center gap-2">Oficina de Mando <span className="text-brand-primary">Central</span></h1>
          <p className="text-text-muted text-sm">Vista estratégica del negocio</p>
        </div>
        <Button variant="destructive" icon={LogOut} onClick={handleLogout}>Salir</Button>
      </div>

      {/* 🤖 AI Morning Briefing */}
      <Card className="bg-brand-secondary text-white border-none shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex items-start gap-4 p-6">
          <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-sm">
            <Activity size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest opacity-80 mb-1">{getGreeting()} — Resumen IA</h3>
            <p className="text-white/90 text-sm leading-relaxed">{aiBriefing}</p>
          </div>
        </div>
      </Card>

      {/* KPIs Reales del Negocio */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ventas Hoy vs Ayer */}
        <KpiCard
          title="Ventas Hoy"
          amount={todaySales}
          icon={DollarSign}
          trend={{ value: salesDiff, label: "vs ayer", isPositive: salesDiff >= 0 }}
        />

        {/* Ticket Promedio */}
        <KpiCard
          title="Ticket Promedio"
          amount={avgTicket}
          icon={FileText}
          allowHide={true}
        />

        {/* Tasa de Cancelación */}
        <KpiCard
          title="Cancelaciones"
          amount={cancelledCount}
          icon={Activity}
          isCurrency={false}
          trend={cancelledCount > 0 ? { value: cancelledRevenue, label: "perdidos", isPositive: false } : null}
          allowHide={false}
        />

        {/* Pedidos Activos */}
        <KpiCard
          title="En Producción"
          amount={m.statusCounts?.enProceso || 0}
          icon={Clock}
          isCurrency={false}
          allowHide={false}
        />
      </section>

      {/* Semáforo Multi-Sucursal */}
      {/* Two-Column Layout: Alerts + Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Incidencias Críticas */}
        <Card className={overdueOrders.length > 0 ? 'border-semantic-error' : ''}>
          <CardHeader>
            <CardTitle>⚠️ Incidencias Críticas</CardTitle>
            <CardContent className="px-0 py-2 text-text-muted text-sm">Pedidos que requieren atención inmediata</CardContent>
          </CardHeader>
          <CardContent>
            {overdueOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-sm font-bold text-semantic-success">Todo en orden</p>
                <p className="text-xs text-text-muted">Sin pedidos retrasados ni incidencias</p>
              </div>
            ) : (
              <div className="space-y-3">
                {overdueOrders.map((order, i) => (
                  <div key={i} onClick={() => navigate(`/pedidos/${order.id}/editar`)} className="flex items-center justify-between p-3 rounded-xl bg-semantic-error/10 border border-semantic-error/20 cursor-pointer hover:bg-semantic-error/20 transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-semantic-error text-white flex items-center justify-center font-black text-sm">
                        {order.folioNumber?.slice(-2) || '??'}
                      </div>
                      <div>
                        <h5 className="font-bold text-text-main text-sm">{order.cliente_nombre}</h5>
                        <div className="flex items-center gap-2 text-[10px] text-semantic-error font-bold">
                          <Clock size={10} /> Entrega: {order.fecha_entrega} {order.hora_entrega}
                        </div>
                      </div>
                    </div>
                    <Badge variant="error" className="text-[10px]">RETRASADO</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estado de Pedidos */}
        <Card>
          <CardHeader>
             <CardTitle>📋 Estado de la Operación</CardTitle>
             <CardContent className="px-0 py-2 text-text-muted text-sm">Resumen de producción en tiempo real</CardContent>
          </CardHeader>
          <CardContent>
             <div className="flex flex-col md:flex-row items-center gap-6 py-2">
                <div className="w-40 h-40 flex-shrink-0">
                  <RechartsPieChart width={160} height={160}>
                    <Pie
                      data={[
                        { name: 'Listos', value: m.statusCounts?.listos || 0 },
                        { name: 'En preparación', value: m.statusCounts?.enProceso || 0 },
                        { name: 'Retrasados', value: m.statusCounts?.retrasados || 0 },
                      ].filter(d => d.value > 0)}
                      cx={80} cy={80}
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell fill="var(--semantic-success)" /> {/* Listos */}
                      <Cell fill="var(--brand-secondary)" /> {/* En prep */}
                      <Cell fill="var(--semantic-error)" /> {/* Retrasados */}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </div>
                <div className="space-y-3 flex-1 w-full">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-app border border-border shadow-sm">
                      <span className="text-xs font-bold text-text-main">Listos</span>
                      <span className="text-lg font-black text-semantic-success">{m.statusCounts?.listos || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-app border border-border shadow-sm">
                      <span className="text-xs font-bold text-text-main">En preparación</span>
                      <span className="text-lg font-black text-brand-secondary">{m.statusCounts?.enProceso || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-app border border-border shadow-sm">
                      <span className="text-xs font-bold text-text-main">Retrasados</span>
                      <span className="text-lg font-black text-semantic-error">{m.statusCounts?.retrasados || 0}</span>
                    </div>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const EmployeeDashboard = ({ stats, navigate, handleLogout, handleBuscar, handleDownloadPDF }) => {
  const { isOwnerOrAdmin } = useAuth();
  const [filter, setFilter] = useState('ALL'); // ALL, TODAY, URGENT, FINISHED

  const adminModules = [
    { title: 'Usuarios', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100', path: '/usuarios' },
    { title: 'Sabores', icon: ChefHat, color: 'text-pink-600', bg: 'bg-pink-50 hover:bg-pink-100', path: '/admin/sabores' },
    { title: 'Reportes', icon: PieChart, color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100', path: '/admin/stats' },
    { title: 'Comisiones', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 hover:bg-green-100', path: '/admin/comisiones' },
  ];

  const actions = [
    { title: 'Nuevo Folio', icon: PlusCircle, bg: 'bg-pink-600 border border-pink-500 shadow-md shadow-pink-200', onClick: () => navigate('/pedidos/nuevo') },
    { title: 'Dictar Pedido', icon: Mic, bg: 'bg-violet-600 border border-violet-500 shadow-md shadow-violet-200', onClick: () => window.dispatchEvent(new Event('open-ai-tray')) },
    { title: 'Ver Calendario', icon: Calendar, bg: 'bg-blue-500 border border-blue-400 shadow-md shadow-blue-200', onClick: () => navigate('/calendario') },
    { title: 'Caja', icon: DollarSign, bg: 'bg-emerald-600 border border-emerald-500 shadow-md shadow-emerald-200', onClick: () => navigate('/caja') },
  ];

  // Logic to filter recent orders
  const filteredOrders = (stats?.recientes || []).filter(order => {
    if (filter === 'TODAY') {
      const today = new Date().toISOString().split('T')[0];
      return order.fecha_entrega === today;
    }
    if (filter === 'URGENT') {
      return order.estatus_pago === 'Pendiente' || order.estatus_produccion === 'Pendiente';
    }
    if (filter === 'FINISHED') {
      return order.estatus_produccion === 'Terminado';
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 fade-in pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-text-main tracking-tight flex items-center gap-2">Flujo de Trabajo <span className="text-brand-primary">"La Fiesta"</span></h1>
          <p className="text-text-muted text-sm">Gestión operativa de pedidos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={Search} onClick={handleBuscar} className="hidden md:flex">Buscar Folio</Button>
          <Button variant="destructive" icon={LogOut} onClick={handleLogout}>Salir</Button>
        </div>
      </div>

      {/* Acciones Críticas - Prioridad Alta */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, idx) => (
          <Card
            key={idx}
            onClick={action.onClick}
            className="cursor-pointer hover:border-brand-primary transition-colors h-24 flex items-center justify-between p-6 bg-surface"
          >
            <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted mb-1">Acción Rápida</span>
                <span className="font-black text-lg text-text-main">{action.title}</span>
            </div>
            <div className="p-3 bg-app rounded-xl text-brand-primary">
                <action.icon size={28} />
            </div>
          </Card>
        ))}
      </section>

      {/* Tablero de Ventas/Stats - Limpiado para empleados */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Pendientes de Preparar" amount={stats?.metrics?.pendingOrders || 0} isCurrency={false} allowHide={false} className="border-l-4 border-l-semantic-warning" />
        <KpiCard title="Entregas Hoy" amount={stats?.metrics?.todayOrders || 0} isCurrency={false} allowHide={false} className="border-l-4 border-l-brand-primary" />
        <Card className="flex flex-col gap-1 border-l-4 border-l-brand-secondary p-6">
           <span className="text-text-muted text-[10px] uppercase tracking-widest font-bold">Capacidad de Cocina</span>
           <span className="text-xs text-text-main mt-1 font-bold">Estándar (90% Lleno)</span>
        </Card>
        <KpiCard title="Próximos 7 días" amount={stats?.metrics?.totalOrders || 0} isCurrency={false} allowHide={false} className="border-l-4 border-l-semantic-info" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Cola de Trabajo Principal */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Cola de Trabajo Actual</CardTitle>
                <CardContent className="px-0 py-2 text-text-muted text-sm">Pedidos que requieren atención</CardContent>
              </div>
              <div className="flex gap-2 bg-app p-1 rounded-lg">
                <button onClick={() => setFilter('ALL')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${filter === 'ALL' ? 'bg-surface shadow-sm text-brand-primary' : 'text-text-muted hover:text-text-main'}`}>Todos</button>
                <button onClick={() => setFilter('TODAY')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${filter === 'TODAY' ? 'bg-surface shadow-sm text-brand-primary' : 'text-text-muted hover:text-text-main'}`}>Hoy</button>
                <button onClick={() => setFilter('URGENT')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${filter === 'URGENT' ? 'bg-surface shadow-sm text-semantic-error' : 'text-text-muted hover:text-text-main'}`}>Urgentes</button>
              </div>
            </CardHeader>
            <CardContent>
            {!filteredOrders.length ? (
              <EmptyState 
                title="No hay tareas pendientes" 
                description="Todo está al día por ahora. ¡Buen trabajo!" 
                icon={ChefHat}
              />
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(f => {
                  const isToday = f.fecha_entrega === new Date().toISOString().split('T')[0];
                  return (
                    <div 
                        key={f.id} 
                        onClick={() => navigate(`/pedidos/${f.id}/editar`)}
                        className={`group p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between
                            ${isToday ? 'bg-brand-primary/5 border-brand-primary/20 hover:border-brand-primary/40' : 'bg-surface border-border hover:border-brand-primary/30'}
                        `}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg
                                ${isToday ? 'bg-brand-primary text-white' : 'bg-app text-text-muted'}
                            `}>
                                {f.folio_numero?.slice(-2) || f.id}
                            </div>
                            <div>
                                <h4 className="font-bold text-text-main flex items-center gap-2">
                                    {f.cliente_nombre}
                                    {isToday && <Badge variant="error" className="text-[10px]">PARA HOY</Badge>}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                                    <span className="flex items-center gap-1"><Clock size={12}/> {f.hora_entrega}</span>
                                    <span className="flex items-center gap-1"><FileText size={12}/> {f.folio_numero}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-[10px] text-text-muted font-bold uppercase">Estado</span>
                                <Badge variant={f.estatus_folio === 'Cancelado' ? 'error' : f.estatus_produccion === 'Terminado' ? 'success' : 'warning'}>
                                    {f.estatus_folio === 'Cancelado' ? 'Cancelado' : f.estatus_produccion}
                                </Badge>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleDownloadPDF(f.id); }} className="p-3 bg-app hover:bg-border/50 rounded-xl text-text-muted group-hover:text-brand-primary transition-colors">
                            <Printer size={18} />
                            </button>
                        </div>
                    </div>
                  );
                })}
                <Button variant="ghost" className="w-full mt-4" onClick={() => navigate('/pedidos')}>
                    Ver todos los pedidos anteriores &rarr;
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        <div className="space-y-8">
          {/* Herramientas IA Integradas (Propuesto por feedback) */}
          <Card title="Asistente de Producción" className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100">
            <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl border border-violet-100 shadow-sm">
                    <p className="text-xs font-bold text-violet-600 uppercase mb-2">Recomendación de Inventario</p>
                    <p className="text-sm text-gray-700">⚠️ Te queda poca <span className="font-bold">Harina de Vainilla</span>. Te sugiero marcarla como "No Disponible" o ir a stock.</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-violet-100 shadow-sm">
                    <p className="text-xs font-bold text-violet-600 uppercase mb-2">Carga de Trabajo</p>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Ocupación para entrega 5pm</span>
                        <span className="text-xs font-bold text-orange-600">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 w-[90%]"></div>
                    </div>
                </div>
                <Button variant="primary" fullWidth className="bg-violet-600 hover:bg-violet-700" onClick={() => window.dispatchEvent(new Event('open-ai-tray'))}>
                    Pedir ayuda a la IA
                </Button>
            </div>
          </Card>

          {isOwnerOrAdmin() && (
            <Card title="Administración">
              <div className="grid grid-cols-2 gap-3">
                {adminModules.map((mod, idx) => (
                  <div key={idx} onClick={() => navigate(mod.path)} className={`${mod.bg} p-4 rounded-xl cursor-pointer hover:shadow-md transition flex flex-col items-center gap-2 text-center`}>
                    <mod.icon className={mod.color} size={24} />
                    <span className={`text-xs font-bold ${mod.color.replace('text-', 'text-opacity-80-')}`}>{mod.title}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          <Card title="Sabores Activos">
            <div className="space-y-3">
                {(stats?.populares || []).slice(0, 4).map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-gray-50">
                        <span className="text-xs font-bold text-gray-700">{entry.name}</span>
                        <span className="text-xs font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">{entry.value} ped.</span>
                    </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isOwnerOrAdmin, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(
    (user?.role === 'OWNER' || user?.role === 'SUPER_ADMIN') ? 'hub' : 'primary'
  ); 

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await client.get('/folios/stats/dashboard');
        setStats(res.data);
      } catch (e) {
        setStats({
          metrics: { totalSales: 0, todayOrders: 0, pendingOrders: 0, totalOrders: 0 },
          branchStats: [],
          recientes: [],
          populares: []
        });
      } finally {
        setLoading(false);
      }
    };
    loadStats();
    const onChanged = () => loadStats();
    window.addEventListener('folios:changed', onChanged);
    return () => window.removeEventListener('folios:changed', onChanged);
  }, []);

  const handleDownloadPDF = (id) => handlePdfResponse(() => ordersApi.downloadPdf(id));
  const handleBuscar = () => {
    const q = prompt("¿Qué deseas buscar? (nombre, teléfono o folio)");
    if (q) navigate(`/pedidos?q=${encodeURIComponent(q)}`);
  };
  const handleLogout = () => {
    if (window.confirm("¿Cerrar sesión?")) {
      clearToken();
      toast.success("Sesión cerrada.");
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium animate-pulse">Cargando tablero...</p>
        </div>
      </div>
    );
  }

  const toggleView = () => {
    setViewMode(prev => prev === 'primary' ? 'hub' : 'primary');
  };

  const renderContent = () => {
    // Si no es dueño/admin, siempre ve el primario (operativo).
    // Si lo es, ahora por defecto entrará al dashboard de mando (hub).
    const isOwnerOrSuper = user?.role === 'OWNER' || user?.role === 'SUPER_ADMIN';

    if (isOwnerOrSuper && viewMode === 'hub') {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center max-w-7xl mx-auto px-6 pt-4">
             <h2 className="text-pink-600 font-black tracking-tight">CENTRO DE MANDO</h2>
            <Button variant="secondary" onClick={toggleView} icon={Activity} className="bg-white border-pink-200 text-pink-700 hover:bg-pink-50">
              Cambiar a Vista Operativa
            </Button>
          </div>
          <OwnerDashboard stats={stats} navigate={navigate} handleLogout={handleLogout} />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {isOwnerOrSuper && (
          <div className="flex justify-end max-w-7xl mx-auto px-6 pt-4 pb-0 mb-[-1rem]">
            <Button variant="secondary" onClick={toggleView} icon={Store} className="bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100 relative z-10 w-full md:w-auto">
              Ver Oficina de Mando Central
            </Button>
          </div>
        )}
        <EmployeeDashboard
          stats={stats}
          navigate={navigate}
          handleLogout={handleLogout}
          handleBuscar={handleBuscar}
          handleDownloadPDF={handleDownloadPDF}
        />
      </div>
    );
  }

  return renderContent();
};

export default DashboardPage;

