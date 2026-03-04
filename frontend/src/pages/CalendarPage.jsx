import { useState, useRef, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { ordersApi } from '../services/ordersApi';
import { handlePdfResponse } from '../utils/pdfHelper';
import PageShell from '../components/ui/PageShell';
import Card from '../components/ui/Card';
import DayDetailModal from '../components/calendar/DayDetailModal';
import EventDetailModal from '../components/calendar/EventDetailModal';
import { Printer, Calendar, Clock, ChevronRight, Package, DollarSign, FileText, Edit, Cake, AlertTriangle, X } from 'lucide-react';

const MAX_CAPACITY_PER_DAY = 12; // Configurable: pedidos máximos por día

export default function CalendarPage() {
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [sidePanelDay, setSidePanelDay] = useState(null); // For the side panel
    const [allEvents, setAllEvents] = useState([]);
    const calendarRef = useRef(null);

    useEffect(() => {
        const handleFoliosChanged = () => {
            calendarRef.current?.getApi().refetchEvents();
        };
        window.addEventListener('folios:changed', handleFoliosChanged);
        return () => window.removeEventListener('folios:changed', handleFoliosChanged);
    }, []);

    // Fetch events
    const fetchEvents = async (fetchInfo, successCallback, failureCallback) => {
        try {
            const { startStr, endStr } = fetchInfo;
            const res = await ordersApi.getCalendarEventsLite(startStr, endStr);
            setAllEvents(res.data);
            successCallback(res.data);
        } catch (e) {
            console.error("Calendar fetch error", e);
            failureCallback(e);
        }
    };

    // Get events for a specific day
    const getEventsForDay = (dateStr) => {
        return allEvents.filter(evt => {
            const evtDate = evt.start?.split('T')[0] || evt.start;
            return evtDate === dateStr;
        });
    };

    // Compute day summaries for capacity indicators
    const daySummaries = useMemo(() => {
        const map = {};
        allEvents.forEach(evt => {
            const dateStr = evt.start?.split('T')[0] || evt.start;
            if (!map[dateStr]) map[dateStr] = { count: 0, paid: 0, pending: 0, cancelled: 0 };
            map[dateStr].count++;
            if (evt.extendedProps?.isCancelled) map[dateStr].cancelled++;
            else if (evt.extendedProps?.isPaid) map[dateStr].paid++;
            else map[dateStr].pending++;
        });
        return map;
    }, [allEvents]);

    const handleDateClick = (arg) => {
        const dayEvents = getEventsForDay(arg.dateStr);
        // Set side panel instead of modal for desktop
        setSidePanelDay({
            date: arg.date,
            dateStr: arg.dateStr,
            events: dayEvents
        });
    };

    const handleEventClick = (info) => {
        info.jsEvent.stopPropagation();
        setSelectedEventId(info.event.id);
    };

    const handlePrintDaySummary = (dateStr) => {
        handlePdfResponse(() => ordersApi.downloadDaySummary(dateStr));
    };

    // Side panel day events (reactive to allEvents changes)
    const sidePanelEvents = sidePanelDay ? getEventsForDay(sidePanelDay.dateStr) : [];

    return (
        <PageShell title="Calendario de Entregas">
            <div className="flex gap-6 h-[80vh]">
                {/* Calendar - Reduced size when side panel is open */}
                <div className={`transition-all duration-300 ${sidePanelDay ? 'flex-[2]' : 'flex-1'}`}>
                    <Card className="h-full">
                        <div className="h-full">
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                locale={esLocale}
                                events={fetchEvents}
                                dateClick={handleDateClick}
                                eventClick={handleEventClick}
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                }}
                                height="100%"
                                dayMaxEvents={3}
                                eventTimeFormat={{
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    meridiem: 'short'
                                }}
                                dayCellContent={(dayInfo) => {
                                    const dateStr = dayInfo.date.toISOString().split('T')[0];
                                    const summary = daySummaries[dateStr];
                                    const capacityPercent = summary ? Math.round((summary.count / MAX_CAPACITY_PER_DAY) * 100) : 0;
                                    const isNearCapacity = capacityPercent >= 75;
                                    const isAtCapacity = capacityPercent >= 100;

                                    return (
                                        <div className="w-full">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-sm font-bold ${isAtCapacity ? 'text-red-600' : isNearCapacity ? 'text-orange-600' : ''}`}>
                                                    {dayInfo.dayNumberText}
                                                </span>
                                                {summary && summary.count > 0 && (
                                                    <div className="flex items-center gap-0.5">
                                                        {summary.pending > 0 && (
                                                            <span className="w-2 h-2 rounded-full bg-orange-400" title={`${summary.pending} pendientes`}></span>
                                                        )}
                                                        {summary.paid > 0 && (
                                                            <span className="w-2 h-2 rounded-full bg-emerald-400" title={`${summary.paid} pagados`}></span>
                                                        )}
                                                        {summary.cancelled > 0 && (
                                                            <span className="w-2 h-2 rounded-full bg-red-400" title={`${summary.cancelled} cancelados`}></span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {summary && summary.count > 0 && (
                                                <div className="mt-0.5">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[9px] font-bold text-gray-500">
                                                            {summary.count} 🎂
                                                        </span>
                                                        {isNearCapacity && (
                                                            <AlertTriangle size={10} className={isAtCapacity ? 'text-red-500' : 'text-orange-500'} />
                                                        )}
                                                    </div>
                                                    {/* Capacity bar */}
                                                    <div className="w-full h-0.5 bg-gray-100 rounded-full mt-0.5 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${isAtCapacity ? 'bg-red-500' : isNearCapacity ? 'bg-orange-400' : 'bg-emerald-400'}`}
                                                            style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }}
                                eventContent={(eventInfo) => {
                                    const isCancelled = eventInfo.event.extendedProps?.isCancelled;
                                    const isPaid = eventInfo.event.extendedProps?.isPaid;

                                    // Color coding by status
                                    let bgColor;
                                    if (isCancelled) bgColor = '#9ca3af'; // gray
                                    else if (isPaid) bgColor = '#10b981'; // green
                                    else bgColor = '#f59e0b'; // amber/pending

                                    return (
                                        <div
                                            className={`p-1 px-2 text-xs font-bold text-white rounded shadow-sm w-full outline-none border-none truncate ${isCancelled ? 'opacity-60 line-through' : ''}`}
                                            style={{ backgroundColor: bgColor }}
                                        >
                                            <div className="flex items-center gap-1 opacity-90 text-[10px]">
                                                <span>⏰ {eventInfo.timeText}</span>
                                            </div>
                                            <div className="truncate">{eventInfo.event.title}</div>
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    </Card>
                </div>

                {/* Side Panel - Day Details */}
                {sidePanelDay && (
                    <div className="flex-1 min-w-[320px] max-w-[420px] hidden lg:flex flex-col bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in slide-in-from-right-4 duration-300">
                        {/* Panel Header */}
                        <div className="p-5 bg-gradient-to-br from-pink-500 to-rose-600 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-80">Agenda del Día</h3>
                                    <h4 className="text-lg font-black capitalize mt-1">
                                        {sidePanelDay.date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </h4>
                                </div>
                                <button
                                    onClick={() => setSidePanelDay(null)}
                                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex gap-3 mt-4">
                                <div className="bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                                    <span className="text-[9px] font-bold block opacity-70">TOTAL</span>
                                    <span className="text-lg font-black">{sidePanelEvents.length}</span>
                                </div>
                                <div className="bg-emerald-400/20 px-3 py-1.5 rounded-xl border border-emerald-400/20">
                                    <span className="text-[9px] font-bold block opacity-70">PAGADOS</span>
                                    <span className="text-lg font-black">{sidePanelEvents.filter(e => e.extendedProps?.isPaid && !e.extendedProps?.isCancelled).length}</span>
                                </div>
                                <div className="bg-orange-400/20 px-3 py-1.5 rounded-xl border border-orange-400/20">
                                    <span className="text-[9px] font-bold block opacity-70">DEUDA</span>
                                    <span className="text-lg font-black">{sidePanelEvents.filter(e => !e.extendedProps?.isPaid && !e.extendedProps?.isCancelled).length}</span>
                                </div>
                            </div>

                            {/* Capacity Indicator */}
                            {(() => {
                                const activeCount = sidePanelEvents.filter(e => !e.extendedProps?.isCancelled).length;
                                const pct = Math.round((activeCount / MAX_CAPACITY_PER_DAY) * 100);
                                return (
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-[10px] font-bold opacity-80 mb-1">
                                            <span>Capacidad del Día</span>
                                            <span>{activeCount}/{MAX_CAPACITY_PER_DAY} ({pct}%)</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-400' : pct >= 75 ? 'bg-orange-400' : 'bg-white'}`}
                                                style={{ width: `${Math.min(pct, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Events List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {sidePanelEvents.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="bg-gray-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-dashed border-gray-200">
                                        <Package size={24} className="text-gray-300" />
                                    </div>
                                    <h4 className="text-gray-500 font-bold text-sm">Día libre</h4>
                                    <p className="text-gray-400 text-xs">Sin pedidos para esta fecha.</p>
                                </div>
                            ) : (
                                sidePanelEvents.map(evt => {
                                    const data = evt.extendedProps || {};
                                    const isCancelled = data.isCancelled;
                                    const isPaid = data.isPaid;

                                    return (
                                        <div
                                            key={evt.id || evt.title}
                                            onClick={() => setSelectedEventId(evt.id)}
                                            className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md group ${
                                                isCancelled ? 'border-red-100 bg-red-50/50 opacity-60'
                                                : isPaid ? 'border-emerald-100 bg-emerald-50/30 hover:border-emerald-300'
                                                : 'border-orange-100 bg-orange-50/30 hover:border-orange-300'
                                            }`}
                                        >
                                            {/* Left color indicator */}
                                            <div className="flex items-start gap-3">
                                                <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${
                                                    isCancelled ? 'bg-red-400' : isPaid ? 'bg-emerald-500' : 'bg-orange-500'
                                                }`}></div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-black text-gray-400">
                                                            #{data.folioNumber || evt.id}
                                                        </span>
                                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase ${
                                                            isCancelled ? 'bg-red-100 text-red-600'
                                                            : isPaid ? 'bg-emerald-100 text-emerald-600'
                                                            : 'bg-orange-100 text-orange-600'
                                                        }`}>
                                                            {isCancelled ? 'Cancelado' : isPaid ? 'Pagado' : `Debe $${data.resta || '?'}`}
                                                        </span>
                                                    </div>
                                                    <h5 className={`font-bold text-gray-900 text-sm truncate ${isCancelled ? 'line-through opacity-50' : ''}`}>
                                                        {data.cliente_nombre || evt.title}
                                                    </h5>
                                                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                                                        <span className="flex items-center gap-0.5">
                                                            <Clock size={10} /> {data.hora_entrega || '??:??'}
                                                        </span>
                                                        {data.tipo_folio && (
                                                            <span className="text-pink-500 font-bold">• {data.tipo_folio}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className="text-gray-300 group-hover:text-pink-500 transition flex-shrink-0 mt-1" />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Panel Footer */}
                        <div className="p-4 border-t border-gray-100 flex gap-2">
                            <button
                                onClick={() => {
                                    // Open full modal for more detail  
                                    const calendarApi = calendarRef.current.getApi();
                                    const events = calendarApi.getEvents();
                                    const dayEvents = events.filter(evt => {
                                        const d = evt.start;
                                        return d && d.toISOString().split('T')[0] === sidePanelDay.dateStr;
                                    });
                                    setSelectedDay({
                                        date: sidePanelDay.date,
                                        events: dayEvents.map(e => ({
                                            id: e.id,
                                            title: e.title,
                                            start: e.start,
                                            extendedProps: e.extendedProps
                                        }))
                                    });
                                }}
                                className="flex-1 py-3 bg-pink-50 text-pink-600 rounded-xl font-bold text-xs hover:bg-pink-100 transition flex items-center justify-center gap-1.5"
                            >
                                <Edit size={14} /> Ver Detalle Completo
                            </button>
                            {sidePanelEvents.length > 0 && (
                                <button
                                    onClick={() => handlePrintDaySummary(sidePanelDay.dateStr)}
                                    className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition flex items-center justify-center gap-1.5"
                                >
                                    <Printer size={14} /> Imprimir Orden del Día
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Día (Resumen completo) */}
            {selectedDay && (
                <DayDetailModal
                    date={selectedDay.date}
                    events={selectedDay.events}
                    onClose={() => setSelectedDay(null)}
                    onRefresh={() => calendarRef.current?.getApi().refetchEvents()}
                />
            )}

            {/* Modal de Evento Individual */}
            {selectedEventId && (
                <EventDetailModal
                    eventId={selectedEventId}
                    onClose={() => setSelectedEventId(null)}
                />
            )}
        </PageShell>
    );
}
