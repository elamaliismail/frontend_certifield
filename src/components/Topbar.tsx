import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronDown, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDocumentsFeed } from "../context/DocumentsContext";
import {
  buildActivityFeed,
  formatRelativeTime,
  type ActivityEvent,
} from "../lib/activity";
import { Avatar } from "./ui/Avatar";

const UNREAD_WINDOW_MS = 24 * 60 * 60 * 1000;

const panelMotion = {
  initial: { opacity: 0, y: -8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
  transition: { duration: 0.15, ease: "easeOut" as const },
};

export function Topbar({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { documents } = useDocumentsFeed();
  const [openPanel, setOpenPanel] = useState<"notifications" | "user" | null>(
    null,
  );

  const activity = useMemo(() => buildActivityFeed(documents), [documents]);

  const unreadCount = activity.filter(
    (event) =>
      Date.now() - new Date(event.timestamp).getTime() < UNREAD_WINDOW_MS,
  ).length;

  function goToEvent(event: ActivityEvent) {
    setOpenPanel(null);
    navigate(`/app/dossiers/${event.patientId}/documents/${event.documentId}`);
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-8 py-4 backdrop-blur-md">
      <h1 className="text-xl font-semibold tracking-tight text-ink-900">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() =>
              setOpenPanel((prev) =>
                prev === "notifications" ? null : "notifications",
              )
            }
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-hc-bg"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gradient-to-r from-hc-primary to-hc-secondary px-1 text-[10px] font-semibold text-white ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {openPanel === "notifications" && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenPanel(null)}
                />
                <motion.div
                  {...panelMotion}
                  className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-300/40 backdrop-blur"
                >
                  <h3 className="text-sm font-semibold text-ink-900">
                    Notifications
                  </h3>
                  <div className="mt-3 max-h-80 space-y-1 overflow-y-auto">
                    {activity.length === 0 && (
                      <p className="text-sm text-ink-400">
                        Aucune activité récente.
                      </p>
                    )}
                    {activity.slice(0, 8).map((event) => (
                      <button
                        key={event.id}
                        onClick={() => goToEvent(event)}
                        className="block w-full rounded-xl border-l-2 border-hc-primary/30 px-3 py-2 text-left transition-colors hover:border-hc-primary hover:bg-hc-bg"
                      >
                        <div className="text-sm font-semibold text-ink-900">
                          {event.title}
                        </div>
                        <div className="mt-0.5 text-xs text-ink-600">
                          {event.detail}
                        </div>
                        <div className="mt-1 text-[11px] text-ink-400">
                          {formatRelativeTime(event.timestamp)}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() =>
              setOpenPanel((prev) => (prev === "user" ? null : "user"))
            }
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-hc-bg"
          >
            <Avatar name={user?.name ?? "?"} />
            <div className="hidden text-left leading-tight sm:block">
              <div className="text-sm font-semibold text-ink-900">
                {user?.name}
              </div>
              <div className="text-xs text-ink-400">{user?.role}</div>
            </div>
            <ChevronDown size={16} className="text-ink-400" />
          </button>

          <AnimatePresence>
            {openPanel === "user" && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenPanel(null)}
                />
                <motion.div
                  {...panelMotion}
                  className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-xl shadow-slate-300/40 backdrop-blur"
                >
                  <div className="flex items-center gap-3 bg-gradient-to-br from-hc-primary to-hc-secondary px-4 py-4 text-white">
                    <Avatar
                      name={user?.name ?? "?"}
                      className="bg-white/20 shadow-none ring-1 ring-white/40"
                    />
                    <div className="min-w-0 leading-tight">
                      <div className="truncate text-sm font-semibold">
                        {user?.name}
                      </div>
                      <div className="truncate text-xs text-white/80">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs text-ink-400">
                      <ShieldCheck size={14} />
                      Rôle : {user?.role}
                    </div>
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-status-red-bg hover:text-status-red-fg"
                    >
                      <LogOut size={16} />
                      Déconnexion
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
