'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { cx } from './utils.js';
export function IdentityFloat({ currentEmail, message, placeholder = 'you@valdosta.edu', description = 'Attach one email so your theme and progress follow you across review games.', saveLabel = 'Save email', updateLabel = 'Update email', anonymousLabel = 'Use anonymous mode', anonymousNote = 'Anonymous mode keeps your theme and progress on this browser only.', className, open, defaultOpen, onOpenChange, requireEmailConfirmation = true, onConfirmEmail, emailConfirmed, onSave, onGoAnonymous, }) {
    const [draftEmail, setDraftEmail] = useState(currentEmail ?? '');
    const [internalOpen, setInternalOpen] = useState(defaultOpen ?? !currentEmail);
    const [internalEmailConfirmed, setInternalEmailConfirmed] = useState(true);
    const [pendingEmail, setPendingEmail] = useState(null);
    const resolvedOpen = open ?? internalOpen;
    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const confirmButtonRef = useRef(null);
    useEffect(() => {
        setDraftEmail(currentEmail ?? '');
    }, [currentEmail]);
    useEffect(() => {
        if (!requireEmailConfirmation) {
            setPendingEmail(null);
            setInternalEmailConfirmed(true);
            return;
        }
        if (!currentEmail) {
            setPendingEmail(null);
            setInternalEmailConfirmed(true);
            return;
        }
        if (typeof emailConfirmed === 'boolean') {
            setPendingEmail(emailConfirmed ? null : currentEmail);
            setInternalEmailConfirmed(emailConfirmed);
            return;
        }
        const stillPending = pendingEmail === currentEmail ? pendingEmail : null;
        setPendingEmail(stillPending);
        setInternalEmailConfirmed(!stillPending);
    }, [currentEmail, emailConfirmed, pendingEmail, requireEmailConfirmation]);
    const setOpen = (next) => {
        if (typeof open !== 'boolean')
            setInternalOpen(next);
        onOpenChange?.(next);
    };
    const confirmationPending = requireEmailConfirmation
        && Boolean(pendingEmail
            && draftEmail.trim() === pendingEmail
            && (typeof emailConfirmed === 'boolean' ? !emailConfirmed : !internalEmailConfirmed));
    useEffect(() => {
        if (!resolvedOpen)
            return;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                if (confirmationPending)
                    return;
                setOpen(false);
                triggerRef.current?.focus();
            }
        };
        const handlePointerDown = (event) => {
            if (!containerRef.current)
                return;
            if (event.target instanceof Node && containerRef.current.contains(event.target))
                return;
            setOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('pointerdown', handlePointerDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('pointerdown', handlePointerDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [confirmationPending, resolvedOpen]);
    useEffect(() => {
        if (!resolvedOpen || !confirmationPending)
            return;
        confirmButtonRef.current?.focus();
    }, [confirmationPending, resolvedOpen]);
    const trimmedDraft = draftEmail.trim();
    const isDirty = trimmedDraft !== (currentEmail ?? '');
    const canSubmit = isDirty && trimmedDraft.length > 0;
    useEffect(() => {
        if (!pendingEmail)
            return;
        if (!draftEmail.trim() || draftEmail.trim() === pendingEmail)
            return;
        setPendingEmail(null);
        if (typeof emailConfirmed !== 'boolean') {
            setInternalEmailConfirmed(true);
        }
    }, [draftEmail, emailConfirmed, pendingEmail]);
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!canSubmit)
            return;
        try {
            await onSave(trimmedDraft);
            if (!requireEmailConfirmation) {
                if (typeof emailConfirmed !== 'boolean') {
                    setInternalEmailConfirmed(true);
                }
                setPendingEmail(null);
                return;
            }
            if (typeof emailConfirmed !== 'boolean') {
                setInternalEmailConfirmed(false);
            }
            setPendingEmail(trimmedDraft);
        }
        catch {
            // Consumers surface the visible error state via `message`.
        }
    };
    const primaryLabel = currentEmail && isDirty ? updateLabel : saveLabel;
    const triggerStatus = currentEmail ?? 'Anonymous';
    const handleConfirmEmail = async () => {
        if (!pendingEmail)
            return;
        try {
            await onConfirmEmail?.(pendingEmail);
            if (typeof emailConfirmed !== 'boolean') {
                setInternalEmailConfirmed(true);
            }
            setPendingEmail(null);
        }
        catch {
            // Consumers surface the visible error state via `message`.
        }
    };
    return (_jsxs(motion.div, { ref: containerRef, layout: true, transition: { type: 'spring', stiffness: 420, damping: 36 }, className: cx('rg-card rg-identity-float', !resolvedOpen && 'is-collapsed', className), "aria-label": "Learner association", children: [_jsxs(motion.button, { layout: true, ref: triggerRef, type: "button", className: cx('rg-identity-float__toggle', !currentEmail && 'is-anonymous'), "aria-expanded": resolvedOpen, "aria-label": `Learner: ${triggerStatus}. ${resolvedOpen ? 'Close' : 'Open'} learner association.`, onClick: () => setOpen(!resolvedOpen), children: [_jsx("span", { className: "rg-identity-float__icon", "aria-hidden": "true", children: "\u2709" }), resolvedOpen ? _jsx("span", { children: triggerStatus }) : null] }), message && resolvedOpen ? _jsx("p", { className: "rg-note", role: "status", children: message }) : null, _jsx(AnimatePresence, { initial: false, children: resolvedOpen ? (_jsxs(motion.form, { layout: true, initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 }, className: "rg-identity-float__panel", onSubmit: handleSubmit, noValidate: true, children: [_jsx("p", { className: "rg-kicker", children: "Learner association" }), _jsx("p", { className: "rg-note", children: description }), confirmationPending && pendingEmail ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "rg-identity-float__confirm", role: "group", "aria-label": "Confirm saved email", children: [_jsxs("p", { className: "rg-note", children: ["Is ", pendingEmail, " correct?"] }), _jsxs("div", { className: "rg-button-row", children: [_jsx("button", { ref: confirmButtonRef, type: "button", className: "rg-button rg-button--primary", onClick: () => void handleConfirmEmail(), children: "Yes, save" }), _jsx("button", { type: "button", className: "rg-button rg-button--secondary", onClick: () => {
                                                        const currentPendingEmail = pendingEmail;
                                                        setDraftEmail(currentPendingEmail);
                                                        requestAnimationFrame(() => {
                                                            const input = containerRef.current?.querySelector('input[name=\"email\"]');
                                                            input?.focus();
                                                        });
                                                    }, children: "Edit" })] })] }), _jsxs("p", { role: "status", "aria-live": "polite", style: {
                                        position: 'absolute',
                                        width: '1px',
                                        height: '1px',
                                        padding: 0,
                                        margin: '-1px',
                                        overflow: 'hidden',
                                        clip: 'rect(0, 0, 0, 0)',
                                        whiteSpace: 'nowrap',
                                        border: 0,
                                    }, children: ["Saved ", pendingEmail, ". Confirm it's correct."] })] })) : null, _jsx("input", { className: "rg-input", type: "email", name: "email", autoComplete: "email", value: draftEmail, onChange: (event) => setDraftEmail(event.target.value), placeholder: placeholder, "aria-label": "Learner email" }), _jsxs("div", { className: "rg-button-row", children: [_jsx("button", { type: "submit", className: "rg-button rg-button--primary", disabled: !canSubmit, children: primaryLabel }), _jsx("button", { type: "button", className: "rg-button rg-button--secondary", onClick: () => void onGoAnonymous(), children: anonymousLabel })] }), _jsx("p", { className: "rg-note", children: currentEmail ? `Active learner: ${currentEmail}` : anonymousNote })] }, "panel")) : null })] }));
}
//# sourceMappingURL=identity-float.js.map