import { ArrowUp, BadgeCheck, Brain, ChevronRight, Code2, FolderCode, Layers, Mail, Menu, MessageSquare, PanelLeft, Plus, UserRound, X } from "lucide-react";

const ICONES = { arrow: ArrowUp, verified: BadgeCheck, brain: Brain, chevron: ChevronRight, code: Code2, project: FolderCode, layers: Layers, fileplus: Mail, mail: Mail, menu: Menu, chat: MessageSquare, panel: PanelLeft, plus: Plus, person: UserRound, close: X };

export default function Icon({ nome, ...props }) {
  const Componente = ICONES[nome] || MessageSquare;
  return <Componente size={20} strokeWidth={1.7} aria-hidden="true" {...props} />;
}
