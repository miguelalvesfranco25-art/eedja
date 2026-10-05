// Pub-sub simples para notificar componentes quando os dados persistidos
// (LocalStorage) mudam, já que não usamos uma lib de estado global.
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyDataChanged(): void {
  listeners.forEach((l) => l());
}
