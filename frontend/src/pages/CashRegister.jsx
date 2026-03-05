import React, { useState, useEffect } from 'react';
import client from '../config/axios';
import PageShell from '../components/ui/PageShell';
import Card from '../components/ui/Card';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Lock, Eye, EyeOff, PlusCircle, MinusCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../components/common/Badge';

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
    const format = (val) => showBalances ? `$${Number(val || 0).toLocaleString()}` : "****";

    return (
        <PageShell title="Caja y Cortes 💰">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-emerald-50 border-emerald-100 p-4">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">Efectivo</span>
                    <div className="text-2xl font-black text-emerald-700">{format(cut.incomeCash)}</div>
                </Card>
                <Card className="bg-blue-50 border-blue-100 p-4">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">Tarjeta</span>
                    <div className="text-2xl font-black text-blue-700">{format(cut.incomeCard)}</div>
                </Card>
                <Card className="bg-purple-50 border-purple-100 p-4">
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest block mb-1">Transferencia</span>
                    <div className="text-2xl font-black text-purple-700">{format(cut.incomeTransfer)}</div>
                </Card>
                <Card className="bg-gray-900 border-gray-800 p-4 text-white relative">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex justify-between items-center">
                        Balance Final
                        <button onClick={() => setShowBalances(!showBalances)} className="p-1 hover:bg-white/10 rounded transition">
                            {showBalances ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button>
                    </span>
                    <div className="text-2xl font-black">{format(cut.finalBalance)}</div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <h3 className="font-bold text-lg">Movimientos</h3>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="p-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-pink-500"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowExpenseModal(true)}
                                    className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition flex items-center gap-2 text-sm font-bold"
                                >
                                    <MinusCircle size={16} /> Registrar Gasto
                                </button>
                                {cut.status === 'Open' ? (
                                    <button
                                        onClick={handleClose}
                                        className="bg-pink-600 text-white px-4 py-2 rounded-xl hover:bg-pink-700 transition flex items-center gap-2 text-sm font-bold shadow-md shadow-pink-200"
                                    >
                                        <Lock size={16} /> Cerrar Caja
                                    </button>
                                ) : (
                                    <Badge variant="danger" className="py-2 px-4 rounded-xl">Caja Cerrada</Badge>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                                    <tr>
                                        <th className="p-4">Hora / Usuario</th>
                                        <th className="p-4">Concepto / Medio</th>
                                        <th className="p-4">Estado</th>
                                        <th className="p-4 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {data.movements.map(m => (
                                        <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-gray-900">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
                                                    <User size={10}/> {m.User?.name || 'Sistema'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800">{m.category}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase">{m.paymentMethod} {m.referenceId && `· Ref: ${m.referenceId}`}</div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={m.status === 'Cancelado' ? 'danger' : 'success'} className="text-[10px]">
                                                    {m.status || 'Completado'}
                                                </Badge>
                                            </td>
                                            <td className={`p-4 text-right font-black text-lg ${m.type === 'Income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {m.type === 'Income' ? '+' : '-'} {format(m.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                    {data.movements.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center p-12 text-gray-400 italic">
                                                No hay movimientos para esta fecha.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Arqueo de Caja */}
                    <Card title="Arqueo (Conteo Físico)" subtitle="Valida el efectivo en caja">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Efectivo Físico</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={arqueoInput}
                                        onChange={(e) => setArqueoInput(e.target.value)}
                                        className="w-full p-4 pl-8 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none font-bold text-xl"
                                    />
                                </div>
                            </div>

                            {arqueoInput !== "" && (
                                <div className={`p-4 rounded-xl ${
                                    (Number(arqueoInput) - Number(cut.incomeCash)) >= 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'
                                }`}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Diferencia:</span>
                                        <span className={`text-xl font-black ${
                                            (Number(arqueoInput) - Number(cut.incomeCash)) >= 0 ? 'text-emerald-600' : 'text-red-600'
                                        }`}>
                                            {(Number(arqueoInput) - Number(cut.incomeCash)) > 0 ? '+' : ''}
                                            {format(Number(arqueoInput) - Number(cut.incomeCash))}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold text-right">
                                        {(Number(arqueoInput) - Number(cut.incomeCash)) === 0 ? 'Cuadrado ✅' : (Number(arqueoInput) - Number(cut.incomeCash)) > 0 ? 'Sobrante' : 'Faltante'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card title="Resumen de Corte" className="bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Ingresos</span>
                                <span className="font-bold text-emerald-600">{format(cut.totalIncome)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Egresos</span>
                                <span className="font-bold text-red-600">{format(cut.totalExpense)}</span>
                            </div>
                            <div className="pt-3 border-t flex justify-between items-center">
                                <span className="font-bold text-gray-800">Final Esperado</span>
                                <span className="font-black text-xl text-gray-900">{format(cut.finalBalance)}</span>
                            </div>
                        </div>
                    </Card>

                    {aiSummary && (
                        <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-xl shadow-purple-200">
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
                        </Card>
                    )}
                </div>
            </div>

            {/* Simple Modal for Expense */}
            {showExpenseModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl scale-in">
                        <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                            <MinusCircle className="text-red-500" /> Registrar Gasto
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Monto</label>
                                <input
                                    type="number"
                                    value={expenseData.amount}
                                    onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 font-bold text-lg"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Categoría</label>
                                <select
                                    value={expenseData.category}
                                    onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="Servicios">Servicios</option>
                                    <option value="Insumos">Insumos</option>
                                    <option value="Transporte">Transporte</option>
                                    <option value="Limpieza">Limpieza</option>
                                    <option value="Otros">Otros</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Descripción</label>
                                <textarea
                                    value={expenseData.description}
                                    onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                                    placeholder="Detalles del gasto..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowExpenseModal(false)}
                                    className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddExpense}
                                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200"
                                >
                                    Guardar Gasto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PageShell>
    );
}
