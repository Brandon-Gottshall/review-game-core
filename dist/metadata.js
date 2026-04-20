export const buildGameMetadata = ({ course, subject }) => {
    const courseLabel = `${course}${subject ? ` ${subject}` : ''}`.trim();
    return {
        title: `${courseLabel} — Concept Mastery`,
        description: `Guided concept mastery for ${courseLabel} — learn, prove, and retain every topic.`,
        icons: {
            icon: '/icon.svg',
        },
    };
};
//# sourceMappingURL=metadata.js.map