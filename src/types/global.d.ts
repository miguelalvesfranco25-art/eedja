// Minimal local ambient typings for React 19 / react-dom / react-icons.
//
// This sandbox has no network access to npm, so the official @types/react
// and @types/react-dom packages cannot be installed. The real `react`,
// `react-dom` and `react-icons` runtime packages ARE present (symlinked into
// node_modules from this machine's global npm cache) and esbuild bundles
// them normally — this file exists purely so `tsc --noEmit` can type-check
// our own application code against a reasonably complete surface of the
// React API. On a machine with normal npm access, installing
// @types/react / @types/react-dom would supersede this file automatically
// (delete it once that happens).

declare module "react" {
  // --- core types -----------------------------------------------------
  export type Key = string | number;
  export interface ReactPortal {
    key: Key | null;
    children: ReactNode;
  }
  export type ReactChild = ReactElement | string | number;
  export type ReactFragment = Iterable<ReactNode>;
  export type ReactNode =
    | ReactChild
    | ReactFragment
    | ReactPortal
    | boolean
    | null
    | undefined;

  export interface ReactElement<P = any> {
    type: any;
    props: P;
    key: Key | null;
  }

  export type JSXElementConstructor<P> =
    | ((props: P) => ReactElement<any> | null)
    | (new (props: P) => any);

  export interface Attributes {
    key?: Key | null;
  }
  export type ComponentType<P = {}> = (props: P) => ReactNode;
  export type ElementType = any;
  export type FunctionComponent<P = {}> = (props: P & { children?: ReactNode }) => ReactNode;
  export type FC<P = {}> = FunctionComponent<P>;
  export type PropsWithChildren<P = unknown> = P & { children?: ReactNode };
  export type NamedExoticComponent<P = {}> = FunctionComponent<P>;
  export type ForwardRefExoticComponent<P> = FunctionComponent<P>;

  // --- refs -------------------------------------------------------------
  export interface RefObject<T> {
    readonly current: T | null;
  }
  export interface MutableRefObject<T> {
    current: T;
  }
  export type Ref<T> = RefObject<T> | ((instance: T | null) => void) | null;
  export type LegacyRef<T> = Ref<T>;

  // --- state / effect hooks ----------------------------------------------
  export type Dispatch<A> = (value: A) => void;
  export type SetStateAction<S> = S | ((prevState: S) => S);
  export function useState<S>(
    initialState: S | (() => S)
  ): [S, Dispatch<SetStateAction<S>>];
  export function useState<S = undefined>(): [
    S | undefined,
    Dispatch<SetStateAction<S | undefined>>
  ];

  export type EffectCallback = () => void | (() => void);
  export type DependencyList = ReadonlyArray<unknown>;
  export function useEffect(effect: EffectCallback, deps?: DependencyList): void;
  export function useLayoutEffect(
    effect: EffectCallback,
    deps?: DependencyList
  ): void;

  export function useMemo<T>(factory: () => T, deps: DependencyList): T;
  export function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: DependencyList
  ): T;

  export function useRef<T>(initialValue: T): MutableRefObject<T>;
  export function useRef<T>(initialValue: T | null): RefObject<T>;
  export function useRef<T = undefined>(): MutableRefObject<T | undefined>;

  export interface Context<T> {
    Provider: FC<{ value: T; children?: ReactNode }>;
    Consumer: FC<{ children: (value: T) => ReactNode }>;
    displayName?: string;
  }
  export function createContext<T>(defaultValue: T): Context<T>;
  export function useContext<T>(context: Context<T>): T;

  export type Reducer<S, A> = (prevState: S, action: A) => S;
  export function useReducer<S, A>(
    reducer: Reducer<S, A>,
    initialState: S
  ): [S, Dispatch<A>];

  export function useId(): string;

  export function memo<P extends object>(
    component: FC<P>
  ): FC<P>;
  export function forwardRef<T, P = {}>(
    render: (props: P, ref: Ref<T>) => ReactElement | null
  ): FC<P & { ref?: Ref<T> }>;

  export function createElement(
    type: any,
    props?: any,
    ...children: ReactNode[]
  ): ReactElement;

  export const Fragment: FC<{ children?: ReactNode }>;
  export const StrictMode: FC<{ children?: ReactNode }>;

  // --- class components (usado apenas para Error Boundaries) -----------
  export class Component<P = {}, S = {}> {
    constructor(props: P);
    props: Readonly<P> & Readonly<{ children?: ReactNode }>;
    state: Readonly<S>;
    setState(update: Partial<S> | ((prevState: Readonly<S>) => Partial<S>)): void;
    render(): ReactNode;
  }

  // --- DOM event / attribute types ---------------------------------------
  export interface CSSProperties {
    [key: string]: string | number | undefined;
  }

  export interface SyntheticEvent<T = Element> {
    currentTarget: T;
    target: EventTarget & T;
    preventDefault(): void;
    stopPropagation(): void;
  }
  export interface FormEvent<T = Element> extends SyntheticEvent<T> {}
  export interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T;
  }
  export interface MouseEvent<T = Element> extends SyntheticEvent<T> {
    clientX: number;
    clientY: number;
  }
  export interface KeyboardEvent<T = Element> extends SyntheticEvent<T> {
    key: string;
    code: string;
  }
  export interface FocusEvent<T = Element> extends SyntheticEvent<T> {}

  export interface DOMAttributes<T> {
    children?: ReactNode;
    onClick?: (event: MouseEvent<T>) => void;
    onChange?: (event: ChangeEvent<T>) => void;
    onInput?: (event: FormEvent<T>) => void;
    onSubmit?: (event: FormEvent<T>) => void;
    onFocus?: (event: FocusEvent<T>) => void;
    onBlur?: (event: FocusEvent<T>) => void;
    onKeyDown?: (event: KeyboardEvent<T>) => void;
    onKeyUp?: (event: KeyboardEvent<T>) => void;
    [handler: string]: any;
  }

  export interface AriaAttributes {
    [ariaAttribute: string]: any;
  }

  export interface HTMLAttributes<T> extends DOMAttributes<T>, AriaAttributes {
    className?: string;
    id?: string;
    style?: CSSProperties;
    title?: string;
    role?: string;
    tabIndex?: number;
    [key: string]: any;
  }
  export interface SVGAttributes<T> extends DOMAttributes<T>, AriaAttributes {
    [key: string]: any;
  }
  export interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
    href?: string;
    target?: string;
    rel?: string;
  }
  export interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
  }
  export interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: string;
    value?: string | number;
    checked?: boolean;
    placeholder?: string;
    disabled?: boolean;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    name?: string;
  }
  export interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string;
    rows?: number;
    placeholder?: string;
  }
  export interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | number;
  }
  export interface OptionHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | number;
  }
  export interface FormHTMLAttributes<T> extends HTMLAttributes<T> {}
  export interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
    htmlFor?: string;
  }

  namespace JSX {
    type Element = any;
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface ElementChildrenAttribute {
      children: {};
    }
    type LibraryManagedAttributes<C, P> = P & { key?: Key | null };
  }

  const React: {
    Fragment: typeof Fragment;
    StrictMode: typeof StrictMode;
    createElement: typeof createElement;
    useState: typeof useState;
    useEffect: typeof useEffect;
    useRef: typeof useRef;
    useMemo: typeof useMemo;
    useCallback: typeof useCallback;
    useContext: typeof useContext;
    createContext: typeof createContext;
  };
  export default React;
}

declare module "react/jsx-runtime" {
  export const Fragment: unique symbol;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
}

declare module "react-dom/client" {
  import type { ReactNode } from "react";
  export interface Root {
    render(children: ReactNode): void;
    unmount(): void;
  }
  export function createRoot(container: Element | DocumentFragment): Root;
}

declare module "react-icons/lib" {
  import type { SVGAttributes, ReactNode } from "react";
  export interface IconBaseProps extends SVGAttributes<SVGElement> {
    children?: ReactNode;
    size?: string | number;
    color?: string;
    title?: string;
  }
  export type IconType = (props: IconBaseProps) => JSX.Element;
}

declare module "react-icons/*" {
  import type { IconType } from "react-icons/lib";
  const icons: { [key: string]: IconType };
  export = icons;
}

// Global JSX fallback (used by some TS resolution paths regardless of the
// configured jsx import source).
declare namespace JSX {
  type Element = any;
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  type LibraryManagedAttributes<C, P> = P & { key?: import("react").Key | null };
}

declare module "*.svg" {
  const src: string;
  export default src;
}
declare module "*.png" {
  const src: string;
  export default src;
}
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
