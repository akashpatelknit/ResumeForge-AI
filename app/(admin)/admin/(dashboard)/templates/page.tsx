import { getAdminTemplates } from "@/lib/admin/templates";
import { TemplatesTable } from "@/components/admin/TemplatesTable";
import { AddTemplateButton } from "@/components/admin/AddTemplateButton";

export default async function AdminTemplatesPage() {
  const templates = await getAdminTemplates();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-[28px]">Templates</h1>
          <p className="mt-1 text-sm text-gray-500">Manage resume templates available to users.</p>
        </div>
        <AddTemplateButton />
      </div>

      <TemplatesTable initialTemplates={templates} />

      <p className="text-xs text-gray-400">
        Metadata only — this manages flags for the templates already defined in config/templates.ts. It cannot
        create new template designs, and the consumer-facing template picker does not read these overrides yet (see
        the code comment on the TemplateMeta model for why); toggling a flag here records the admin&apos;s intent
        but has no live effect until that wiring is added.
      </p>
    </div>
  );
}
