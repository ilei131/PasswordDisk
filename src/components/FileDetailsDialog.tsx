import React from 'react';

interface FileDetailsDialogProps {
  isOpen: boolean;
  fileInfo: {
    name: string;
    path: string;
    size: number;
    is_directory: boolean;
    modified_time: number;
  } | null;
  onClose: () => void;
}

// 格式化文件大小
const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 格式化时间戳
const formatDate = (timestamp: number): string => {
  if (timestamp === 0) return 'Unknown';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

// 格式化文件路径，移除不必要的前缀并确保格式友好
const formatPath = (path: string): string => {
  if (!path) return '';

  // 处理Windows扩展长度路径前缀
  let formattedPath = path;
  // 检查是否以Windows扩展长度路径前缀开头 (\?
  if (path.length >= 4 && path[0] === '\\' && path[1] === '\\' && path[2] === '?' && path[3] === '\\') {
    formattedPath = path.substring(4);
  }

  // 将所有正斜杠转换为反斜杠（Windows风格）
  formattedPath = formattedPath.replace(/\//g, '\\');

  return formattedPath;
};

export const FileDetailsDialog: React.FC<FileDetailsDialogProps> = ({
  isOpen,
  fileInfo,
  onClose
}) => {
  if (!isOpen || !fileInfo) return null;

  return (
    <div className="file-details-overlay">
      <div className="file-details-dialog">
        <div className="file-details-header">
          <h3>文件详细信息</h3>
          <button className="file-details-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="file-details-content">
          <div className="file-details-row">
            <span className="file-details-label">文件名:</span>
            <span className="file-details-value">{fileInfo.name}</span>
          </div>
          <div className="file-details-row">
            <span className="file-details-label">文件路径:</span>
            <span className="file-details-value file-details-path">{formatPath(fileInfo.path)}</span>
          </div>
          <div className="file-details-row">
            <span className="file-details-label">文件类型:</span>
            <span className="file-details-value">{fileInfo.is_directory ? '目录' : '文件'}</span>
          </div>
          <div className="file-details-row">
            <span className="file-details-label">文件大小:</span>
            <span className="file-details-value">{formatSize(fileInfo.size)}</span>
          </div>
          <div className="file-details-row">
            <span className="file-details-label">修改时间:</span>
            <span className="file-details-value">{formatDate(fileInfo.modified_time)}</span>
          </div>
        </div>
        <div className="file-details-actions">
          <button className="file-details-button" onClick={onClose}>
            确定
          </button>
        </div>
      </div>
    </div>
  );
};
