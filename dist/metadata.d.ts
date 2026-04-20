export type GameFraming = {
    course: string;
    subject?: string;
};
export type GameMetadata = {
    title: string;
    description: string;
    icons: {
        icon: string;
    };
};
export declare const buildGameMetadata: ({ course, subject }: GameFraming) => GameMetadata;
//# sourceMappingURL=metadata.d.ts.map