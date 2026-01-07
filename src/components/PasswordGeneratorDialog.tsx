import React from 'react';
import useI18n from '../i18n';

interface PasswordGeneratorDialogProps {
  isOpen: boolean;
  generatedPassword: string;
  settings: {
    length: number;
    includeUppercase: boolean;
    includeLowercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;
  };
  loading: boolean;
  onClose: () => void;
  onGenerate: () => void;
  onUsePassword: () => void;
  onSettingsChange: (key: string, value: any) => void;
}

const PasswordGeneratorDialog: React.FC<PasswordGeneratorDialogProps> = ({
  isOpen,
  generatedPassword,
  settings,
  loading,
  onClose,
  onGenerate,
  onUsePassword,
  onSettingsChange
}) => {
  const { t } = useI18n();
  
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3>{t('app.password_generator')}</h3>
        <div className="dialog-content">
          <div className="form-group">
            <label htmlFor="password-length">{t('app.length')}: {settings.length}</label>
            <input
              type="range"
              id="password-length"
              min="6"
              max="128"
              value={settings.length}
              onChange={(e) => onSettingsChange('length', parseInt(e.target.value))}
            />
          </div>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.includeUppercase}
                onChange={(e) => onSettingsChange('includeUppercase', e.target.checked)}
              />
              {t('app.include_uppercase')}
            </label>
          </div>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.includeLowercase}
                onChange={(e) => onSettingsChange('includeLowercase', e.target.checked)}
              />
              {t('app.include_lowercase')}
            </label>
          </div>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.includeNumbers}
                onChange={(e) => onSettingsChange('includeNumbers', e.target.checked)}
              />
              {t('app.include_numbers')}
            </label>
          </div>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.includeSymbols}
                onChange={(e) => onSettingsChange('includeSymbols', e.target.checked)}
              />
              {t('app.include_symbols')}
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="generated-password">{t('app.generated_password')}:</label>
            <div className="password-display">
              <input
                type="text"
                id="generated-password"
                value={generatedPassword}
                readOnly
              />
              <button
                type="button"
                className="copy-button"
                onClick={() => navigator.clipboard.writeText(generatedPassword)}
              >
                📋
              </button>
            </div>
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
            className="dialog-button"
            onClick={onGenerate}
            disabled={loading}
          >
            {t('app.generate_password')}
          </button>
          <button
            className="dialog-button confirm"
            onClick={onUsePassword}
          >
            {t('app.use_this_password')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordGeneratorDialog;