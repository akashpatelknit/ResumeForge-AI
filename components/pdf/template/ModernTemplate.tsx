import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import { AppResume } from "@/types/resume";

/**
 * ModernTemplate — pixel-faithful port of the LaTeX resume template
 * (Anubhav Singh / xprilion, MIT).
 *
 * LaTeX margins translated to pt:
 *   \oddsidemargin  -0.530in  → ~38pt left/right (after \textwidth +1in)
 *   \topmargin      -0.45in   → ~18pt top
 */

const styles = StyleSheet.create({
  // ── Page ──────────────────────────────────────────────────────────────────
  page: {
    paddingTop: 18,
    paddingBottom: 24,
    paddingLeft: 38,
    paddingRight: 38,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.25,
    backgroundColor: "#ffffff",
  },

  // ── Header ────────────────────────────────────────────────────────────────
  // Mirrors: \begin{tabular*}{\textwidth}{l@{\extracolsep{\fill}}r}
  headerRow1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
  },
  // Email on right of row 1 — rendered as a clickable mailto link
  headerEmailLink: {
    fontSize: 10,
    color: "#1a1a1a",
    textDecoration: "none",
    flexShrink: 0,
  },
  // LinkedIn / Github links on left column
  headerLink: {
    fontSize: 10,
    color: "#1a1a1a",
    textDecoration: "none",
  },
  // "Mobile:   +91-..." plain text on right of row 2
  headerMobile: {
    fontSize: 10,
    color: "#1a1a1a",
    flexShrink: 0,
  },

  // ── Section title ─────────────────────────────────────────────────────────
  // \vspace{-10pt}\scshape\raggedright\large  +  \titlerule
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 6,
    marginBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: "#000000",
    paddingBottom: 2,
  },

  // ── Professional Summary ──────────────────────────────────────────────────
  summaryText: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 2,
    textAlign: "justify",
  },

  // ── resumeSubHeadingListStart/End ─────────────────────────────────────────
  // Outer wrapper — itemize leftmargin=*
  subHeadingList: {
    paddingLeft: 0,
    marginBottom: 0,
  },

  // ── resumeSubItem / resumeItem ────────────────────────────────────────────
  // \item\small{ \textbf{#1}{: #2} }
  // →  •  BOLD_LABEL: normal value
  subItem: {
    flexDirection: "row",
    marginBottom: 2,
    alignItems: "flex-start",
  },
  subItemBullet: {
    fontSize: 10,
    width: 14,
    lineHeight: 1.3,
  },
  subItemTextWrap: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  subItemLabelBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.3,
  },
  subItemValue: {
    fontSize: 10,
    lineHeight: 1.3,
  },

  // ── resumeSubheading ──────────────────────────────────────────────────────
  // \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
  //   \textbf{Company}  &  Location  \\
  //   \textit{Position}  &  \textit{Date}  \\
  // \end{tabular*}
  subheadingItem: {
    marginTop: 2,
    marginBottom: 0,
  },
  subheadingTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  subheadingBotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 1,
    marginBottom: 2,
  },
  subheadingCompany: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  subheadingLocation: {
    fontSize: 10,
  },
  subheadingPosition: {
    fontSize: 10,
    fontStyle: "italic",
  },
  subheadingDate: {
    fontSize: 10,
    fontStyle: "italic",
  },

  // ── resumeItemListStart / resumeItem ──────────────────────────────────────
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
    fontSize: 10,
    width: 14,
    lineHeight: 1.3,
  },
  itemBodyBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.3,
  },
  itemBodyNormal: {
    fontSize: 10,
    flex: 1,
    lineHeight: 1.3,
    textAlign: "justify",
  },

  // ── Projects ──────────────────────────────────────────────────────────────
  // \resumeSubItem{Name [links]}{description \\ \textbullet~ ... \\ \textbf{Tech Stack:} ...}
  projectSubItem: {
    flexDirection: "row",
    marginBottom: 6, // \vspace{5pt} between projects
    alignItems: "flex-start",
  },
  projectBullet: {
    fontSize: 10,
    width: 14,
    lineHeight: 1.3,
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
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  projectLinkText: {
    fontSize: 10,
    color: "#0066cc",
    textDecoration: "none",
    marginLeft: 4,
  },
  // Normal second arg
  projectDesc: {
    fontSize: 10,
    lineHeight: 1.3,
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
    fontSize: 10,
    width: 14,
    lineHeight: 1.3,
  },
  projectBulletText: {
    fontSize: 10,
    flex: 1,
    lineHeight: 1.3,
    textAlign: "justify",
  },
  // \textbf{Tech Stack:} value
  techStackRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 1,
  },
  techStackBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.3,
  },
  techStackValue: {
    fontSize: 10,
    lineHeight: 1.3,
  },

  // ── Education ─────────────────────────────────────────────────────────────
  educationItem: {
    marginBottom: 4,
  },
  gpaText: {
    fontSize: 10,
    marginBottom: 2,
  },
});

interface LatexModernTemplateProps {
  resume: AppResume;
}

export default function ModernTemplate({ resume }: LatexModernTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ================================================================
            HEADING
            Row 1: \textbf{{\LARGE Name}}            Email: \href{mailto:...}{...}
            Row 2: \href{...}{LinkedIn: ...}          Mobile:~~~...
            Row 3: \href{...}{Github:  ...}
        ================================================================ */}
        <View style={styles.headerRow1}>
          <Text style={styles.name}>
            {resume.personalInfo.fullName || "Your Name"}
          </Text>
          <Link
            src={`mailto:${resume.personalInfo.email || ""}`}
            style={styles.headerEmailLink}
          >
            Email: {resume.personalInfo.email || "your.email@example.com"}
          </Link>
        </View>

        <View style={styles.headerRow2}>
          <View style={styles.headerLeft}>
            {resume.personalInfo.linkedin ? (
              <Link
                src={resume.personalInfo.linkedin}
                style={styles.headerLink}
              >
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

        {/* ================================================================
            PROFESSIONAL SUMMARY
            \vspace{-5pt}
            \section{Professional Summary}
            \vspace{2pt}
            text
        ================================================================ */}
        {resume.summary && (
          <View>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summaryText}>{resume.summary}</Text>
          </View>
        )}

        {/* ================================================================
            SKILLS SUMMARY
            \section{Skills Summary}
            \resumeSubHeadingListStart
              \resumeSubItem{Label}{value}
            \resumeSubHeadingListEnd
            \vspace{-5pt}
        ================================================================ */}
        {(resume.skills ?? []).length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Skills Summary</Text>
            <View style={styles.subHeadingList}>
              {(resume.skills ?? []).map((skill, idx) => (
                <View key={idx} style={styles.subItem}>
                  <Text style={styles.subItemBullet}>•</Text>
                  <View style={styles.subItemTextWrap}>
                    <Text>
                      <Text style={styles.subItemLabelBold}>
                        {skill.category}
                      </Text>
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
        )}

        {/* ================================================================
            EXPERIENCE
            \vspace{-5pt}
            \section{Experience}
            \resumeSubHeadingListStart
              \resumeSubheading{Co}{Loc}{Pos}{Date}
              \resumeItemListStart
                \resumeItem{Title}{desc}
              \resumeItemListEnd
              \vspace{0pt}
            \resumeSubHeadingListEnd
        ================================================================ */}
        {(resume.experience ?? []).length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            <View style={styles.subHeadingList}>
              {(resume.experience ?? []).map((exp, idx) => (
                <View key={idx} style={styles.subheadingItem}>
                  {/* \textbf{Company} & Location \\ */}
                  <View style={styles.subheadingTopRow}>
                    <Text style={styles.subheadingCompany}>{exp.company}</Text>
                    <Text style={styles.subheadingLocation}>
                      {exp.location}
                    </Text>
                  </View>
                  {/* \textit{Position} & \textit{Date} \\ */}
                  <View style={styles.subheadingBotRow}>
                    <Text style={styles.subheadingPosition}>
                      {exp.position}
                    </Text>
                    <Text style={styles.subheadingDate}>
                      {exp.startDate} - {exp.endDate || "Present"}
                    </Text>
                  </View>

                  {/* resumeItemListStart → resumeItemListEnd */}
                  <View style={styles.itemList}>
                    {(exp.achievements ?? []).map((achievement, i) => {
                      const text =
                        typeof achievement === "string"
                          ? achievement
                          : String(achievement ?? "");

                      // Split on first ":" — only treat as titled if label ≤ 40 chars
                      const colonIdx = text.indexOf(":");
                      const hasTitle = colonIdx > 0 && colonIdx <= 40;
                      const title = hasTitle ? text.slice(0, colonIdx) : null;
                      const desc = hasTitle
                        ? text.slice(colonIdx + 1).trimStart()
                        : text;

                      return (
                        <View key={i} style={styles.itemRow}>
                          <Text style={styles.itemBullet}>•</Text>
                          <Text style={styles.itemBodyNormal}>
                            {hasTitle && (
                              <Text style={styles.itemBodyBold}>{title}: </Text>
                            )}
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
        )}

        {/* ================================================================
            PROJECTS
            \vspace{-5pt}
            \section{Projects}
            \resumeSubHeadingListStart
              \resumeSubItem{Name [GitHub] [Live]}{
                description \\
                \textbullet~ highlight \\
                \textbf{Tech Stack:} value
              }
              \vspace{5pt}
            \resumeSubHeadingListEnd
        ================================================================ */}
        {(resume.projects ?? []).length > 0 && (
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
                        <Link
                          src={project.github}
                          style={styles.projectLinkText}
                        >
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

                    {project.description && (
                      <Text style={styles.projectDesc}>
                        {project.description}
                      </Text>
                    )}

                    {/* \textbullet~ highlight lines */}
                    {(project.highlights ?? []).map((highlight, i) => {
                      const text =
                        typeof highlight === "string"
                          ? highlight
                          : String(highlight ?? "");
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
                        <Text style={styles.techStackValue}>
                          {(project.technologies ?? []).join(", ")}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ================================================================
            EDUCATION  (not in original LaTeX sample — kept for AppResume type)
            Uses same \resumeSubheading pattern
        ================================================================ */}
        {(resume.education ?? []).length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            <View style={styles.subHeadingList}>
              {(resume.education ?? []).map((edu, idx) => (
                <View
                  key={idx}
                  style={[styles.subheadingItem, styles.educationItem]}
                >
                  <View style={styles.subheadingTopRow}>
                    <Text style={styles.subheadingCompany}>
                      {edu.institution}
                    </Text>
                    <Text style={styles.subheadingLocation}>
                      {edu.location}
                    </Text>
                  </View>
                  <View style={styles.subheadingBotRow}>
                    <Text style={styles.subheadingPosition}>
                      {edu.degree} in {edu.field}
                    </Text>
                    <Text style={styles.subheadingDate}>
                      {edu.startDate} - {edu.endDate}
                    </Text>
                  </View>
                  {edu.gpa && (
                    <Text style={styles.gpaText}>GPA: {edu.gpa}</Text>
                  )}
                  {(edu.achievements ?? []).length > 0 && (
                    <View style={styles.itemList}>
                      {(edu.achievements ?? []).map((achievement, i) => {
                        const text =
                          typeof achievement === "string"
                            ? achievement
                            : String(achievement ?? "");
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
        )}

        {/* ================================================================
            ACHIEVEMENTS
            \section{Achievements}
            \resumeSubHeadingListStart
              \resumeSubItem{Label}{description}   ← same format as Skills
            \resumeSubHeadingListEnd
        ================================================================ */}
        {(resume.achievements ?? []).length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.subHeadingList}>
              {(resume.achievements ?? []).map((achievement, idx) => {
                const text =
                  typeof achievement === "string"
                    ? achievement
                    : String(achievement ?? "");
                const colonIdx = text.indexOf(":");
                const hasLabel = colonIdx > 0 && colonIdx <= 40;
                const label = hasLabel ? text.slice(0, colonIdx) : null;
                const desc = hasLabel
                  ? text.slice(colonIdx + 1).trimStart()
                  : text;

                return (
                  <View key={idx} style={styles.subItem}>
                    <Text style={styles.subItemBullet}>•</Text>
                    <View style={styles.subItemTextWrap}>
                      <Text>
                        {hasLabel && (
                          <Text style={styles.subItemLabelBold}>{label}: </Text>
                        )}
                        <Text style={styles.subItemValue}>{desc}</Text>
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ================================================================
            CERTIFICATIONS  (not in original LaTeX sample — kept for AppResume type)
            Uses resumeSubItem format: • BOLD name: issuer - date
        ================================================================ */}
        {(resume.certifications ?? []).length > 0 && (
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
        )}
      </Page>
    </Document>
  );
}
