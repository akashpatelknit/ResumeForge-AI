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
 * ModernTemplate — pixel-faithful port of the LaTeX resume template
 * (Anubhav Singh / xprilion, MIT).
 *
 * LaTeX margins translated to pt:
 *   \oddsidemargin  -0.530in  → ~38pt left/right (after \textwidth +1in)
 *   \topmargin      -0.45in   → ~18pt top
 *
 * Styles are built per-render from resume.styleConfig (Layout tab) rather
 * than a fixed StyleSheet.create() — accent color, margins, fonts, sizes and
 * line spacing all flow through here. Left/right page padding (38pt) and the
 * smaller internal gaps (bullet-to-bullet, header rows) aren't covered by
 * any Layout control, so they stay fixed.
 */
function buildStyles(sc: ResumeStyleConfig) {
  const headScale = sc.headingSizePct / 100;
  const bodyScale = sc.bodySizePct / 100;
  const lineScale = sc.lineSpacingPct / 100;
  const boldPrimary = PDF_BOLD_FONT_MAP[sc.primaryFont];
  const accent = sc.accentColor;
  const topBottomPt = sc.margins.topBottom * 72; // stored in inches
  const B = 10 * bodyScale; // base body font size, everything but name/section titles

  return StyleSheet.create({
    // ── Page ──────────────────────────────────────────────────────────────
    page: {
      paddingTop: topBottomPt,
      paddingBottom: topBottomPt,
      paddingLeft: 38,
      paddingRight: 38,
      fontSize: B,
      fontFamily: sc.secondaryFont,
      lineHeight: 1.25 * lineScale,
      backgroundColor: "#ffffff",
    },

    // ── Header ────────────────────────────────────────────────────────────
    // Mirrors: \begin{tabular*}{\textwidth}{l@{\extracolsep{\fill}}r}
    headerRow1: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    headerRow2: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginTop: 1,
    },
    headerRow3: {
      flexDirection: "row",
      justifyContent: "flex-start",
      marginTop: 1,
    },
    // Left column in rows 2 & 3 — flex so it never bleeds into right column
    headerLeft: {
      flex: 1,
      paddingRight: 8,
    },
    // Right column — fixed width wide enough for "Email: ..." / "Mobile: ..."
    headerRight: {
      flexShrink: 0,
    },
    // \textbf{{\LARGE Name}}  ≈ 22pt bold
    name: {
      fontSize: 22 * headScale,
      lineHeight: 1.15 * lineScale,
      fontFamily: boldPrimary,
      color: accent,
    },
    // Email on right of row 1 — rendered as a clickable mailto link
    headerEmailLink: {
      fontSize: B,
      color: "#1a1a1a",
      textDecoration: "none",
      flexShrink: 0,
    },
    // LinkedIn / Github links on left column
    headerLink: {
      fontSize: B,
      color: "#1a1a1a",
      textDecoration: "none",
    },
    // "Mobile:   +91-..." plain text on right of row 2
    headerMobile: {
      fontSize: B,
      color: "#1a1a1a",
      flexShrink: 0,
    },

    // ── Section title ───────────────────────────────────────────────────────
    // \vspace{-10pt}\scshape\raggedright\large  +  \titlerule
    sectionTitle: {
      fontSize: 13 * headScale,
      fontFamily: boldPrimary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginTop: sc.margins.betweenSections,
      marginBottom: sc.margins.betweenTitlesAndContent,
      borderBottomWidth: 0.75,
      borderBottomColor: accent,
      paddingBottom: 2,
      color: accent,
    },

    // ── Professional Summary ─────────────────────────────────────────────────
    summaryText: {
      fontSize: B,
      lineHeight: 1.4 * lineScale,
      marginBottom: 2,
      textAlign: "justify",
    },

    // ── resumeSubHeadingListStart/End ────────────────────────────────────────
    // Outer wrapper — itemize leftmargin=*
    subHeadingList: {
      paddingLeft: 0,
      marginBottom: 0,
    },

    // ── resumeSubItem / resumeItem ───────────────────────────────────────────
    // \item\small{ \textbf{#1}{: #2} }
    // →  •  BOLD_LABEL: normal value
    subItem: {
      flexDirection: "row",
      marginBottom: 2,
      alignItems: "flex-start",
    },
    subItemBullet: {
      fontSize: B,
      width: 14,
      lineHeight: 1.3 * lineScale,
    },
    subItemTextWrap: {
      flex: 1,
      flexDirection: "row",
      flexWrap: "wrap",
    },
    subItemLabelBold: {
      fontSize: B,
      fontFamily: boldPrimary,
      lineHeight: 1.3 * lineScale,
    },
    subItemValue: {
      fontSize: B,
      lineHeight: 1.3 * lineScale,
    },

    // ── resumeSubheading ──────────────────────────────────────────────────────
    // \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
    //   \textbf{Company}  &  Location  \\
    //   \textit{Position}  &  \textit{Date}  \\
    // \end{tabular*}
    subheadingItem: {
      marginTop: sc.margins.betweenContentBlocks,
      marginBottom: 0,
    },
    // row-reverse for "left" flips which side date/location land on without
    // restructuring the JSX (company/position stay first in markup either way).
    subheadingTopRow: {
      flexDirection: sc.dateLocationAlign === "left" ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    subheadingBotRow: {
      flexDirection: sc.dateLocationAlign === "left" ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginTop: 1,
      marginBottom: 2,
    },
    subheadingCompany: {
      fontSize: B,
      fontFamily: boldPrimary,
    },
    subheadingLocation: {
      fontSize: B,
    },
    subheadingPosition: {
      fontSize: B,
      fontStyle: "italic",
    },
    subheadingDate: {
      fontSize: B,
      fontStyle: "italic",
    },

    // ── resumeItemListStart / resumeItem ─────────────────────────────────────
    // \begin{itemize}  inside experience
    // \resumeItem{Title}{desc} = \item\small{ \textbf{Title}{: desc} }
    itemList: {
      paddingLeft: 6,
      marginBottom: 4,
    },
    itemRow: {
      flexDirection: "row",
      marginBottom: 3,
      alignItems: "flex-start",
    },
    itemBullet: {
      fontSize: B,
      width: 14,
      lineHeight: 1.3 * lineScale,
    },
    itemBodyBold: {
      fontSize: B,
      fontFamily: boldPrimary,
      lineHeight: 1.3 * lineScale,
    },
    itemBodyNormal: {
      fontSize: B,
      flex: 1,
      lineHeight: 1.3 * lineScale,
      textAlign: "justify",
    },

    // ── Projects ──────────────────────────────────────────────────────────────
    // \resumeSubItem{Name [links]}{description \\ \textbullet~ ... \\ \textbf{Tech Stack:} ...}
    projectSubItem: {
      flexDirection: "row",
      marginBottom: sc.margins.betweenContentBlocks,
      alignItems: "flex-start",
    },
    projectBullet: {
      fontSize: B,
      width: 14,
      lineHeight: 1.3 * lineScale,
    },
    projectBody: {
      flex: 1,
    },
    // Bold first arg: Name + inline links
    projectNameRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      marginBottom: 2,
    },
    projectNameBold: {
      fontSize: B,
      fontFamily: boldPrimary,
    },
    projectLinkText: {
      fontSize: B,
      color: accent,
      textDecoration: "none",
      marginLeft: 4,
    },
    // Normal second arg
    projectDesc: {
      fontSize: B,
      lineHeight: 1.3 * lineScale,
      marginBottom: 2,
      textAlign: "justify",
    },
    // \textbullet~ sub-bullets inside project body
    projectBulletRow: {
      flexDirection: "row",
      marginBottom: 2,
      alignItems: "flex-start",
    },
    projectBulletMark: {
      fontSize: B,
      width: 14,
      lineHeight: 1.3 * lineScale,
    },
    projectBulletText: {
      fontSize: B,
      flex: 1,
      lineHeight: 1.3 * lineScale,
      textAlign: "justify",
    },
    // \textbf{Tech Stack:} value
    techStackRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 1,
    },
    techStackBold: {
      fontSize: B,
      fontFamily: boldPrimary,
      lineHeight: 1.3 * lineScale,
    },
    techStackValue: {
      fontSize: B,
      lineHeight: 1.3 * lineScale,
    },

    // ── Education ───────────────────────────────────────────────────────────
    educationItem: {
      marginBottom: 4,
    },
    gpaText: {
      fontSize: B,
      marginBottom: 2,
    },
  });
}

type Styles = ReturnType<typeof buildStyles>;

// ── Section renderers ─────────────────────────────────────────────────────
// Each returns the same JSX previously inlined in a fixed sequence, or null
// when the section has nothing to show. Pulled into standalone functions,
// keyed by SectionKey, so the sequence they're rendered in can follow
// resume.sectionOrder (see the bottom of this file) instead of a hardcoded
// order in the JSX itself.

// "personal" — always rendered first (see the component below), never part
// of the reorderable set. This is just the Professional Summary; the
// contact-info header above it is rendered unconditionally, outside of
// sectionOrder entirely.
function renderSummary(resume: AppResume, styles: Styles) {
  if (!resume.summary) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>Professional Summary</Text>
      <Text style={styles.summaryText}>{resume.summary}</Text>
    </View>
  );
}

function renderSkills(resume: AppResume, styles: Styles) {
  if ((resume.skills ?? []).length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>Skills Summary</Text>
      <View style={styles.subHeadingList}>
        {(resume.skills ?? []).map((skill, idx) => (
          <View key={idx} style={styles.subItem}>
            <Text style={styles.subItemBullet}>•</Text>
            <View style={styles.subItemTextWrap}>
              <Text>
                <Text style={styles.subItemLabelBold}>{skill.category}</Text>
                <Text style={styles.subItemValue}>
                  {": "}
                  {(skill.items ?? []).join(", ")}
                </Text>
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function renderExperience(resume: AppResume, styles: Styles) {
  if ((resume.experience ?? []).length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>Experience</Text>
      <View style={styles.subHeadingList}>
        {(resume.experience ?? []).map((exp, idx) => (
          <View key={idx} style={styles.subheadingItem}>
            {/* \textbf{Company} & Location \\ */}
            <View style={styles.subheadingTopRow}>
              <Text style={styles.subheadingCompany}>{exp.company}</Text>
              <Text style={styles.subheadingLocation}>{exp.location}</Text>
            </View>
            {/* \textit{Position} & \textit{Date} \\ */}
            <View style={styles.subheadingBotRow}>
              <Text style={styles.subheadingPosition}>{exp.position}</Text>
              <Text style={styles.subheadingDate}>
                {formatResumeDate(exp.startDate, resume.styleConfig.dateFormat)} -{" "}
                {formatResumeDate(exp.endDate, resume.styleConfig.dateFormat)}
              </Text>
            </View>

            {/* resumeItemListStart → resumeItemListEnd */}
            <View style={styles.itemList}>
              {(exp.achievements ?? []).map((achievement, i) => {
                const text =
                  typeof achievement === "string" ? achievement : String(achievement ?? "");

                // Split on first ":" — only treat as titled if label ≤ 40 chars
                const colonIdx = text.indexOf(":");
                const hasTitle = colonIdx > 0 && colonIdx <= 40;
                const title = hasTitle ? text.slice(0, colonIdx) : null;
                const desc = hasTitle ? text.slice(colonIdx + 1).trimStart() : text;

                return (
                  <View key={i} style={styles.itemRow}>
                    <Text style={styles.itemBullet}>•</Text>
                    <Text style={styles.itemBodyNormal}>
                      {hasTitle && <Text style={styles.itemBodyBold}>{title}: </Text>}
                      {desc}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function renderProjects(resume: AppResume, styles: Styles) {
  if ((resume.projects ?? []).length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>Projects</Text>
      <View style={styles.subHeadingList}>
        {(resume.projects ?? []).map((project, idx) => (
          <View key={idx} style={styles.projectSubItem}>
            <Text style={styles.projectBullet}>•</Text>
            <View style={styles.projectBody}>
              {/* Bold first arg: Name + inline link labels */}
              <View style={styles.projectNameRow}>
                <Text style={styles.projectNameBold}>{project.name}</Text>
                {project.github && (
                  <Link src={project.github} style={styles.projectLinkText}>
                    {" "}
                    [GitHub]
                  </Link>
                )}
                {project.link && (
                  <Link src={project.link} style={styles.projectLinkText}>
                    {" "}
                    [Live]
                  </Link>
                )}
              </View>

              {/* Normal second arg */}

              {project.description && <Text style={styles.projectDesc}>{project.description}</Text>}

              {/* \textbullet~ highlight lines */}
              {(project.highlights ?? []).map((highlight, i) => {
                const text = typeof highlight === "string" ? highlight : String(highlight ?? "");
                return (
                  <View key={i} style={styles.projectBulletRow}>
                    <Text style={styles.projectBulletMark}>•</Text>
                    <Text style={styles.projectBulletText}>{text}</Text>
                  </View>
                );
              })}

              {/* \textbf{Tech Stack:} value */}
              {(project.technologies ?? []).length > 0 && (
                <View style={styles.techStackRow}>
                  <Text style={styles.techStackBold}>Tech Stack: </Text>
                  <Text style={styles.techStackValue}>{(project.technologies ?? []).join(", ")}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function renderEducation(resume: AppResume, styles: Styles) {
  if ((resume.education ?? []).length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>Education</Text>
      <View style={styles.subHeadingList}>
        {(resume.education ?? []).map((edu, idx) => (
          <View key={idx} style={[styles.subheadingItem, styles.educationItem]}>
            <View style={styles.subheadingTopRow}>
              <Text style={styles.subheadingCompany}>{edu.institution}</Text>
              <Text style={styles.subheadingLocation}>{edu.location}</Text>
            </View>
            <View style={styles.subheadingBotRow}>
              <Text style={styles.subheadingPosition}>
                {edu.degree} in {edu.field}
              </Text>
              <Text style={styles.subheadingDate}>
                {formatResumeDate(edu.startDate, resume.styleConfig.dateFormat)} -{" "}
                {formatResumeDate(edu.endDate, resume.styleConfig.dateFormat)}
              </Text>
            </View>
            {edu.gpa && <Text style={styles.gpaText}>GPA: {edu.gpa}</Text>}
            {(edu.achievements ?? []).length > 0 && (
              <View style={styles.itemList}>
                {(edu.achievements ?? []).map((achievement, i) => {
                  const text = typeof achievement === "string" ? achievement : String(achievement ?? "");
                  return (
                    <View key={i} style={styles.itemRow}>
                      <Text style={styles.itemBullet}>•</Text>
                      <Text style={styles.itemBodyNormal}>{text}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function renderAchievements(resume: AppResume, styles: Styles) {
  if ((resume.achievements ?? []).length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.subHeadingList}>
        {(resume.achievements ?? []).map((achievement, idx) => {
          // Achievement entries are { title, description } objects (see
          // lib/seedResumeData.ts, types/resume.ts) — fall back to
          // treating a plain string as an untitled description for
          // older/looser data rather than stringifying the object.
          const label = typeof achievement === "string" ? null : achievement?.title || null;
          const desc = typeof achievement === "string" ? achievement : achievement?.description || "";

          if (!label && !desc) return null;

          return (
            <View key={idx} style={styles.subItem}>
              <Text style={styles.subItemBullet}>•</Text>
              <View style={styles.subItemTextWrap}>
                <Text>
                  {label && <Text style={styles.subItemLabelBold}>{label}: </Text>}
                  <Text style={styles.subItemValue}>{desc}</Text>
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function renderCertifications(resume: AppResume, styles: Styles) {
  if ((resume.certifications ?? []).length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionTitle}>Certifications</Text>
      <View style={styles.subHeadingList}>
        {(resume.certifications ?? []).map((cert, idx) => (
          <View key={idx} style={styles.subItem}>
            <Text style={styles.subItemBullet}>•</Text>
            <View style={styles.subItemTextWrap}>
              <Text>
                <Text style={styles.subItemLabelBold}>{cert.name}: </Text>
                <Text style={styles.subItemValue}>
                  {cert.issuer} - {cert.date}
                  {cert.credentialId ? ` (ID: ${cert.credentialId})` : ""}
                </Text>
              </Text>
            </View>
          </View>
        ))}
      </View>
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
          <View style={styles.subHeadingList}>
            {section.items.map((item) => (
              <View key={item.id} style={styles.subheadingItem}>
                {(item.heading || item.subheading) && (
                  <View style={styles.subheadingTopRow}>
                    <Text style={styles.subheadingCompany}>{item.heading}</Text>
                    <Text style={styles.subheadingPosition}>{item.subheading}</Text>
                  </View>
                )}
                {item.description && <Text style={styles.summaryText}>{item.description}</Text>}
                {(item.bullets ?? []).length > 0 && (
                  <View style={styles.itemList}>
                    {item.bullets.map((bullet, i) => (
                      <View key={i} style={styles.itemRow}>
                        <Text style={styles.itemBullet}>•</Text>
                        <Text style={styles.itemBodyNormal}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      ))}
    </>
  );
}

// Every SectionKey except "personal" — that one's rendered unconditionally
// right after the header, never through this map, since it's locked first.
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

interface LatexModernTemplateProps {
  resume: AppResume;
}

export default function ModernTemplate({ resume }: LatexModernTemplateProps) {
  // getEffectiveSectionOrder guarantees a complete, "personal"-first array
  // even for resumes saved before sectionOrder existed — see
  // lib/resumeSections.ts.
  const order = getEffectiveSectionOrder(resume.sectionOrder);
  const styles = buildStyles(resume.styleConfig);

  return (
    <Document>
      <Page size={PAPER_SIZE_MAP[resume.styleConfig.paperFormat]} style={styles.page}>
        {/* ================================================================
            HEADING — always first, never reorderable (it's the identity
            block, not a "section").
            Row 1: \textbf{{\LARGE Name}}            Email: \href{mailto:...}{...}
            Row 2: \href{...}{LinkedIn: ...}          Mobile:~~~...
            Row 3: \href{...}{Github:  ...}
        ================================================================ */}
        <View style={styles.headerRow1}>
          <Text style={styles.name}>{resume.personalInfo.fullName || "Your Name"}</Text>
          <Link src={`mailto:${resume.personalInfo.email || ""}`} style={styles.headerEmailLink}>
            Email: {resume.personalInfo.email || "your.email@example.com"}
          </Link>
        </View>

        <View style={styles.headerRow2}>
          <View style={styles.headerLeft}>
            {resume.personalInfo.linkedin ? (
              <Link src={resume.personalInfo.linkedin} style={styles.headerLink}>
                LinkedIn: {resume.personalInfo.linkedin}
              </Link>
            ) : (
              <Text />
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerMobile}>
              Mobile:{"   "}
              {resume.personalInfo.phone || "+XX-XXXXXXXXXX"}
            </Text>
          </View>
        </View>

        {resume.personalInfo.github && (
          <View style={styles.headerRow3}>
            <View style={styles.headerLeft}>
              <Link src={resume.personalInfo.github} style={styles.headerLink}>
                Github:{"  "}
                {resume.personalInfo.github}
              </Link>
            </View>
          </View>
        )}

        {/* "personal" section (Professional Summary) — locked first,
            rendered outside the sectionOrder loop below. */}
        {renderSummary(resume, styles)}

        {/* Everything else, in the user's chosen (or default) order. */}
        {order
          .filter((key): key is Exclude<SectionKey, "personal"> => key !== "personal")
          .map((key) => (
            <Fragment key={key}>{SECTION_RENDERERS[key](resume, styles)}</Fragment>
          ))}
      </Page>
    </Document>
  );
}
