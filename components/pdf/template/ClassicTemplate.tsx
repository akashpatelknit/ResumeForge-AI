import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import { Fragment } from "react";
import { AppResume } from "@/types/resume";
import { getEffectiveSectionOrder, type SectionKey } from "@/lib/resumeSections";
import {
  PAPER_SIZE_MAP,
  PDF_BOLD_FONT_MAP,
  type ResumeStyleConfig,
} from "@/types/styleConfig";
import { formatResumeDate } from "@/lib/pdf/formatResumeDate";

/**
 * ClassicTemplate — centered header, no-bullet skills list, single-line
 * subheadings (company/dates, then role/location). Distinct from
 * ModernTemplate's structure (which is a port of a specific LaTeX
 * template) rather than a restyle of it — see components/pdf/template/index.tsx
 * for how templates plug in, and ModernTemplate.tsx for why styles are
 * built per-render instead of a fixed StyleSheet.
 */
function buildStyles(sc: ResumeStyleConfig) {
  const headScale = sc.headingSizePct / 100;
  const bodyScale = sc.bodySizePct / 100;
  const lineScale = sc.lineSpacingPct / 100;
  const boldPrimary = PDF_BOLD_FONT_MAP[sc.primaryFont];
  const accent = sc.accentColor;
  const topBottomPt = sc.margins.topBottom * 72;
  const B = 10 * bodyScale;

  return StyleSheet.create({
    page: {
      paddingTop: topBottomPt,
      paddingBottom: topBottomPt,
      paddingLeft: 40,
      paddingRight: 40,
      fontSize: B,
      fontFamily: sc.secondaryFont,
      lineHeight: 1.25 * lineScale,
      backgroundColor: "#ffffff",
    },

    // ── Header — centered name + single contact line ──────────────────────
    // name is wrapped in its own block (headerBlock) rather than sitting as
    // a bare <Text> directly under <Page> — a large-fontSize Text as the
    // very first child, sibling to a <View>, doesn't reliably get its own
    // row in react-pdf's Yoga layout (the contact row rendered on top of
    // it instead of below).
    headerBlock: {
      width: "100%",
    },
    name: {
      fontSize: 26 * headScale,
      lineHeight: 1.2 * lineScale,
      fontFamily: boldPrimary,
      textAlign: "center",
      marginBottom: 4,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
    },
    contactText: {
      fontSize: B - 1,
      lineHeight: 1.2 * lineScale,
      color: "#333333",
    },
    contactLink: {
      fontSize: B - 1,
      lineHeight: 1.2 * lineScale,
      color: "#333333",
      textDecoration: "none",
    },
    contactSeparator: {
      fontSize: B - 1,
      lineHeight: 1.2 * lineScale,
      color: "#999999",
      marginHorizontal: 5,
    },

    // ── Section title ───────────────────────────────────────────────────
    sectionTitle: {
      fontSize: 12 * headScale,
      fontFamily: boldPrimary,
      textTransform: "uppercase",
      letterSpacing: 0.75,
      color: accent,
      marginTop: sc.margins.betweenSections,
      marginBottom: sc.margins.betweenTitlesAndContent,
      paddingBottom: 2,
      borderBottomWidth: 1,
      borderBottomColor: accent,
    },

    // ── Experience / Education subheading ──────────────────────────────
    entry: {
      marginTop: sc.margins.betweenContentBlocks,
    },
    entryTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    entryBotRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 3,
    },
    entryTitleBold: {
      fontSize: B,
      fontFamily: boldPrimary,
    },
    entryDate: {
      fontSize: B,
    },
    entrySubtitleItalic: {
      fontSize: B,
      fontStyle: "italic",
    },
    entryLocationItalic: {
      fontSize: B,
      fontStyle: "italic",
    },

    // ── Bullets ─────────────────────────────────────────────────────────
    bulletRow: {
      flexDirection: "row",
      marginTop: 2,
      alignItems: "flex-start",
    },
    bulletMark: {
      fontSize: B,
      width: 12,
      lineHeight: 1.35 * lineScale,
    },
    bulletText: {
      fontSize: B,
      flex: 1,
      lineHeight: 1.35 * lineScale,
      textAlign: "justify",
    },
    bulletBold: {
      fontFamily: boldPrimary,
    },
    bulletLink: {
      color: accent,
      textDecoration: "underline",
    },

    // ── Projects — bold name, no separate metadata row ─────────────────
    projectNameRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
    },
    projectName: {
      fontSize: B,
      fontFamily: boldPrimary,
    },
    projectLink: {
      fontSize: B,
      color: accent,
      textDecoration: "none",
      marginLeft: 4,
    },

    // ── Skills — "Category : comma, separated, list" per line ──────────
    // A single Text wraps both spans below (see renderSkills) rather than
    // two sibling Text blocks in a flex row — react-pdf wraps flex-row
    // siblings as whole blocks, so a long item list would jump to its own
    // line instead of flowing right after the label. Nesting them in one
    // Text makes react-pdf treat it as one word-wrapping run, same pattern
    // ModernTemplate uses for its skills list.
    skillRow: {
      marginTop: 2,
    },
    skillCategory: {
      fontSize: B,
      fontFamily: boldPrimary,
    },
    skillItems: {
      fontSize: B,
    },

    summaryText: {
      fontSize: B,
      lineHeight: 1.4 * lineScale,
      textAlign: "justify",
    },
  });
}

type Styles = ReturnType<typeof buildStyles>;

// ── Section renderers ───────────────────────────────────────────────────
function renderSummary(resume: AppResume, styles: Styles) {
  if (!resume.summary) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>Summary</Text>
      <Text style={styles.summaryText}>{resume.summary}</Text>
    </View>
  );
}

function renderExperience(resume: AppResume, styles: Styles) {
  if ((resume.experience ?? []).length === 0) return null;
  const { dateFormat } = resume.styleConfig;
  return (
    <View>
      <Text style={styles.sectionTitle}>Experience</Text>
      {(resume.experience ?? []).map((exp, idx) => (
        <View key={idx} style={styles.entry}>
          <View style={styles.entryTopRow}>
            <Text style={styles.entryTitleBold}>{exp.company}</Text>
            <Text style={styles.entryDate}>
              {formatResumeDate(exp.startDate, dateFormat)} –{" "}
              {formatResumeDate(exp.endDate, dateFormat)}
            </Text>
          </View>
          <View style={styles.entryBotRow}>
            <Text style={styles.entrySubtitleItalic}>{exp.position}</Text>
            <Text style={styles.entryLocationItalic}>{exp.location}</Text>
          </View>
          {(exp.achievements ?? []).map((achievement, i) => {
            const text = typeof achievement === "string" ? achievement : String(achievement ?? "");
            return (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletMark}>•</Text>
                <Text style={styles.bulletText}>{text}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function renderProjects(resume: AppResume, styles: Styles) {
  if ((resume.projects ?? []).length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>Projects</Text>
      {(resume.projects ?? []).map((project, idx) => (
        <View key={idx} style={styles.entry}>
          <View style={styles.projectNameRow}>
            <Text style={styles.projectName}>{project.name}</Text>
            {project.github && (
              <Link src={project.github} style={styles.projectLink}>
                GitHub
              </Link>
            )}
            {project.link && (
              <Link src={project.link} style={styles.projectLink}>
                Live
              </Link>
            )}
          </View>
          {project.description && (
            <View style={styles.bulletRow}>
              <Text style={styles.bulletMark}>•</Text>
              <Text style={styles.bulletText}>{project.description}</Text>
            </View>
          )}
          {(project.highlights ?? []).map((highlight, i) => {
            const text = typeof highlight === "string" ? highlight : String(highlight ?? "");
            return (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletMark}>•</Text>
                <Text style={styles.bulletText}>{text}</Text>
              </View>
            );
          })}
          {(project.technologies ?? []).length > 0 && (
            <View style={styles.bulletRow}>
              <Text style={styles.bulletMark}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bulletBold}>Tech: </Text>
                {(project.technologies ?? []).join(", ")}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function renderEducation(resume: AppResume, styles: Styles) {
  if ((resume.education ?? []).length === 0) return null;
  const { dateFormat } = resume.styleConfig;
  return (
    <View>
      <Text style={styles.sectionTitle}>Education</Text>
      {(resume.education ?? []).map((edu, idx) => (
        <View key={idx} style={styles.entry}>
          <View style={styles.entryTopRow}>
            <Text style={styles.entryTitleBold}>{edu.institution}</Text>
            <Text style={styles.entryDate}>
              {formatResumeDate(edu.startDate, dateFormat)} –{" "}
              {formatResumeDate(edu.endDate, dateFormat)}
            </Text>
          </View>
          <View style={styles.entryBotRow}>
            <Text style={styles.entrySubtitleItalic}>
              {edu.degree}
              {edu.field ? ` in ${edu.field}` : ""}
            </Text>
            <Text style={styles.entryLocationItalic}>{edu.location}</Text>
          </View>
          {edu.gpa && (
            <View style={styles.bulletRow}>
              <Text style={styles.bulletMark}>•</Text>
              <Text style={styles.bulletText}>GPA: {edu.gpa}</Text>
            </View>
          )}
          {(edu.achievements ?? []).map((achievement, i) => {
            const text = typeof achievement === "string" ? achievement : String(achievement ?? "");
            return (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletMark}>•</Text>
                <Text style={styles.bulletText}>{text}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function renderSkills(resume: AppResume, styles: Styles) {
  if ((resume.skills ?? []).length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>Skills</Text>
      {(resume.skills ?? []).map((skill, idx) => (
        <View key={idx} style={styles.skillRow}>
          <Text>
            <Text style={styles.skillCategory}>{skill.category}: </Text>
            <Text style={styles.skillItems}>{(skill.items ?? []).join(", ")}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

function renderAchievements(resume: AppResume, styles: Styles) {
  if ((resume.achievements ?? []).length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>Achievements</Text>
      {(resume.achievements ?? []).map((achievement, idx) => {
        const label = typeof achievement === "string" ? null : achievement?.title || null;
        const desc = typeof achievement === "string" ? achievement : achievement?.description || "";
        if (!label && !desc) return null;
        return (
          <View key={idx} style={styles.bulletRow}>
            <Text style={styles.bulletMark}>•</Text>
            <Text style={styles.bulletText}>
              {label && <Text style={styles.bulletBold}>{label}: </Text>}
              {desc}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function renderCertifications(resume: AppResume, styles: Styles) {
  if ((resume.certifications ?? []).length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>Certifications</Text>
      {(resume.certifications ?? []).map((cert, idx) => (
        <View key={idx} style={styles.bulletRow}>
          <Text style={styles.bulletMark}>•</Text>
          <Text style={styles.bulletText}>
            <Text style={styles.bulletBold}>{cert.name}: </Text>
            {cert.issuer} - {cert.date}
            {cert.credentialId ? ` (ID: ${cert.credentialId})` : ""}
          </Text>
        </View>
      ))}
    </View>
  );
}

function renderCustomSections(resume: AppResume, styles: Styles) {
  const sections = (resume.customSections ?? []).filter(
    (section) => section.title && section.items.length > 0,
  );
  if (sections.length === 0) return null;
  return (
    <>
      {sections.map((section) => (
        <View key={section.id}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item) => (
            <View key={item.id} style={styles.entry}>
              {(item.heading || item.subheading) && (
                <View style={styles.entryTopRow}>
                  <Text style={styles.entryTitleBold}>{item.heading}</Text>
                  <Text style={styles.entrySubtitleItalic}>{item.subheading}</Text>
                </View>
              )}
              {item.description && <Text style={styles.summaryText}>{item.description}</Text>}
              {(item.bullets ?? []).map((bullet, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bulletMark}>•</Text>
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

const SECTION_RENDERERS: Record<
  Exclude<SectionKey, "personal">,
  (resume: AppResume, styles: Styles) => React.ReactNode
> = {
  skills: renderSkills,
  experience: renderExperience,
  projects: renderProjects,
  education: renderEducation,
  achievements: renderAchievements,
  certifications: renderCertifications,
  custom: renderCustomSections,
};

interface ClassicTemplateProps {
  resume: AppResume;
}

export default function ClassicTemplate({ resume }: ClassicTemplateProps) {
  const order = getEffectiveSectionOrder(resume.sectionOrder);
  const styles = buildStyles(resume.styleConfig);

  // Only the fields that have values, so an unfilled field doesn't leave a
  // dangling "|" separator in the centered contact line.
  const contactParts: { text: string; href?: string }[] = [];
  if (resume.personalInfo.phone) contactParts.push({ text: resume.personalInfo.phone });
  if (resume.personalInfo.email) {
    contactParts.push({ text: resume.personalInfo.email, href: `mailto:${resume.personalInfo.email}` });
  }
  if (resume.personalInfo.portfolio) {
    contactParts.push({ text: resume.personalInfo.portfolio, href: resume.personalInfo.portfolio });
  }
  if (resume.personalInfo.linkedin) {
    contactParts.push({ text: resume.personalInfo.linkedin, href: resume.personalInfo.linkedin });
  }
  if (resume.personalInfo.github) {
    contactParts.push({ text: resume.personalInfo.github, href: resume.personalInfo.github });
  }
  if (resume.personalInfo.location) contactParts.push({ text: resume.personalInfo.location });

  return (
    <Document>
      <Page size={PAPER_SIZE_MAP[resume.styleConfig.paperFormat]} style={styles.page}>
        <View style={styles.headerBlock}>
          <Text style={styles.name}>{resume.personalInfo.fullName || "Your Name"}</Text>
        </View>

        <View style={styles.contactRow}>
          {contactParts.map((part, i) => (
            <Fragment key={i}>
              {i > 0 && <Text style={styles.contactSeparator}>|</Text>}
              {part.href ? (
                <Link src={part.href} style={styles.contactLink}>
                  {part.text}
                </Link>
              ) : (
                <Text style={styles.contactText}>{part.text}</Text>
              )}
            </Fragment>
          ))}
        </View>

        {renderSummary(resume, styles)}

        {order
          .filter((key): key is Exclude<SectionKey, "personal"> => key !== "personal")
          .map((key) => (
            <Fragment key={key}>{SECTION_RENDERERS[key](resume, styles)}</Fragment>
          ))}
      </Page>
    </Document>
  );
}
