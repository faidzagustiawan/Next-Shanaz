'use client';

/**
 * Generic Modal. Tutup dengan prop onClose.
 * Props: title, subtitle, children, actions, onClose
 */
export function Modal({ title, subtitle, children, actions, onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal-box">
        {title && <div className="modal-title">{title}</div>}
        {subtitle && <div className="modal-sub">{subtitle}</div>}
        {children && <div className="modal-form">{children}</div>}
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}
