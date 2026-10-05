import { NavLink } from "../../lib/router";
import { MOBILE_NAV_ITEMS } from "./nav";

export function BottomNavigation() {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink key={item.to} to={item.to} className="bottom-nav-link" activeClassName="active">
            <Icon size={20} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
