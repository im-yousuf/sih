/**
 * Header — top navbar (light theme).
 *
 * Layout: three zones, never wraps
 * ─────────────────────────────────
 *  LEFT   min-w-0 overflow-hidden  – field name + well identifier
 *  CENTER flex-shrink-0            – connection pill + clock (hidden on xs)
 *  RIGHT  flex-shrink-0            – lang switcher, bell, user
 */

import {
  Bell, User, Clock, Wifi, WifiOff,
  CheckCheck, X, Globe,
} from 'lucide-react';
import { useDigitalTwinStore }                            from '../store/digitalTwinStore';
import { useFilteredNotifications, NotifType }           from '../store/notificationStore';
import { useAuthStore }                                   from '../store/authStore';
import { useState, useEffect, useRef }                   from 'react';
import { useTranslation }                                 from 'react-i18next';
import i18n, { LANGUAGES }                               from '../i18n';

// ─── Notification type → visual tokens ───────────────────────────────────────
const TYPE_STYLE: Record<NotifType, {
  border: string; bg: string; dot: string; label: string;
}> = {
  critical: { border: 'border-red-400/60',    bg: 'bg-red-50',      dot: 'bg-red-500',    label: 'CRITICAL' },
  warning:  { border: 'border-amber/60',      bg: 'bg-amber-50',    dot: 'bg-amber',      label: 'WARNING'  },
  info:     { border: 'border-cyan/40',       bg: 'bg-cyan/5',      dot: 'bg-cyan',       label: 'INFO'     },
};

function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function Header() {
  const { t }                           = useTranslation();
  const { well, isConnected }           = useDigitalTwinStore();
  const user                            = useAuthStore((s) => s.user);
  const { filtered, unreadCount, markAllRead, markAsRead } = useFilteredNotifications();

  const [now,      setNow]      = useState(new Date());
  const [bellOpen, setBellOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  return (
    <header
      className="
        h-16 w-full bg-white border-b border-stone-200 shadow-sm
        flex items-center justify-between gap-3 px-4
        z-40 relative
      "
    >
      {/* ════ LEFT — field identity ════ */}
      <div className="flex items-center gap-3 min-w-0 flex-shrink">
        <div className="min-w-0">
          <h1 className="text-base font-bold text-stone-900 whitespace-nowrap leading-tight">
            {t('nav.fieldName')}
          </h1>
          <p className="text-xs text-muted whitespace-nowrap leading-tight">
            WELL&nbsp;{well.name}
          </p>
        </div>

        <div className="h-7 w-px bg-stone-200 flex-shrink-0 hidden sm:block" />

        <div className="min-w-0 hidden sm:block">
          <p className="text-xs text-muted truncate whitespace-nowrap leading-tight max-w-[180px]">
            {well.location}
          </p>
          <p className="text-xs font-semibold whitespace-nowrap leading-tight" style={{ color: '#8b5a2b' }}>
            {t('nav.digitalTwin')}&nbsp;●&nbsp;
            {isConnected ? t('nav.online') : t('nav.offline')}
          </p>
        </div>
      </div>

      {/* ════ CENTER — connection + clock ════ */}
      <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          {isConnected
            ? <Wifi    className="w-3.5 h-3.5 text-green flex-shrink-0" />
            : <WifiOff className="w-3.5 h-3.5 text-critical flex-shrink-0" />}
          <span className="text-xs text-muted whitespace-nowrap">
            {t('nav.sensorNetwork')}:&nbsp;
            <span className={`font-semibold ${isConnected ? 'text-green' : 'text-critical'}`}>
              ●&nbsp;{isConnected ? t('nav.connected') : t('nav.disconnected')}
            </span>
          </span>
        </div>

        <div className="h-5 w-px bg-stone-200" />

        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted flex-shrink-0" />
          <span className="text-xs text-muted font-mono whitespace-nowrap">
            {now.toLocaleTimeString()}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted whitespace-nowrap">{t('nav.dataMode')}:</span>
          <span className="text-xs font-bold whitespace-nowrap" style={{ color: '#8b5a2b' }}>{t('nav.simulation')}</span>
        </div>
      </div>

      {/* ════ RIGHT — language, bell, user ════ */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* ── Language switcher ── */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => { setLangOpen((o) => !o); setBellOpen(false); }}
            aria-label={t('nav.language')}
            className="
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
              bg-stone-100 hover:bg-[#8b5a2b]/8 border border-stone-200
              text-xs font-bold whitespace-nowrap
              transition-colors flex-shrink-0
            "
            style={{ color: '#8b5a2b' }}
          >
            <Globe className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{currentLang.label}</span>
          </button>

          {langOpen && (
            <div className="
              absolute right-0 top-[calc(100%+8px)] z-50
              bg-white border border-stone-200 rounded-xl shadow-xl
              min-w-[168px] py-2 overflow-hidden
            ">
              <p className="text-xs text-muted px-3 pb-2 border-b border-stone-100 whitespace-nowrap">
                {t('nav.language')}
              </p>
              {LANGUAGES.map((lang) => {
                const active = i18n.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2
                      text-sm transition-colors whitespace-nowrap
                      ${active
                        ? 'bg-[#8b5a2b]/10 font-bold'
                        : 'text-stone-700 hover:bg-stone-50'}
                    `}
                    style={active ? { color: '#8b5a2b' } : undefined}
                  >
                    <span>{lang.full}</span>
                    <span className="text-xs font-mono opacity-60 ml-4">{lang.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Notification bell ── */}
        <div ref={bellRef} className="relative flex-shrink-0">
          <button
            onClick={() => { setBellOpen((o) => !o); setLangOpen(false); }}
            aria-label={t('nav.notifications')}
            className="relative p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <Bell className={`w-5 h-5 transition-colors ${bellOpen ? '' : 'text-stone-500'}`}
              style={bellOpen ? { color: '#8b5a2b' } : undefined} />
            {unreadCount > 0 && (
              <span className="
                absolute -top-0.5 -right-0.5
                min-w-[18px] h-[18px] px-1
                bg-red-500 rounded-full
                flex items-center justify-center
                text-[10px] font-bold text-white leading-none animate-pulse
              ">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="
              absolute right-0 top-[calc(100%+8px)] z-50
              bg-white border border-stone-200 rounded-xl shadow-xl
              w-80 max-h-[480px] flex flex-col overflow-hidden
            ">
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 flex-shrink-0">
                <span className="text-sm font-bold text-stone-900 whitespace-nowrap">
                  {t('nav.notifications')}
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs bg-red-50 text-red-500 border border-red-200 rounded-full px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      title={t('nav.markAllRead')}
                      className="flex items-center gap-1 text-xs text-muted hover:text-[#8b5a2b] transition-colors whitespace-nowrap"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t('nav.markAllRead')}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setBellOpen(false)}
                    className="text-muted hover:text-cyan transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 divide-y divide-stone-100 scrollbar-hide">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted">
                    <Bell className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm whitespace-nowrap">{t('nav.noAlerts')}</p>
                  </div>
                ) : (
                  filtered.map((alert) => {
                    const style = TYPE_STYLE[alert.type];
                    return (
                      <button
                        key={alert.id}
                        onClick={() => markAsRead(alert.id)}
                        className={`
                          w-full text-left px-4 py-3 transition-colors
                          border-l-2 ${style.border}
                          ${alert.isRead
                            ? 'opacity-50 hover:opacity-70'
                            : `${style.bg} hover:opacity-90`}
                        `}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 min-w-0">
                            {!alert.isRead && (
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${style.dot}`} />
                            )}
                            <p className="text-xs text-stone-800 leading-snug line-clamp-2 min-w-0">
                              {alert.message}
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold flex-shrink-0 whitespace-nowrap
                            ${style.dot.replace('bg-', 'text-')}`}>
                            {style.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] text-muted font-mono">{alert.wellId || 'system'}</span>
                          <span className="text-[10px] text-muted whitespace-nowrap">{relativeTime(alert.timestamp)}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── User badge ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white uppercase"
            style={{ backgroundColor: '#8b5a2b', borderColor: '#6b4420' }}
          >
            {user?.name?.charAt(0) ?? <User className="w-3.5 h-3.5" />}
          </div>
          <span className="text-sm text-stone-700 font-medium hidden md:inline whitespace-nowrap truncate max-w-[140px]">
            {user?.name ?? t('nav.engineer')}
          </span>
        </div>
      </div>
    </header>
  );
}
