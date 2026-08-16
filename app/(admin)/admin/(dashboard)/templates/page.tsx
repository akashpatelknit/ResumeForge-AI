import { getAdminTemplates } from "@/lib/admin/templates";
import { TemplatesTable } from "@/components/admin/TemplatesTable";

export default async function AdminTemplatesPage() {
  const templates = await getAdminTemplates();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Templates</h1>
        <p className="text-sm text-slate-400">
          Metadata only — this manages flags for the templates already defined in config/templates.ts. It cannot
          create new template designs, and the consumer-facing template picker does not read these overrides yet
          (see the code comment on the TemplateMeta model for why); toggling a flag here records the admin&apos;s
          intent but has no live effect until that wiring is added.
        </p>
      </div>
      <TemplatesTable initialTemplates={templates} />
    </div>
  );
}
