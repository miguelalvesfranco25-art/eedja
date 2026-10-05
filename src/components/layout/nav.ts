import { LuHouse, LuBookOpen, LuCamera, LuTrendingUp, LuUser } from "react-icons/lu";
import type { IconType } from "react-icons/lib";

export interface NavItem {
  to: string;
  label: string;
  icon: IconType;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Início", icon: LuHouse },
  { to: "/subjects", label: "Matérias", icon: LuBookOpen },
  { to: "/capture", label: "Nova captura", icon: LuCamera },
  { to: "/performance", label: "Minhas notas", icon: LuTrendingUp },
  { to: "/profile", label: "Perfil", icon: LuUser },
];

export const MOBILE_NAV_ITEMS: NavItem[] = NAV_ITEMS;
