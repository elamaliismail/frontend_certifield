import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderHeart,
  FileUp,
  CheckSquare,
  PenTool,
  Search,
  ShieldCheck,
  ScrollText,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import certifieldLogo from "../assets/certifield-logo.png";

interface NavEntry {
  label: string;
  path: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavEntry[] = [
  { label: "Tableau de bord", path: "/app/dashboard", icon: LayoutDashboard },
  { label: "Patients", path: "/app/patients", icon: Users },
  { label: "Dossiers médicaux", path: "/app/dossiers", icon: FolderHeart },
  { label: "Documents", path: "/app/documents", icon: FileUp },
  { label: "Validation", path: "/app/validation", icon: CheckSquare },
  { label: "Signature", path: "/app/signature", icon: PenTool },
  { label: "Recherche", path: "/app/recherche", icon: Search },
];

const ADMIN_NAV_ITEMS: NavEntry[] = [
  { label: "Utilisateurs", path: "/app/utilisateurs", icon: ShieldCheck },
  { label: "Audit", path: "/app/audit", icon: ScrollText },
];

function NavItem({ label, path, icon: Icon }: NavEntry) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        [
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-gradient-to-r from-hc-primary to-hc-secondary text-white shadow-lg shadow-hc-primary/25"
            : "text-slate-300 hover:bg-white/5 hover:text-white",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-white/80" />
          )}
          <Icon
            size={18}
            strokeWidth={2}
            className={isActive ? "" : "text-slate-400 group-hover:text-white"}
          />
          {label}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const { logout, user } = useAuth();
  const isAdmin = user?.role === "Administrateur";

  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/5 bg-gradient-to-b from-navy-900 via-navy-900 to-navy-800 text-slate-300">
      <div className="flex items-center gap-3 px-5 py-6">
        <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-sm ring-1 ring-white/20">
          <img
            src={certifieldLogo}
            alt=""
            className="h-full w-full object-contain"
          />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight text-white">
            Certifield
          </div>
          <div className="text-xs tracking-wide text-slate-400">
            Dossier Patient Numérique
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Espace clinique
        </p>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}

        {isAdmin && (
          <>
            <p className="px-3 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Administration
            </p>
            {ADMIN_NAV_ITEMS.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-white/5 px-3 py-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} strokeWidth={2} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
