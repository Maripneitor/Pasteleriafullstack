import React from 'react';
import { useNavigate } from 'react-router-dom';
import usePollingQR from '../hooks/usePollingQR';
import { Smartphone, RefreshCw, CheckCircle, Power, LogOut, WifiOff, QrCode, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Loader } from 'lucide-react';
import { getToken } from '../utils/auth';


const WhatsAppPage = () => {
    const navigate = useNavigate();
    const hookData = usePollingQR();
    const { qr, status, phone, reload, restart } = hookData;

    const safeReload = reload || (() => window.location.reload());
    const safeRestart = restart || (() => window.location.reload());

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 fade-in">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-gray-800 transition mb-4"
            >
                <ArrowLeft size={20} className="mr-2" /> Volver
            </button>

            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-3xl font-bold mb-2 text-gray-800">Conectar WhatsApp</h1>
                <p className="text-gray-500 mb-8 text-center max-w-md">
                    Escanea el código QR para vincular la IA con tu número de WhatsApp Business.
                </p>

                <div className="p-8 flex flex-col items-center w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-2xl relative">
                    {/* Security Notice */}
                    <div className="absolute -top-12 left-0 right-0 bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center gap-3 text-amber-800 text-xs font-medium shadow-sm">
                        <ShieldAlert size={18} className="text-amber-500 shrink-0" />
                        <span>AVISO: Nadie del equipo de soporte te pedirá nunca tu código de verificación.</span>
                    </div>

                    <div className="w-64 h-64 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 overflow-hidden border-2 border-dashed border-gray-300 relative group">
                        {status === 'loading' && (
                            <div className="animate-pulse flex flex-col items-center text-gray-400">
                                <Loader className="animate-spin mb-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">Cargando QR...</span>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="text-red-500 flex flex-col items-center text-center p-4">
                                <WifiOff size={40} className="mb-2" />
                                <span className="font-bold">Error de Conexión</span>
                                <button onClick={safeReload} className="mt-4 text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold hover:bg-red-200 transition">
                                    Reintentar
                                </button>
                            </div>
                        )}

                        {status === 'ready' && (
                            <div className="absolute inset-0 bg-emerald-500/10 flex flex-col items-center justify-center text-emerald-600 font-bold fade-in backdrop-blur-sm z-10 p-4 text-center">
                                <CheckCircle size={64} className="mb-4 drop-shadow-md text-emerald-500" />
                                <span className="text-xl">✅ Conectado</span>
                                {phone && <span className="text-sm font-mono mt-1 opacity-80">+{phone}</span>}
                            </div>
                        )}

                        {/* QR Display */}
                        {status !== 'ready' && (
                            <img
                                src={`/api/whatsapp/qr?format=image&t=${Date.now()}&token=${getToken()}`}
                                alt="WhatsApp QR"
                                className={`w-full h-full object-contain scale-95 group-hover:scale-100 transition duration-500 ${status === 'loading' ? 'opacity-0' : 'opacity-100'}`}
                                onError={(e) => { e.target.style.display = 'none'; }}
                                onLoad={(e) => { e.target.style.display = 'block'; }}
                            />
                        )}
                    </div>

                    <div className="flex gap-4 w-full">
                        <button
                            onClick={safeReload}
                            className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={18} /> Recargar QR
                        </button>

                        {status === 'ready' ? (
                            <button
                                onClick={() => {
                                    if (window.confirm("¿Cerrar sesión y desconectar?")) safeRestart();
                                }}
                                className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} /> Desconectar
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    if (window.confirm("¿Reiniciar servicio de WhatsApp?")) safeRestart();
                                }}
                                className="flex-1 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-2"
                            >
                                <Power size={18} /> Reiniciar
                            </button>
                        )}
                    </div>

                    <div className="mt-6 flex flex-col gap-2 w-full">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
                            <Smartphone size={18} />
                            <span>Abre WhatsApp en tu teléfono</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-pink-50 text-pink-700 rounded-xl text-sm font-medium">
                            <QrCode size={18} />
                            <span>Ve a Dispositivos Vinculados &gt; Vincular</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppPage;
