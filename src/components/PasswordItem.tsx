import React, { useState } from 'react';
import useI18n from '../i18n';

interface PasswordItemProps {
  password: {
    id: string;
    title: string;
    username: string;
    password: string;
    url: string;
    notes: string;
    category: string;
    created_at: number;
    updated_at: number;
  };
  isExpanded: boolean;
  onToggleExpanded: (passwordId: string) => void;
  onCopyPassword: (password: string) => void;
  onEdit: (password: any) => void;
  onDelete: (password: any) => void;
}

const PasswordItem: React.FC<PasswordItemProps> = ({
  password,
  isExpanded,
  onToggleExpanded,
  onCopyPassword,
  onEdit,
  onDelete
}) => {
  const { t } = useI18n();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // 格式化日期
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="password-item">
      <div className="password-item-header">
        <h3>{password.title}</h3>
        <div className="password-item-actions">
          <button
            className="expand-button"
            onClick={() => onToggleExpanded(password.id)}
            aria-label={isExpanded ? '折叠' : '展开'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <button className="edit-button" onClick={() => onEdit(password)}>✏️</button>
          <button className="delete-button" onClick={() => onDelete(password)}>🗑️</button>
        </div>
      </div>
      <div className="password-item-details">
        <div className="detail-row">
          <span className="detail-label">{t('app.username')}:</span>
          <span className="detail-value">{password.username}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">{t('app.password')}:</span>
          <div className="password-value-container">
            <span className="detail-value password-hidden">
              {isPasswordVisible ? password.password : '••••••••'}
            </span>
            <button
              className="toggle-password-button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              aria-label={isPasswordVisible ? '隐藏密码' : '显示密码'}
            >
              {isPasswordVisible ? '👁️‍🗨️' : '👁️'}
            </button>
            <button
              className="copy-password-button"
              onClick={() => onCopyPassword(password.password)}
              aria-label="复制密码"
            >
              📋
            </button>
          </div>
        </div>
        {isExpanded && (
          <>
            {password.url && (
              <div className="detail-row">
                <span className="detail-label">{t('app.url')}:</span>
                <a href={password.url} target="_blank" rel="noopener noreferrer" className="detail-value">
                  {password.url}
                </a>
              </div>
            )}
            {password.notes && (
              <div className="detail-row">
                <span className="detail-label">{t('app.notes')}:</span>
                <span className="detail-value">{password.notes}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">{t('app.category')}:</span>
              <span className="detail-value">{password.category}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{t('app.updated_at')}:</span>
              <span className="detail-value">{formatDate(password.updated_at)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordItem;