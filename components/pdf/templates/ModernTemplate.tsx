import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Resume } from "@/types/resume";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  contact: {
    fontSize: 10,
    color: "#666",
    marginBottom: 2,
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 2,
  },
  text: {
    fontSize: 10,
    lineHeight: 1.5,
  },
});

interface ModernTemplateProps {
  resume: Resume;
}

export default function ModernTemplate({ resume }: ModernTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View>
          <Text style={styles.name}>
            {resume.personalInfo.fullName || "Your Name"}
          </Text>
          <Text style={styles.contact}>{resume.personalInfo.email}</Text>
          <Text style={styles.contact}>{resume.personalInfo.phone}</Text>
          <Text style={styles.contact}>{resume.personalInfo.location}</Text>
        </View>

        {/* Summary */}
        {resume.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.text}>{resume.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.experience.map((exp, idx) => (
              <View key={idx} style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                  {exp.position} - {exp.company}
                </Text>
                <Text style={{ fontSize: 9, color: "#666" }}>
                  {exp.startDate} - {exp.endDate || "Present"}
                </Text>
                {exp.achievements.map((achievement, i) => (
                  <Text
                    key={i}
                    style={{ fontSize: 10, marginLeft: 15, marginTop: 2 }}
                  >
                    • {achievement}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {resume.skills.map((skill, idx) => (
              <Text key={idx} style={styles.text}>
                <Text style={{ fontWeight: "bold" }}>{skill.category}:</Text>{" "}
                {skill.items.join(", ")}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
