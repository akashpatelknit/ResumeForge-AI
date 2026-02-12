import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import { Resume } from "@/types/resume";

// LaTeX-inspired styles matching the original template
const styles = StyleSheet.create({
  page: {
    padding: "30pt 35pt",
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.3,
    backgroundColor: "#ffffff",
  },

  // Header Section
  headerSection: {
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 10,
    color: "#000",
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  link: {
    fontSize: 10,
    color: "#0066cc",
    textDecoration: "none",
  },
  phoneText: {
    fontSize: 10,
    color: "#000",
  },

  // Section Headers
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 3,
  },

  // Professional Summary
  summaryText: {
    fontSize: 10,
    lineHeight: 1.4,
    textAlign: "justify",
    marginBottom: 8,
  },

  // Skills Section
  skillItem: {
    flexDirection: "row",
    marginBottom: 3,
  },
  skillCategory: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    width: 120,
  },
  skillList: {
    fontSize: 10,
    flex: 1,
    lineHeight: 1.3,
  },

  // Experience Section
  experienceItem: {
    marginBottom: 10,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  companyName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  location: {
    fontSize: 10,
    fontStyle: "italic",
  },
  positionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  positionTitle: {
    fontSize: 10,
    fontStyle: "italic",
  },
  dateRange: {
    fontSize: 10,
    fontStyle: "italic",
  },
  achievementItem: {
    flexDirection: "row",
    marginBottom: 5,
    paddingRight: 10,
  },
  achievementBullet: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    width: 15,
  },
  achievementText: {
    fontSize: 10,
    flex: 1,
    lineHeight: 1.3,
    textAlign: "justify",
  },
  achievementTitle: {
    fontFamily: "Helvetica-Bold",
  },

  // Projects Section
  projectItem: {
    marginBottom: 8,
  },
  projectHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 3,
    alignItems: "center",
  },
  projectName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  projectLinks: {
    fontSize: 9,
    color: "#0066cc",
    marginLeft: 5,
  },
  projectDescription: {
    fontSize: 10,
    lineHeight: 1.3,
    marginBottom: 3,
  },
  projectHighlight: {
    flexDirection: "row",
    marginBottom: 3,
  },
  projectBullet: {
    fontSize: 10,
    width: 12,
  },
  projectHighlightText: {
    fontSize: 10,
    flex: 1,
    lineHeight: 1.3,
    textAlign: "justify",
  },
  techStack: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginTop: 3,
  },

  // Education Section
  educationItem: {
    marginBottom: 8,
  },
  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  institutionName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  degreeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  degreeText: {
    fontSize: 10,
    fontStyle: "italic",
  },

  // Achievements Section
  achievementsList: {
    marginBottom: 5,
  },
  achievementBulletItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  achievementLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    width: 100,
  },
  achievementDescription: {
    fontSize: 10,
    flex: 1,
    lineHeight: 1.3,
  },
});

interface LatexModernTemplateProps {
  resume: Resume;
}

export default function LatexModernTemplate({
  resume,
}: LatexModernTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {resume.personalInfo.fullName || "Your Name"}
            </Text>
            <Text style={styles.email}>
              Email: {resume.personalInfo.email || "your.email@example.com"}
            </Text>
          </View>

          <View style={styles.contactRow}>
            {resume.personalInfo.linkedin && (
              <Link src={resume.personalInfo.linkedin} style={styles.link}>
                LinkedIn: {resume.personalInfo.linkedin}
              </Link>
            )}
            <Text style={styles.phoneText}>
              Mobile: {resume.personalInfo.phone || "+XX-XXXXXXXXXX"}
            </Text>
          </View>

          {resume.personalInfo.github && (
            <View style={styles.contactRow}>
              <Link src={resume.personalInfo.github} style={styles.link}>
                Github: {resume.personalInfo.github}
              </Link>
            </View>
          )}
        </View>

        {/* Professional Summary */}
        {resume.summary && (
          <View>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summaryText}>{resume.summary}</Text>
          </View>
        )}

        {/* Skills Summary */}
        {resume.skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Skills Summary</Text>
            {resume.skills.map((skill, idx) => (
              <View key={idx} style={styles.skillItem}>
                <Text style={styles.skillCategory}>{skill.category}</Text>
                <Text style={styles.skillList}>{skill.items.join(", ")}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.experience.map((exp, idx) => (
              <View key={idx} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.companyName}>{exp.company}</Text>
                  <Text style={styles.location}>{exp.location}</Text>
                </View>

                <View style={styles.positionRow}>
                  <Text style={styles.positionTitle}>{exp.position}</Text>
                  <Text style={styles.dateRange}>
                    {exp.startDate} - {exp.endDate || "Present"}
                  </Text>
                </View>

                {exp.achievements.map((achievement, i) => {
                  const parts = achievement.split(/:(.*)/);
                  const hasTitle = parts.length > 1;

                  return (
                    <View key={i} style={styles.achievementItem}>
                      <Text style={styles.achievementBullet}>•</Text>
                      <Text style={styles.achievementText}>
                        {hasTitle ? (
                          <>
                            <Text style={styles.achievementTitle}>
                              {parts[0]}:
                            </Text>
                            {parts[1]}
                          </>
                        ) : (
                          achievement
                        )}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((project, idx) => (
              <View key={idx} style={styles.projectItem}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  {(project.github || project.link) && (
                    <Text style={styles.projectLinks}>
                      {project.github && `[GitHub] `}
                      {project.link && `[Live]`}
                    </Text>
                  )}
                </View>

                {project.description && (
                  <Text style={styles.projectDescription}>
                    {project.description}
                  </Text>
                )}

                {project.highlights.map((highlight, i) => (
                  <View key={i} style={styles.projectHighlight}>
                    <Text style={styles.projectBullet}>•</Text>
                    <Text style={styles.projectHighlightText}>{highlight}</Text>
                  </View>
                ))}

                {project.technologies.length > 0 && (
                  <Text style={styles.techStack}>
                    Tech Stack: {project.technologies.join(", ")}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((edu, idx) => (
              <View key={idx} style={styles.educationItem}>
                <View style={styles.educationHeader}>
                  <Text style={styles.institutionName}>{edu.institution}</Text>
                  <Text style={styles.location}>{edu.location}</Text>
                </View>

                <View style={styles.degreeRow}>
                  <Text style={styles.degreeText}>
                    {edu.degree} in {edu.field}
                  </Text>
                  <Text style={styles.dateRange}>
                    {edu.startDate} - {edu.endDate}
                  </Text>
                </View>

                {edu.gpa && (
                  <Text style={{ fontSize: 10, marginBottom: 3 }}>
                    GPA: {edu.gpa}
                  </Text>
                )}

                {edu.achievements &&
                  edu.achievements.map((achievement, i) => (
                    <View key={i} style={styles.achievementItem}>
                      <Text style={styles.achievementBullet}>•</Text>
                      <Text style={styles.achievementText}>{achievement}</Text>
                    </View>
                  ))}
              </View>
            ))}
          </View>
        )}

        {/* Achievements */}
        {resume.achievements && resume.achievements.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsList}>
              {resume.achievements.map((achievement, idx) => {
                // Parse achievement if formatted as "Label: Description"
                const parts = achievement.split(/:(.*)/);
                const hasLabel = parts.length > 1;

                return (
                  <View key={idx} style={styles.achievementBulletItem}>
                    {hasLabel ? (
                      <>
                        <Text style={styles.achievementLabel}>{parts[0]}</Text>
                        <Text style={styles.achievementDescription}>
                          {parts[1].trim()}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.achievementBullet}>•</Text>
                        <Text style={styles.achievementDescription}>
                          {achievement}
                        </Text>
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((cert, idx) => (
              <View key={idx} style={{ marginBottom: 5 }}>
                <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>
                  {cert.name}
                </Text>
                <Text style={{ fontSize: 10 }}>
                  {cert.issuer} - {cert.date}
                </Text>
                {cert.credentialId && (
                  <Text style={{ fontSize: 9, color: "#666" }}>
                    Credential ID: {cert.credentialId}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
