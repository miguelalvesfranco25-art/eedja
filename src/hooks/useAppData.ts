import { useEffect, useState } from "react";
import { subscribe } from "../lib/dataBus";
import * as storage from "../lib/storage";

/** Força um re-render sempre que qualquer dado do storage mudar. */
export function useDataVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => subscribe(() => setVersion((v) => v + 1)), []);
  return version;
}

export function useStudent() {
  const version = useDataVersion();
  const [student, setStudent] = useState(() => storage.getStudent());
  useEffect(() => {
    setStudent(storage.getStudent());
  }, [version]);
  return student;
}

export function useMaterials() {
  const version = useDataVersion();
  const [materials, setMaterials] = useState(() => storage.getMaterials());
  useEffect(() => {
    setMaterials(storage.getMaterials());
  }, [version]);
  return materials;
}

export function useAttempts() {
  const version = useDataVersion();
  const [attempts, setAttempts] = useState(() => storage.getAttempts());
  useEffect(() => {
    setAttempts(storage.getAttempts());
  }, [version]);
  return attempts;
}
