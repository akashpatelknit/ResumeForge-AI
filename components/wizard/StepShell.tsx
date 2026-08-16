interface StepShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

// Pure layout — the enter/exit motion for step changes lives one level up,
// in app/(marketing)/create/page.tsx, where it can be direction-aware
// (slide left when advancing, right when going back). Keeping that motion
// out of this component means it doesn't fight with the AnimatePresence
// wrapper keyed on step index.
export default function StepShell({ title, description, children }: StepShellProps) {
  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
