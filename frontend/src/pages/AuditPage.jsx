import React, { useState, useEffect } from 'react';
import client from '../config/axios';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/common/Table';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function AuditPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await client.get('/audit');
            setLogs(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <PageHeader
                title="Auditoría & Seguridad"
                subtitle="Registro de actividades del sistema — 'Modo Chismoso' activado."
                actions={
                    <Button variant="secondary" onClick={fetchLogs} icon={RefreshCw} loading={loading}>
                        Refrescar
                    </Button>
                }
            />

            {/* Radar de Anomalías */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 border-red-100 bg-red-50/30">
                    <h3 className="font-black text-red-600 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                        <ShieldAlert size={16} /> Radar de Anomalías
                    </h3>
                    <div className="space-y-3">
                        {logs.filter(l => l.action === 'PRICE_CHANGE' || l.action === 'DELETE').slice(0, 3).map(l => (
                            <div key={l.id} className="p-3 bg-white rounded-xl border border-red-100 shadow-sm">
                                <p className="text-[10px] font-black text-red-500 uppercase">{l.action === 'DELETE' ? 'ELIMINACIÓN' : 'CAMBIO DE PRECIO'}</p>
                                <p className="text-xs font-bold text-gray-800 mt-1">{l.meta?.folio || `ID: ${l.entityId}`}</p>
                                <p className="text-[10px] text-gray-500">{new Date(l.createdAt).toLocaleDateString()} por {l.actor?.name || 'Sistema'}</p>
                            </div>
                        ))}
                        {logs.filter(l => l.action === 'PRICE_CHANGE' || l.action === 'DELETE').length === 0 && (
                            <p className="text-xs text-gray-400 italic">No se detectan anomalías críticas hoy.</p>
                        )}
                    </div>
                </Card>

                <Card className="md:col-span-2">
                    <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                        <ShieldAlert className="text-blue-600" size={24} />
                        <p className="text-sm text-blue-800 font-medium">
                            Se están monitoreando cambios de precios, eliminaciones y accesos a datos sensibles.
                        </p>
                    </div>

                    {!logs.length ? (
                        <EmptyState title="Sin registros" description="No hay actividad registrada aún." />
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Evento</TableHead>
                                        <TableHead>Detalle Crítico</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map(log => (
                                        <TableRow key={log.id} className={log.action === 'PRICE_CHANGE' || log.action === 'DELETE' ? 'bg-orange-50/30' : ''}>
                                            <TableCell className="text-xs text-gray-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</TableCell>
                                            <TableCell className="font-bold text-gray-900">
                                                <div className="flex flex-col">
                                                    <span>{log.actor?.name || log.actor?.username || 'Desconocido'}</span>
                                                    <span className="text-[10px] text-gray-400">{log.actor?.role}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    log.action === 'DELETE' ? 'danger' :
                                                    log.action === 'PRICE_CHANGE' ? 'warning' :
                                                    log.action === 'CREATE' ? 'success' : 'info'
                                                }>
                                                    {log.action === 'PRICE_CHANGE' ? '⚠️ PRECIO MODIFICADO' : 
                                                     log.action === 'DELETE' ? '🚨 ELIMINACIÓN' : log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs">
                                                    <span className="font-bold text-gray-700">{log.entity}: {log.meta?.folio || log.entityId}</span>
                                                    {log.action === 'PRICE_CHANGE' && (
                                                        <div className="text-[10px] text-orange-600 font-bold mt-1">
                                                            ${log.meta?.oldTotal} → ${log.meta?.newTotal}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
