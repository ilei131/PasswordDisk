import React from 'react';
import useI18n from '../i18n';

interface PasswordDialogProps {
  isOpen: boolean;
  isEdit: boolean;
  password: {
    id?: string;
    title: string;
    username: string;
    password: string;
    url: string;
    notes: string;
    category: string;
  };
  categories: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  loading: boolean;
  onClose: () => void;
  onSave: () => void;
  onPasswordChange: (field: string, value: string) => void;
  onGeneratePassword: () => void;
}

const PasswordDialog: React.FC<PasswordDialogProps> = ({
  isOpen,
  isEdit,
  password,
  categories,
  loading,
  onClose,
  onSave,
  onPasswordChange,
  onGeneratePassword
}) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3>{isEdit ? t('app.edit_password') : t('app.add_password')}</h3>
        <div className="dialog-content">
          <div className="form-group">
            <label htmlFor="title">{t('app.title')}</label>
            <input
              type="text"
              id="title"
              value={password.title}
              onChange={(e) => onPasswordChange('title', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="username">{t('app.username')}</label>
            <input
              type="text"
              id="username"
              value={password.username}
              onChange={(e) => onPasswordChange('username', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('app.password')}</label>
            <div className="password-input">
              <input
                type="password"
                id="password"
                value={password.password}
                onChange={(e) => onPasswordChange('password', e.target.value)}
              />
              <button
                type="button"
                className="generate-password-button"
                onClick={onGeneratePassword}
              >
                {t('app.generate')}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="url">{t('app.url')}</label>
            <input
              type="text"
              id="url"
              value={password.url}
              onChange={(e) => onPasswordChange('url', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="notes">{t('app.notes')}</label>
            <textarea
              id="notes"
              value={password.notes}
              onChange={(e) => onPasswordChange('notes', e.target.value)}
              rows={3}
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="category">{t('app.category')}</label>
            <select
              id="category"
              value={password.category}
              onChange={(e) => onPasswordChange('category', e.target.value)}
            >
              {categories.filter(cat => cat.name !== '所有').map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="dialog-actions">
          <button
            className="dialog-button cancel"
            onClick={onClose}
          >
            {t('app.cancel')}
          </button>
          <button
            className="dialog-button confirm"
            onClick={onSave}
            disabled={loading}
          >
            {loading ? t('app.saving') : t('app.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordDialog;