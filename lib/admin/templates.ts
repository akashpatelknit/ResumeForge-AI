import "server-only";
import { prisma } from "@/lib/prisma";
import { sampleTemplates } from "@/config/templates";

export interface AdminTemplateRow {
  templateId: string;
  name: string;
  description: string;
  comingSoon: boolean;
  isPro: boolean;
  isActive: boolean;
  isFeatured: boolean;
}

// Merges the static template registry (config/templates.ts — the source of
// truth for which templates exist) with the admin-editable overlay
// (TemplateMeta). A template with no TemplateMeta row yet just falls back
// to the registry's own isPremium flag and sensible defaults, so nothing
// needs seeding up front.
export async function getAdminTemplates(): Promise<AdminTemplateRow[]> {
  const metaRows = await prisma.templateMeta.findMany();
  const metaByTemplateId = new Map(metaRows.map((m) => [m.templateId, m]));

  return sampleTemplates.map((template) => {
    const meta = metaByTemplateId.get(template.id);
    return {
      templateId: template.id,
      name: template.name,
      description: template.description,
      comingSoon: !!template.comingSoon,
      isPro: meta?.isPro ?? template.isPremium,
      isActive: meta?.isActive ?? true,
      isFeatured: meta?.isFeatured ?? false,
    };
  });
}

export interface TemplateMetaUpdateInput {
  isPro?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
}

export async function updateTemplateMeta(templateId: string, data: TemplateMetaUpdateInput) {
  return prisma.templateMeta.upsert({
    where: { templateId },
    create: { templateId, ...data },
    update: data,
  });
}
