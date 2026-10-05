import { NavLink } from "../../lib/router";
import { NAV_ITEMS } from "./nav";

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Navegação principal">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark" aria-hidden="true">E</span>
        EEDJA
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className="sidebar-link" activeClassName="active">
              <Icon size={19} aria-hidden="true" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="sidebar-footer">E.E. Dr. José Augusto — Entre Folhas, MG</div>
    </aside>
  );
}
