import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardProgressProps {
  steps: string[];
  currentStep: number;
}

export default function WizardProgress({ steps, currentStep }: WizardProgressProps) {
  const percent = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-3 flex items-center justify-between">
        {steps.map((label, i) => {
          const isDone = i < currentStep;
          const isCurrent = i === currentStep;
          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors duration-300",
                  isDone && "bg-gradient-hero text-white",
                  isCurrent && "bg-gradient-hero text-white ring-4 ring-purple-500/15",
                  !isDone && !isCurrent && "bg-muted text-muted-foreground",
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isDone ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </motion.span>
                  ) : (
                    <span key="number">{i + 1}</span>
                  )}
                </AnimatePresence>
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium transition-colors sm:block",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
        <motion.div
          className="h-full rounded-full bg-gradient-hero"
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 28 }}
        />
      </div>
    </div>
  );
}
