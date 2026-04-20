type IdentityFloatProps = {
    currentEmail?: string | null;
    message?: string | null;
    placeholder?: string;
    description?: string;
    saveLabel?: string;
    updateLabel?: string;
    anonymousLabel?: string;
    anonymousNote?: string;
    className?: string;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    requireEmailConfirmation?: boolean;
    onConfirmEmail?: (email: string) => void | Promise<void>;
    emailConfirmed?: boolean;
    onSave: (email: string) => void | Promise<void>;
    onGoAnonymous: () => void | Promise<void>;
};
export declare function IdentityFloat({ currentEmail, message, placeholder, description, saveLabel, updateLabel, anonymousLabel, anonymousNote, className, open, defaultOpen, onOpenChange, requireEmailConfirmation, onConfirmEmail, emailConfirmed, onSave, onGoAnonymous, }: IdentityFloatProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=identity-float.d.ts.map