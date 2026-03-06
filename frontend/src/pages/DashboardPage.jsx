import React, { useEffect, useState } from 'react';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import client from '../api/axiosClient';
import ordersApi from '../api/ordersApi';
import { clearToken } from '../utils/auth';
import { handlePdfResponse } from '../utils/pdfHelper';
import toast from 'react-hot-toast';
import { Search, PlusCircle, Mic, Calendar, User as UserIcon, LogOut, Users, ChefHat, PieChart, DollarSign, FileText, Printer, Store, Activity, ArrowRight, Clock } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';

import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';

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
      <PageHeader
        title={<span>Oficina de Mando <span className="text-pink-600">Central</span></span>}
        subtitle="Vista estratégica del negocio"
        actions={<Button variant="danger" icon={LogOut} onClick={handleLogout}>Salir</Button>}
      />

      {/* 🤖 AI Morning Briefing */}
      <Card className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white border-none shadow-xl shadow-violet-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex items-start gap-4">
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
        <Card className="relative overflow-hidden bg-gradient-to-br from-pink-500 to-rose-600 text-white border-none shadow-lg shadow-pink-200">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <span className="text-pink-100 text-[10px] font-bold uppercase tracking-widest">Ventas Hoy</span>
            <div className="text-3xl font-black mt-1 tracking-tight">{formatMoney(todaySales)}</div>
            <div className={`text-xs font-bold mt-1 flex items-center gap-1 ${salesDiff >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {salesDiff >= 0 ? '⬆️' : '⬇️'} {Math.abs(salesDiff)}% vs ayer
            </div>
          </div>
        </Card>

        {/* Ticket Promedio */}
        <Card className="flex flex-col gap-1 border-l-4 border-l-blue-500 bg-blue-50/30">
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Ticket Promedio</span>
          <span className="text-3xl font-black text-gray-900">{formatMoney(avgTicket)}</span>
          <span className="text-[10px] text-gray-500">Por pedido</span>
        </Card>

        {/* Tasa de Cancelación */}
        <Card className={`flex flex-col gap-1 border-l-4 ${cancelledCount > 0 ? 'border-l-red-500 bg-red-50/30' : 'border-l-emerald-500 bg-emerald-50/30'}`}>
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Cancelaciones</span>
          <span className="text-3xl font-black text-gray-900">{cancelledCount}</span>
          {cancelledCount > 0 && (
            <span className="text-[10px] text-red-600 font-bold">{formatMoney(cancelledRevenue)} perdidos</span>
          )}
          {cancelledCount === 0 && (
            <span className="text-[10px] text-emerald-600 font-bold">Sin cancelaciones ✅</span>
          )}
        </Card>

        {/* Pedidos Activos */}
        <Card className="flex flex-col gap-1 border-l-4 border-l-purple-500 bg-purple-50/30">
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">En Producción</span>
          <span className="text-3xl font-black text-gray-900">{m.statusCounts?.enProceso || 0}</span>
          <span className="text-[10px] text-gray-500">{m.statusCounts?.listos || 0} listos para entrega</span>
        </Card>
      </section>

      {/* Semáforo Multi-Sucursal */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <Store className="text-pink-500" size={24} />
          <h3 className="text-xl font-black text-gray-800 tracking-tight">Semáforo de Operación</h3>
        </div>

        {branches.length === 0 ? (
          <EmptyState title="Sin sucursales" description="Añade sucursales para ver el semáforo." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map(branch => {
              const hasOverdue = branch.pedidosRetrasados > 0;
              const isClosed = !branch.cajaAbierta;
              const statusColor = isClosed ? 'red' : hasOverdue ? 'yellow' : 'green';
              const statusLabel = isClosed ? 'Inactiva' : hasOverdue ? `${branch.pedidosRetrasados} retrasados` : 'Operando';
              const statusEmoji = isClosed ? '🔴' : hasOverdue ? '🟡' : '🟢';

              return (
                <Card key={branch.id} className={`relative overflow-hidden group hover:shadow-xl transition-all border-none ring-1 shadow-md bg-white ${
                  statusColor === 'red' ? 'ring-red-200' : statusColor === 'yellow' ? 'ring-orange-200' : 'ring-emerald-200'
                }`}>
                  <div className="p-1">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                          statusColor === 'red' ? 'bg-red-50' : statusColor === 'yellow' ? 'bg-orange-50' : 'bg-emerald-50'
                        }`}>
                          <Store className={`${
                            statusColor === 'red' ? 'text-red-500' : statusColor === 'yellow' ? 'text-orange-500' : 'text-emerald-500'
                          }`} size={22} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-lg text-gray-900 tracking-tight">{branch.name}</h4>
                          <span className={`text-xs font-bold ${
                            statusColor === 'red' ? 'text-red-600' : statusColor === 'yellow' ? 'text-orange-600' : 'text-emerald-600'
                          }`}>
                            {statusEmoji} {statusLabel}
                          </span>
                        </div>
                      </div>
                      {/* Status Dot */}
                      <div className={`w-3 h-3 rounded-full ${
                        statusColor === 'red' ? 'bg-red-500' : statusColor === 'yellow' ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500 animate-pulse'
                      }`}></div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Ventas Hoy</span>
                        <span className="font-black text-lg text-gray-900">{formatMoney(branch.ventasHoy)}</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">En Prep.</span>
                        <span className="font-black text-lg text-pink-600">{branch.pedidosActivos}</span>
                      </div>
                    </div>

                    <Button variant="primary" fullWidth className="bg-pink-500 hover:bg-pink-600 shadow-md shadow-pink-200 text-sm py-3" onClick={() => navigate('/pedidos')}>
                      Gestionar <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Two-Column Layout: Alerts + Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Incidencias Críticas */}
        <Card title="⚠️ Incidencias Críticas" subtitle="Pedidos que requieren atención inmediata" className={overdueOrders.length > 0 ? 'ring-1 ring-red-200' : ''}>
          {overdueOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-sm font-bold text-emerald-600">Todo en orden</p>
              <p className="text-xs text-gray-400">Sin pedidos retrasados ni incidencias</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueOrders.map((order, i) => (
                <div key={i} onClick={() => navigate(`/pedidos/${order.id}/editar`)} className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100 cursor-pointer hover:bg-red-100 transition group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center font-black text-sm">
                      {order.folioNumber?.slice(-2) || '??'}
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 text-sm">{order.cliente_nombre}</h5>
                      <div className="flex items-center gap-2 text-[10px] text-red-600 font-bold">
                        <Clock size={10} /> Entrega: {order.fecha_entrega} {order.hora_entrega}
                      </div>
                    </div>
                  </div>
                  <Badge variant="danger" className="text-[10px]">RETRASADO</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Estado de Pedidos (Replaces list summary) */}
        <Card title="📋 Estado de la Operación" subtitle="Resumen de producción en tiempo real">
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
                    <Cell fill="#10b981" /> {/* Listos */}
                    <Cell fill="#8b5cf6" /> {/* En prep */}
                    <Cell fill="#ef4444" /> {/* Retrasados */}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </div>
              <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100 shadow-sm">
                    <span className="text-xs font-bold text-emerald-700">Listos</span>
                    <span className="text-lg font-black text-emerald-900">{m.statusCounts?.listos || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-100 shadow-sm">
                    <span className="text-xs font-bold text-purple-700">En preparación</span>
                    <span className="text-lg font-black text-purple-900">{m.statusCounts?.enProceso || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100 shadow-sm">
                    <span className="text-xs font-bold text-red-700">Retrasados</span>
                    <span className="text-lg font-black text-red-900">{m.statusCounts?.retrasados || 0}</span>
                  </div>
              </div>
           </div>
        </Card>
      </div>

      {/* Auditoría Rápida + Acciones Estratégicas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Audit */}
        <Card title="🕵️ Actividad Reciente" subtitle="Modo Chismoso" className="lg:col-span-2">
          {recentAudit.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin actividad reciente registrada</p>
          ) : (
            <div className="space-y-2">
              {recentAudit.map((log, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    log.action?.includes('DELETE') || log.action?.includes('CANCEL') ? 'bg-red-500'
                    : log.action?.includes('CREATE') ? 'bg-emerald-500'
                    : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-700 truncate">{log.action || log.description || 'Acción registrada'}</p>
                    <p className="text-[10px] text-gray-400">{log.userName || 'Sistema'} · {new Date(log.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" fullWidth onClick={() => navigate('/admin/chismoso')} className="text-gray-400 hover:text-pink-600 text-xs">
                Ver auditoría completa →
              </Button>
            </div>
          )}
        </Card>

        {/* Acciones Estratégicas */}
        <Card title="Acciones Rápidas">
          <div className="space-y-3">
            <button onClick={() => navigate('/admin/reports')} className="w-full p-4 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 rounded-xl hover:shadow-md transition flex items-center gap-3 group">
              <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition"><FileText size={18} className="text-pink-600" /></div>
              <div className="text-left">
                <span className="font-bold text-sm text-gray-800 block">Generar Reporte</span>
                <span className="text-[10px] text-gray-500">Ventas, cortes y finanzas</span>
              </div>
            </button>
            <button onClick={() => navigate('/insumos')} className="w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl hover:shadow-md transition flex items-center gap-3 group">
              <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition"><Store size={18} className="text-amber-600" /></div>
              <div className="text-left">
                <span className="font-bold text-sm text-gray-800 block">Ver Inventario</span>
                <span className="text-[10px] text-gray-500">Insumos y abastecimiento</span>
              </div>
            </button>
            <button onClick={() => navigate('/usuarios')} className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl hover:shadow-md transition flex items-center gap-3 group">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition"><Users size={18} className="text-blue-600" /></div>
              <div className="text-left">
                <span className="font-bold text-sm text-gray-800 block">Gestionar Personal</span>
                <span className="text-[10px] text-gray-500">Roles, turnos y permisos</span>
              </div>
            </button>
            <button onClick={() => navigate('/admin/sabores')} className="w-full p-4 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100 rounded-xl hover:shadow-md transition flex items-center gap-3 group">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition"><ChefHat size={18} className="text-purple-600" /></div>
              <div className="text-left">
                <span className="font-bold text-sm text-gray-800 block">Catálogo / Sabores</span>
                <span className="text-[10px] text-gray-500">Menú, precios y catálogo</span>
              </div>
            </button>
          </div>
        </Card>
      </div>

      {/* Sabores Populares */}
      {(stats?.populares?.length > 0) && (
        <Card title="🏆 Sabores Top" subtitle="Los más pedidos por tus clientes">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {stats.populares.map((entry, idx) => (
              <div key={idx} className="flex flex-col items-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-2xl mb-1">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎂'}</span>
                <span className="text-xs font-bold text-gray-700 text-center">{entry.name}</span>
                <span className="text-[10px] font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full mt-1">{entry.value} pedidos</span>
              </div>
            ))}
          </div>
        </Card>
      )}
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
      <PageHeader
        title={<span>Flujo de Trabajo <span className="text-pink-600">"La Fiesta"</span></span>}
        subtitle="Gestión operativa de pedidos"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Search} onClick={handleBuscar} className="hidden md:flex">Buscar Folio</Button>
            <Button variant="danger" icon={LogOut} onClick={handleLogout}>Salir</Button>
          </div>
        }
      />

      {/* Acciones Críticas - Prioridad Alta */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, idx) => (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={idx}>
            <div
              onClick={action.onClick}
              className={`${action.bg} text-white p-6 rounded-2xl shadow-lg cursor-pointer flex items-center justify-between group hover:opacity-90 transition h-24`}
            >
                <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Acción Rápida</span>
                    <span className="font-black text-lg">{action.title}</span>
                </div>
                <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                    <action.icon size={28} />
                </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Tablero de Ventas/Stats - Limpiado para empleados */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="flex flex-col gap-1 border-l-4 border-l-yellow-500 bg-yellow-50/30">
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Pendientes de Preparar</span>
          <span className="text-3xl font-black text-gray-900">{stats?.metrics?.pendingOrders || 0}</span>
        </Card>
        <Card className="flex flex-col gap-1 border-l-4 border-l-pink-500 bg-pink-50/30">
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Entregas Hoy</span>
          <span className="text-3xl font-black text-gray-900">{stats?.metrics?.todayOrders || 0}</span>
        </Card>
        <Card className="flex flex-col gap-1 border-l-4 border-l-purple-500 bg-purple-50/30 font-bold">
           <span className="text-gray-400 text-[10px] uppercase tracking-widest">Capacidad de Cocina</span>
           <span className="text-xs text-purple-700 mt-1">Estándar (90% Lleno)</span>
        </Card>
        <Card className="flex flex-col gap-1 border-l-4 border-l-blue-500 bg-blue-50/30">
          <span className="text-gray-400 text-[10px] uppercase tracking-widest">Próximos 7 días</span>
          <span className="text-3xl font-black text-gray-900">{stats?.metrics?.totalOrders || 0}</span>
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Cola de Trabajo Principal */}
          <Card
            title="Cola de Trabajo Actual"
            subtitle="Pedidos que requieren atención"
            action={
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <button onClick={() => setFilter('ALL')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${filter === 'ALL' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}>Todos</button>
                <button onClick={() => setFilter('TODAY')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${filter === 'TODAY' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}>Hoy</button>
                <button onClick={() => setFilter('URGENT')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${filter === 'URGENT' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>Urgentes</button>
              </div>
            }
          >
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
                        className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between
                            ${isToday ? 'bg-pink-50/50 border-pink-100 hover:border-pink-300' : 'bg-white border-gray-100 hover:border-pink-200'}
                        `}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg
                                ${isToday ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-400'}
                            `}>
                                {f.folio_numero?.slice(-2) || f.id}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    {f.cliente_nombre}
                                    {isToday && <Badge variant="danger" className="text-[10px]">PARA HOY</Badge>}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                    <span className="flex items-center gap-1"><Clock size={12}/> {f.hora_entrega}</span>
                                    <span className="flex items-center gap-1"><FileText size={12}/> {f.folio_numero}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Estado</span>
                                <Badge variant={f.estatus_folio === 'Cancelado' ? 'danger' : f.estatus_produccion === 'Terminado' ? 'success' : 'warning'}>
                                    {f.estatus_folio === 'Cancelado' ? 'Cancelado' : f.estatus_produccion}
                                </Badge>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleDownloadPDF(f.id); }} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500 group-hover:text-pink-600 transition-colors">
                            <Printer size={18} />
                            </button>
                        </div>
                    </div>
                  );
                })}
                <Button variant="ghost" fullWidth onClick={() => navigate('/pedidos')} className="text-gray-400 hover:text-pink-600">
                    Ver todos los pedidos anteriores &rarr;
                </Button>
              </div>
            )}
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

