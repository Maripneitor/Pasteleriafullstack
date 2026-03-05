import React, { useState, useEffect } from 'react';
import client from '../config/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { KpiCard } from '../components/ui/KpiCard';
import { EmptyState } from '../components/ui/EmptyState';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Lock, Eye, EyeOff, PlusCircle, MinusCircle, User, FileText, CreditCard, Landmark, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CashRegister() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState({ cut: null, movements: [] });
    const [showBalances, setShowBalances] = useState(true);
    const [arqueoInput, setArqueoInput] = useState("");
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseData, setExpenseData] = useState({ amount: "", category: "Otros", description: "" });

    const fetchData = async () => {
        try {
            const res = await client.get(`/cash/summary?date=${date}`);
            setData(res.data);
        } catch {
            // ignore error
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [date]);

    const handleClose = async () => {
        if (!confirm("¿Cerrar caja del día?")) return;
        try {
            await client.post('/cash/close', { date, physicalCount: arqueoInput });
            toast.success("Caja cerrada");
            fetchData();
        } catch (e) {
            toast.error(e.response?.data?.message || "Error al cerrar");
        }
    };

    const handleAddExpense = async () => {
        if (Number(expenseData.amount) > 500 && !expenseData.description.trim()) {
            toast.error("⚠️ Alerta IA: Los egresos mayores a $500 requieren una descripción obligatoria por auditoría.");
            return;
        }

        try {
            await client.post('/cash/movement', {
                ...expenseData,
                type: 'Expense',
                category: 'Gasto: ' + expenseData.category,
                date
            });
            toast.success("Gasto registrado");
            setShowExpenseModal(false);
            setExpenseData({ amount: "", category: "Otros", description: "" });
            fetchData();
        } catch {
            toast.error("Error al registrar gasto");
        }
    };

    const [aiSummary, setAiSummary] = useState(null);

    const generateAISummary = async () => {
        try {
            // Ideally this would be an AI endpoint, for now we simulate with logic
            const todaySales = Number(cut.totalIncome || 0);
            const resVal = await client.get(`/reports/daily-comparison?date=${date}`);
            const yesterdaySales = resVal.data.yesterdaySales || 0;
            
            let diffPercent = 0;
            if (yesterdaySales > 0) {
                diffPercent = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
            }

            const message = diffPercent >= 0 
                ? `🚀 ¡Buen trabajo! Hoy las ventas subieron un ${diffPercent.toFixed(1)}% respecto a ayer.`
                : `📉 Las ventas bajaron un ${Math.abs(diffPercent).toFixed(1)}% respecto a ayer. Revisa el tráfico del día.`;
            
            setAiSummary(message);
        } catch {
            setAiSummary("Hoy se procesaron los cierres correctamente. ¡Buen día!");
        }
    };

    useEffect(() => {
        if (cut.status === 'Closed') {
            generateAISummary();
        }
    // eslint-disable-next-line
    }, [cut.status, date]);

    const cut = data.cut || {};
    const format = (val) => `$${Number(val || 0).toLocaleString()}`;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 fade-in pb-20">
            <div className="flex justify-between items-center mb-6">
                <div>
                <h1 className="text-2xl font-black text-text-main tracking-tight flex items-center gap-2">Caja y Cortes 💰</h1>
                <p className="text-text-muted text-sm">Control financiero diario y flujo de efectivo</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <KpiCard
                    title="Efectivo"
                    amount={cut.incomeCash}
                    icon={DollarSign}
                    allowHide={true}
                    className="border-l-4 border-l-semantic-success"
                />
                <KpiCard
                    title="Tarjeta"
                    amount={cut.incomeCard}
                    icon={CreditCard}
                    allowHide={true}
                    className="border-l-4 border-l-semantic-info"
                />
                <KpiCard
                    title="Transferencia"
                    amount={cut.incomeTransfer}
                    icon={Landmark}
                    allowHide={true}
                    className="border-l-4 border-l-brand-secondary"
                />
                <KpiCard
                    title="Balance Final"
                    amount={cut.finalBalance}
                    icon={Calculator}
                    allowHide={true}
                    className="bg-app border-l-4 border-l-text-main"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2">
                            <div className="flex items-center gap-4">
                                <div>
                                    <CardTitle>Movimientos</CardTitle>
                                    <CardContent className="px-0 py-1 text-text-muted text-sm">Registro de entradas y salidas</CardContent>
                                </div>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="p-2 border border-border bg-app rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setShowExpenseModal(true)}
                                    variant="outline"
                                    className="text-semantic-error border-semantic-error/30 hover:bg-semantic-error/10"
                                    icon={MinusCircle}
                                >
                                    Registrar Gasto
                                </Button>
                                {cut.status === 'Open' ? (
                                    <Button
                                        onClick={handleClose}
                                        icon={Lock}
                                    >
                                        Cerrar Caja
                                    </Button>
                                ) : (
                                    <Badge variant="error" className="py-1.5 px-3">Caja Cerrada</Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="px-0 pt-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Hora / Usuario</TableHead>
                                        <TableHead>Concepto / Medio</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Monto</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.movements.map(m => (
                                        <TableRow key={m.id}>
                                            <TableCell>
                                                <div className="font-bold text-text-main">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                <div className="flex items-center gap-1 text-[10px] text-text-muted font-bold uppercase">
                                                    <User size={10}/> {m.User?.name || 'Sistema'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-text-main">{m.category}</div>
                                                <div className="text-[10px] text-text-muted font-bold uppercase">{m.paymentMethod} {m.referenceId && `· Ref: ${m.referenceId}`}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={m.status === 'Cancelado' ? 'error' : 'success'} className="text-[10px]">
                                                    {m.status || 'Completado'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className={`text-right font-black text-lg ${m.type === 'Income' ? 'text-semantic-success' : 'text-semantic-error'}`}>
                                                {m.type === 'Income' ? '+' : '-'} {format(m.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {data.movements.length === 0 && (
                                <EmptyState
                                    title="Sin movimientos"
                                    description="No hay transacciones registradas para esta fecha."
                                    icon={FileText}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Arqueo de Caja */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Arqueo (Conteo Físico)</CardTitle>
                            <CardContent className="px-0 py-1 text-text-muted text-sm">Valida el efectivo en caja</CardContent>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1 block">Efectivo Físico</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-text-muted">$</span>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={arqueoInput}
                                            onChange={(e) => setArqueoInput(e.target.value)}
                                            className="w-full p-4 pl-8 bg-app border border-border rounded-xl focus:ring-2 focus:ring-brand-primary outline-none font-bold text-xl text-text-main"
                                        />
                                    </div>
                                </div>

                                {arqueoInput !== "" && (
                                    <div className={`p-4 rounded-xl ${
                                        (Number(arqueoInput) - Number(cut.incomeCash)) >= 0 ? 'bg-semantic-success/10 border border-semantic-success/20' : 'bg-semantic-error/10 border border-semantic-error/20'
                                    }`}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-text-muted uppercase">Diferencia:</span>
                                            <span className={`text-xl font-black ${
                                                (Number(arqueoInput) - Number(cut.incomeCash)) >= 0 ? 'text-semantic-success' : 'text-semantic-error'
                                            }`}>
                                                {(Number(arqueoInput) - Number(cut.incomeCash)) > 0 ? '+' : ''}
                                                {format(Number(arqueoInput) - Number(cut.incomeCash))}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-text-muted mt-1 uppercase font-bold text-right">
                                            {(Number(arqueoInput) - Number(cut.incomeCash)) === 0 ? 'Cuadrado ✅' : (Number(arqueoInput) - Number(cut.incomeCash)) > 0 ? 'Sobrante' : 'Faltante'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-app border-border">
                        <CardHeader>
                            <CardTitle>Resumen de Corte</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Total Ingresos</span>
                                    <span className="font-bold text-semantic-success">{format(cut.totalIncome)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Total Egresos</span>
                                    <span className="font-bold text-semantic-error">{format(cut.totalExpense)}</span>
                                </div>
                                <div className="pt-3 border-t border-border flex justify-between items-center">
                                    <span className="font-bold text-text-main">Final Esperado</span>
                                    <span className="font-black text-xl text-text-main">{format(cut.finalBalance)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {aiSummary && (
                        <Card className="bg-brand-secondary text-white border-none shadow-xl">
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    <div className="bg-white/20 p-3 rounded-2xl h-fit">
                                        <span className="text-2xl">🤖</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1 uppercase tracking-widest text-white/70">Asistente de Negocio</h4>
                                        <p className="text-sm font-medium leading-relaxed">
                                            {aiSummary}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Simple Modal for Expense */}
            {showExpenseModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl scale-in">
                        <h2 className="text-2xl font-black text-text-main mb-6 flex items-center gap-2">
                            <MinusCircle className="text-semantic-error" /> Registrar Gasto
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-1">Monto</label>
                                <input
                                    type="number"
                                    value={expenseData.amount}
                                    onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
                                    className="w-full p-4 bg-app border border-border text-text-main rounded-xl outline-none focus:ring-2 focus:ring-semantic-error font-bold text-lg"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-1">Categoría</label>
                                <select
                                    value={expenseData.category}
                                    onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
                                    className="w-full p-4 bg-app border border-border text-text-main rounded-xl outline-none focus:ring-2 focus:ring-brand-primary"
                                >
                                    <option value="Servicios">Servicios</option>
                                    <option value="Insumos">Insumos</option>
                                    <option value="Transporte">Transporte</option>
                                    <option value="Limpieza">Limpieza</option>
                                    <option value="Otros">Otros</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-1">Descripción</label>
                                <textarea
                                    value={expenseData.description}
                                    onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
                                    className="w-full p-4 bg-app border border-border text-text-main rounded-xl outline-none focus:ring-2 focus:ring-brand-primary"
                                    placeholder="Detalles del gasto..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowExpenseModal(false)}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleAddExpense}
                                    className="flex-1"
                                >
                                    Guardar Gasto
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
