import { FileCheck, Target, Zap, Star } from "lucide-react";

const stats = [
  { icon: FileCheck, value: "10,000+", label: "Resumes Created" },
  { icon: Target, value: "95%", label: "ATS Pass Rate" },
  { icon: Zap, value: "3x", label: "Faster Than Traditional" },
  { icon: Star, value: "4.9★", label: "Average Rating" },
];

const Stats = () => (
  <section className="relative overflow-hidden py-20 lg:py-24 bg-gradient-hero text-white">
    {/* Decorative */}
    <div
      className="pointer-events-none absolute inset-0 opacity-10"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      }}
    />

    <div className="container relative mx-auto px-4 lg:px-6">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center gap-2 text-center"
          >
            <s.icon className="mb-1 h-7 w-7 text-white/80" />
            <span className="text-3xl font-extrabold md:text-4xl">
              {s.value}
            </span>
            <span className="text-sm text-white/70">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Stats;
