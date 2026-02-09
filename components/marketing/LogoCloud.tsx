const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "Spotify",
  "Airbnb",
];

const LogoCloud = () => (
  <section className="border-y py-12">
    <div className="container mx-auto px-4 lg:px-6">
      <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
        Trusted by professionals at
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {companies.map((name) => (
          <span
            key={name}
            className="text-lg font-bold text-muted-foreground/40 transition-colors duration-300 hover:text-foreground select-none"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  </section>
);

export default LogoCloud;
