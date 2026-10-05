// Roteador client-side minimalista (sem dependências externas), cobrindo
// apenas o que o MassUp precisa: navegação por pushState, rotas com
// parâmetros (":id"), redirecionamento e leitura da rota atual.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";

interface LocationState {
  pathname: string;
}

interface RouterContextValue {
  pathname: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);
const ParamsContext = createContext<Record<string, string>>({});

export function RouterProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationState>({
    pathname: window.location.pathname || "/",
  });

  useEffect(() => {
    const onPopState = () => setLocation({ pathname: window.location.pathname });
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      window.history.replaceState({}, "", to);
    } else {
      window.history.pushState({}, "", to);
    }
    setLocation({ pathname: to.split("?")[0] });
    window.scrollTo({ top: 0 });
  }, []);

  const value = useMemo(() => ({ pathname: location.pathname, navigate }), [location.pathname, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

function useRouterContext(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useLocation/useNavigate precisam estar dentro de <RouterProvider>.");
  return ctx;
}

export function useLocation(): LocationState {
  const { pathname } = useRouterContext();
  return { pathname };
}

export function useNavigate() {
  const { navigate } = useRouterContext();
  return navigate;
}

export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  return useContext(ParamsContext) as T;
}

interface RouteProps {
  path: string;
  element: ReactNode;
}
export function Route(_props: RouteProps): null {
  return null;
}

function matchPath(pattern: string, pathname: string): Record<string, string> | null {
  if (pattern === "*") return {};
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const pp = patternParts[i];
    const actual = decodeURIComponent(pathParts[i]);
    if (pp.startsWith(":")) {
      params[pp.slice(1)] = actual;
    } else if (pp !== actual) {
      return null;
    }
  }
  return params;
}

export function Routes({ children }: { children: ReactNode }) {
  const { pathname } = useRouterContext();
  const items = (Array.isArray(children) ? children : [children]) as unknown as Array<{
    props: RouteProps;
  } | null>;

  for (const child of items) {
    if (!child || !child.props) continue;
    const { path, element } = child.props;
    const params = matchPath(path, pathname === "" ? "/" : pathname);
    if (params) {
      return <ParamsContext.Provider value={params}>{element}</ParamsContext.Provider>;
    }
  }
  return null;
}

interface LinkProps {
  to: string;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  replace?: boolean;
  [key: string]: unknown;
}
export function Link({ to, className, children, onClick, replace, ...rest }: LinkProps) {
  const navigate = useNavigate();
  return (
    <a
      href={to}
      className={className}
      onClick={(e: ReactMouseEvent) => {
        e.preventDefault();
        onClick?.();
        navigate(to, { replace });
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

interface NavLinkProps extends LinkProps {
  activeClassName?: string;
  end?: boolean;
}
export function NavLink({ to, className = "", activeClassName = "", end, children, ...rest }: NavLinkProps) {
  const { pathname } = useLocation();
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(to + "/");
  const combined = [className, isActive ? activeClassName : ""].filter(Boolean).join(" ");
  return (
    <Link to={to} className={combined} {...rest}>
      {children}
    </Link>
  );
}

export function Navigate({ to, replace = true }: { to: string; replace?: boolean }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);
  return null;
}
