import React from 'react';
import useI18n from '../i18n';

interface CategoryDialogProps {
  isOpen: boolean;
  isEdit: boolean;
  category: {
    id?: string;
    name: string;
    icon: string;
  };
  loading: boolean;
  error?: string;
  onClose: () => void;
  onSave: () => void;
  onCategoryChange: (field: string, value: string) => void;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  isOpen,
  isEdit,
  category,
  loading,
  error,
  onClose,
  onSave,
  onCategoryChange
}) => {
  const { t } = useI18n();
  
  if (!isOpen) return null;

  // 常见图标选项
  const iconOptions = [
    { value: '📁', label: t('app.folder') },
    { value: '🏠', label: t('app.personal') },
    { value: '💼', label: t('app.work') },
    { value: '💰', label: t('app.finance') },
    { value: '🎯', label: t('app.important') },
    { value: '🔒', label: t('app.security') },
    { value: '📱', label: t('app.mobile') },
    { value: '💻', label: t('app.computer') },
    { value: '🌐', label: t('app.website') },
    { value: '🎨', label: t('app.design') },
    { value: '📚', label: t('app.learning') },
    { value: '🎵', label: t('app.entertainment') },
    { value: '📷', label: t('app.media') },
    { value: '✈️', label: t('app.travel') },
    { value: '🍽️', label: t('app.life') },
    { value: '🚗', label: t('app.transportation') },
    { value: '🏥', label: t('app.health') },
    { value: '📝', label: t('app.notes') }
  ];

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3>{isEdit ? t('app.edit_category') : t('app.add_category')}</h3>
        <div className="dialog-content">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="category-name">{t('app.category_name')}</label>
            <input
              type="text"
              id="category-name"
              value={category.name}
              onChange={(e) => onCategoryChange('name', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="category-icon">{t('app.category_icon')}</label>
            <div className="icon-selector">
              <select
                id="category-icon"
                value={category.icon}
                onChange={(e) => onCategoryChange('icon', e.target.value)}
                required
                className="icon-select"
              >
                {iconOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value} {option.label}
                  </option>
                ))}
              </select>
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

export default CategoryDialog;