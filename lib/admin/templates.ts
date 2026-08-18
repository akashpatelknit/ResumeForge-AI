import "server-only";
import { prisma } from "@/lib/prisma";
import { sampleTemplates } from "@/config/templates";

export interface AdminTemplateRow {
  templateId: string;
  name: string;
  description: string;
  thumbnail: string;
  comingSoon: boolean;
  isPro: boolean;
  isActive: boolean;
  isFeatured: boolean;
  usageCount: number;
}

// Merges the static template registry (config/templates.ts — the source of
// truth for which templates exist) with the admin-editable overlay
// (TemplateMeta) and real usage counts (resumes actually saved against
// that templateId — "coming soon" entries can never appear here since
// users can't select them). A template with no TemplateMeta row yet just
// falls back to the registry's own isPremium flag and sensible defaults,
// so nothing needs seeding up front.
export async function getAdminTemplates(): Promise<AdminTemplateRow[]> {
  const [metaRows, usageRows] = await Promise.all([
    prisma.templateMeta.findMany(),
    prisma.resume.groupBy({ by: ["templateId"], _count: { _all: true } }),
  ]);
  const metaByTemplateId = new Map(metaRows.map((m) => [m.templateId, m]));
  const usageByTemplateId = new Map(usageRows.map((r) => [r.templateId, r._count._all]));

  return sampleTemplates.map((template) => {
    const meta = metaByTemplateId.get(template.id);
    return {
      templateId: template.id,
      name: template.name,
      description: template.description,
      thumbnail: template.thumbnail,
      comingSoon: !!template.comingSoon,
      isPro: meta?.isPro ?? template.isPremium,
      isActive: meta?.isActive ?? true,
      isFeatured: meta?.isFeatured ?? false,
      usageCount: usageByTemplateId.get(template.id) ?? 0,
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
