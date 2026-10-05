import type { IconType } from "react-icons/lib";
import {
  LuBookA,
  LuCalculator,
  LuFlaskConical,
  LuLandmark,
  LuGlobe,
  LuPalette,
  LuDumbbell,
  LuLanguages,
  LuAtom,
  LuDna,
  LuBrain,
  LuUsers,
  LuChurch,
  LuBookOpenText,
  LuBookOpen,
} from "react-icons/lu";

// Mapeia o nome da matéria a um ícone — só estética, cai em LuBookOpen por padrão.
const RULES: Array<[RegExp, IconType]> = [
  [/portuguesa/i, LuBookA],
  [/literatura/i, LuBookOpenText],
  [/matemática/i, LuCalculator],
  [/química/i, LuFlaskConical],
  [/ciências/i, LuFlaskConical],
  [/física/i, LuAtom],
  [/biologia/i, LuDna],
  [/história/i, LuLandmark],
  [/geografia/i, LuGlobe],
  [/arte/i, LuPalette],
  [/educação física/i, LuDumbbell],
  [/inglês|espanhol/i, LuLanguages],
  [/filosofia/i, LuBrain],
  [/sociologia/i, LuUsers],
  [/religioso/i, LuChurch],
];

export function iconForSubject(subjectName: string): IconType {
  const match = RULES.find(([pattern]) => pattern.test(subjectName));
  return match ? match[1] : LuBookOpen;
}
