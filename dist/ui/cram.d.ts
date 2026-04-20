import { type CramSession } from '../workflow/cram-mode.js';
type CramTimerProps = {
    session: CramSession;
    className?: string;
};
export declare function CramTimer({ session, className }: CramTimerProps): import("react/jsx-runtime").JSX.Element;
type CramBannerProps = {
    session: CramSession;
    examLabel: string;
    coveredCount?: number;
    totalCount?: number;
    description?: string | null;
    className?: string;
};
export declare function CramBanner({ session, examLabel, coveredCount, totalCount, description, className, }: CramBannerProps): import("react/jsx-runtime").JSX.Element;
export declare const isUrgentCramSession: (session: CramSession, now?: Date) => boolean;
export {};
//# sourceMappingURL=cram.d.ts.map