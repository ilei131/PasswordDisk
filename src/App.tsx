import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import "./App.css";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { Toast } from './components/Toast';
import PasswordDialog from './components/PasswordDialog';
import PasswordGeneratorDialog from './components/PasswordGeneratorDialog';
import CategoryDialog from './components/CategoryDialog';
import PasswordItem from './components/PasswordItem';
import useI18n from './i18n';

// 类型定义
interface PasswordItem {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  category: string;
  created_at: number;
  updated_at: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

function App() {
  // 国际化
  const { t, language, changeLanguage } = useI18n();

  // 语言下拉菜单状态
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  // 认证状态
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // 密码和分类数据
  const [passwords, setPasswords] = useState<PasswordItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('所有');
  const [searchTerm, setSearchTerm] = useState('');

  // 对话框状态
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [generatorDialogOpen, setGeneratorDialogOpen] = useState(false);
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState<PasswordItem | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '📁' });
  const [deleteType, setDeleteType] = useState<'password' | 'category'>('password');

  // 密码项展开状态
  const [expandedPasswords, setExpandedPasswords] = useState<Record<string, boolean>>({});

  // 新增/编辑密码表单
  const [newPassword, setNewPassword] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
    category: '个人'
  });

  // 密码生成器设置
  const [generatorSettings, setGeneratorSettings] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true
  });

  // 自定义提示框状态
  const [customAlert, setCustomAlert] = useState({
    isOpen: false,
    message: '',
  });

  // 验证主密码
  const handleMasterPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        // 注册逻辑
        if (masterPassword !== confirmPassword) {
          setError('两次输入的密码不一致');
          return;
        }

        // 初始化密码库
        const initialized = await invoke<boolean>("initialize_vault", { masterPassword: masterPassword });
        if (initialized) {
          setIsAuthenticated(true);
          await loadPasswordsAndCategories();
        } else {
          setError('初始化密码库失败');
        }
      } else {
        // 登录逻辑
        const result = await invoke<boolean>("verify_master_password", { masterPassword: masterPassword });

        if (result) {
          setIsAuthenticated(true);
          await loadPasswordsAndCategories();
        } else {
          setError('密码验证失败');
        }
      }
    } catch (err) {
      console.error('认证错误:', err);
      setError(`认证失败，请重试: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // 加载密码和分类
  const loadPasswordsAndCategories = async () => {
    setLoading(true);
    try {
      const [passwordsResult, categoriesResult] = await Promise.all([
        invoke<PasswordItem[]>("get_passwords", { masterPassword: masterPassword }),
        invoke<Category[]>("get_categories")
      ]);
      setPasswords(passwordsResult);
      setCategories(categoriesResult);
    } catch (err) {
      console.error('加载数据失败:', err);
      setError('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 过滤密码
  const filteredPasswords = passwords.filter(password => {
    const matchesCategory = selectedCategory === '所有' || password.category === selectedCategory;
    const matchesSearch = !searchTerm ||
      password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.url.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 复制密码到剪贴板
  const copyPassword = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCustomAlert({
        isOpen: true,
        message: '密码已复制到剪贴板'
      });
    } catch (err) {
      console.error('复制失败:', err);
      setCustomAlert({
        isOpen: true,
        message: '复制失败，请手动复制'
      });
    }
  };

  // 打开添加密码对话框
  const openAddDialog = () => {
    setCurrentPassword(null);
    setNewPassword({
      title: '',
      username: '',
      password: '',
      url: '',
      notes: '',
      category: selectedCategory === '所有' ? '个人' : selectedCategory
    });
    setAddDialogOpen(true);
  };

  // 打开编辑密码对话框
  const openEditDialog = (password: PasswordItem) => {
    setCurrentPassword(password);
    setNewPassword({
      title: password.title,
      username: password.username,
      password: password.password,
      url: password.url,
      notes: password.notes,
      category: password.category
    });
    setEditDialogOpen(true);
  };

  // 打开删除密码对话框
  const openDeleteDialog = (password: PasswordItem) => {
    setCurrentPassword(password);
    setDeleteType('password');
    setDeleteDialogOpen(true);
  };

  // 生成密码
  const generatePassword = async () => {
    try {
      const result = await invoke<string>("generate_password", {
        length: generatorSettings.length,
        includeUppercase: generatorSettings.includeUppercase,
        includeLowercase: generatorSettings.includeLowercase,
        includeNumbers: generatorSettings.includeNumbers,
        includeSymbols: generatorSettings.includeSymbols
      });
      setNewPassword({ ...newPassword, password: result });
    } catch (err) {
      console.error('生成密码失败:', err);
      setCustomAlert({
        isOpen: true,
        message: '生成密码失败'
      });
    }
  };

  // 保存密码
  const savePassword = async () => {
    setLoading(true);

    try {
      if (currentPassword) {
        // 更新现有密码
        const updatedPassword = await invoke<PasswordItem>("update_password", {
          password: {
            ...currentPassword,
            ...newPassword
          },
          masterPassword: masterPassword
        });
        setPasswords(prev => prev.map(p => p.id === updatedPassword.id ? updatedPassword : p));
        setEditDialogOpen(false);
      } else {
        // 添加新密码
        const newPasswordItem = await invoke<PasswordItem>("add_password", {
          password: newPassword,
          masterPassword: masterPassword
        });
        setPasswords(prev => [...prev, newPasswordItem]);
        setAddDialogOpen(false);
      }

      setCustomAlert({
        isOpen: true,
        message: currentPassword ? '密码已更新' : '密码已添加'
      });
    } catch (err) {
      console.error('保存密码失败:', err);
      setError('保存密码失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除密码
  const deletePassword = async () => {
    if (!currentPassword) return;

    setLoading(true);

    try {
      await invoke<boolean>("delete_password", { id: currentPassword.id });
      setPasswords(prev => prev.filter(p => p.id !== currentPassword.id));
      setDeleteDialogOpen(false);
      setCustomAlert({
        isOpen: true,
        message: '密码已删除'
      });
    } catch (err) {
      console.error('删除密码失败:', err);
      setError('删除密码失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加分类
  const addCategory = async () => {
    if (!newCategory.name.trim()) return;

    // 检测分类名称是否已存在
    const isNameExists = categories.some(category => category.name === newCategory.name.trim());
    if (isNameExists) {
      setError('分类名称已存在');
      return;
    }

    setLoading(true);

    try {
      const addedCategory = await invoke<Category>("add_category", {
        category: { ...newCategory, id: '' }
      });
      setCategories(prev => [...prev, addedCategory]);
      setAddCategoryDialogOpen(false);
      setNewCategory({ name: '', icon: '📁' });
      setCustomAlert({
        isOpen: true,
        message: '分类已添加'
      });
    } catch (err) {
      console.error('添加分类失败:', err);
      setError('添加分类失败');
    } finally {
      setLoading(false);
    }
  };

  // 编辑分类
  const editCategory = async () => {
    if (!currentCategory || !newCategory.name.trim()) return;

    // 检测分类名称是否已存在（排除当前分类）
    const isNameExists = categories.some(category =>
      category.name === newCategory.name.trim() && category.id !== currentCategory.id
    );
    if (isNameExists) {
      setError('分类名称已存在');
      return;
    }

    setLoading(true);

    try {
      const updatedCategory = await invoke<Category>("update_category", {
        category: {
          id: currentCategory.id,
          ...newCategory
        }
      });
      setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
      setEditCategoryDialogOpen(false);
      setCurrentCategory(null);
      setCustomAlert({
        isOpen: true,
        message: '分类已更新'
      });
    } catch (err) {
      console.error('编辑分类失败:', err);
      setError('编辑分类失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除分类
  const deleteCategory = async () => {
    console.log('deleteCategory 函数被调用');
    console.log('currentCategory:', currentCategory);

    if (!currentCategory) {
      console.log('currentCategory 为 null，函数提前返回');
      return;
    }

    // 检查是否有密码属于该分类
    const hasPasswordsInCategory = passwords.some(password => password.category === currentCategory.name);
    console.log('hasPasswordsInCategory:', hasPasswordsInCategory);

    if (hasPasswordsInCategory) {
      console.log('该分类下还有密码，无法删除');
      setCustomAlert({
        isOpen: true,
        message: '该分类下还有密码，无法删除'
      });
      return;
    }

    setLoading(true);
    console.log('开始调用后端 delete_category');

    try {
      const result = await invoke<boolean>("delete_category", { id: currentCategory.id });
      console.log('后端 delete_category 调用结果:', result);

      setCategories(prev => prev.filter(c => c.id !== currentCategory.id));

      // 检查是否正在查看已删除的分类，如果是则切换到'所有'分类
      if (selectedCategory === currentCategory.name) {
        setSelectedCategory('所有');
      }

      setDeleteDialogOpen(false);
      setCurrentCategory(null);
      setCustomAlert({
        isOpen: true,
        message: '分类已删除'
      });
      console.log('分类删除成功');
    } catch (err) {
      console.error('删除分类失败:', err);
      setError('删除分类失败');
    } finally {
      setLoading(false);
      console.log('删除分类操作完成');
    }
  };

  // 打开添加分类对话框
  const openAddCategoryDialog = () => {
    setNewCategory({ name: '', icon: '📁' });
    setAddCategoryDialogOpen(true);
  };

  // 打开编辑分类对话框
  const openEditCategoryDialog = (category: Category) => {
    setCurrentCategory(category);
    setNewCategory({ name: category.name, icon: category.icon });
    setEditCategoryDialogOpen(true);
  };

  // 打开删除分类对话框
  const openDeleteCategoryDialog = (category: Category) => {
    setCurrentCategory(category);
    setDeleteType('category');
    setDeleteDialogOpen(true);
  };

  // 切换密码项展开状态
  const togglePasswordExpanded = (passwordId: string) => {
    setExpandedPasswords(prev => ({
      ...prev,
      [passwordId]: !prev[passwordId]
    }));
  };

  // 认证界面
  if (!isAuthenticated) {
    return (
      <div className="app">
        <div className="auth-container">
          <div className="auth-language-selector">
            <div className="language-dropdown">
              <button
                className="language-dropdown-button"
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
              >
                {language === 'zh' ? '中文' : 'English'}
                <span className="dropdown-arrow">▼</span>
              </button>
              {languageDropdownOpen && (
                <div className="language-dropdown-menu">
                  <button
                    className={`language-dropdown-item ${language === 'zh' ? 'active' : ''}`}
                    onClick={() => {
                      changeLanguage('zh');
                      setLanguageDropdownOpen(false);
                    }}
                  >
                    {t('language.chinese')}
                  </button>
                  <button
                    className={`language-dropdown-item ${language === 'en' ? 'active' : ''}`}
                    onClick={() => {
                      changeLanguage('en');
                      setLanguageDropdownOpen(false);
                    }}
                  >
                    {t('language.english')}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="auth-card">
            <div className="auth-header">
              <h1>{t('app.title')}</h1>
              <p>{t('app.description')}</p>
            </div>
            <div className="auth-form">
              <h2>{isRegistering ? t('app.master_password') : t('app.master_password')}</h2>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleMasterPasswordSubmit}>
                <div className="form-group">
                  <label htmlFor="master-password">{t('app.master_password')}</label>
                  <div className="password-input">
                    <input
                      type={showMasterPassword ? 'text' : 'password'}
                      id="master-password"
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowMasterPassword(!showMasterPassword)}
                    >
                      {showMasterPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                {isRegistering && (
                  <div className="form-group">
                    <label htmlFor="confirm-password">{t('app.confirm_password')}</label>
                    <div className="password-input">
                      <input
                        type={showMasterPassword ? 'text' : 'password'}
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}
                <button type="submit" className="auth-button" disabled={loading}>
                  {loading ? (isRegistering ? t('app.creating') : t('app.logging_in')) : (isRegistering ? t('app.register') : t('app.login'))}
                </button>
              </form>
              <div className="auth-toggle">
                {isRegistering ? (
                  <>
                    {t('app.first_time')}
                    <button
                      type="button"
                      className="toggle-link"
                      onClick={() => {
                        setIsRegistering(false);
                        setConfirmPassword('');
                        setError('');
                      }}
                    >
                      {t('app.login')}
                    </button>
                  </>
                ) : (
                  <>
                    {t('app.first_time')}
                    <button
                      type="button"
                      className="toggle-link"
                      onClick={() => {
                        setIsRegistering(true);
                        setConfirmPassword('');
                        setError('');
                      }}
                    >
                      {t('app.register')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 主应用界面
  return (
    <div className="app">
      <header className="app-header">
        <h1>{t('app.title')}</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder={t('app.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="search-clear-button"
              onClick={() => setSearchTerm('')}
              aria-label="清除搜索"
            >
              ×
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="loading-overlay">
          <div className="loading">
            <div className="loading-spinner"></div>
            <div>{t('app.loading')}</div>
          </div>
        </div>
      ) : (
        <main className="app-main">
          <div className="sidebar">
            <div className="sidebar-header">
              <h2>{t('app.categories')}</h2>
              <button className="add-category-button" onClick={openAddCategoryDialog}>
                +
              </button>
            </div>
            <div className="categories-list">
              {categories.map((category) => (
                <div key={category.id} className="category-item-wrapper">
                  <button
                    className={`category-item ${selectedCategory === category.name ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                  {category.name !== '所有' && (
                    <div className="category-actions">
                      <button className="category-action-button" onClick={() => openEditCategoryDialog(category)}>
                        ✏️
                      </button>
                      <button className="category-action-button" onClick={() => openDeleteCategoryDialog(category)}>
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button className="add-password-button" onClick={openAddDialog}>
              + {t('app.add_password')}
            </button>
          </div>

          <div className="content">
            <div className="content-header">
              <h2>{selectedCategory}{t('app.password')}</h2>
            </div>

            {filteredPasswords.length > 0 ? (
              <div className="passwords-list">
                {filteredPasswords.map((password) => {
                  const isExpanded = expandedPasswords[password.id] || false;
                  return (
                    <PasswordItem
                      key={password.id}
                      password={password}
                      isExpanded={isExpanded}
                      onToggleExpanded={togglePasswordExpanded}
                      onCopyPassword={copyPassword}
                      onEdit={openEditDialog}
                      onDelete={openDeleteDialog}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <p>{t('app.no_passwords')}</p>
                <button className="add-first-password" onClick={openAddDialog}>
                  + {t('app.add_first_password')}
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {/* 添加/编辑密码对话框 */}
      <PasswordDialog
        isOpen={addDialogOpen || editDialogOpen}
        isEdit={editDialogOpen}
        password={newPassword}
        categories={categories}
        loading={loading}
        onClose={() => {
          setAddDialogOpen(false);
          setEditDialogOpen(false);
        }}
        onSave={savePassword}
        onPasswordChange={(field, value) => {
          setNewPassword({ ...newPassword, [field]: value });
        }}
        onGeneratePassword={() => setGeneratorDialogOpen(true)}
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title={deleteType === 'password' ? t('app.delete_password') : t('app.delete_category')}
        message={deleteType === 'password' && currentPassword ? t('app.confirm_delete_password', { title: currentPassword.title }) : deleteType === 'category' && currentCategory ? t('app.confirm_delete_category', { name: currentCategory.name }) : ''}
        onConfirm={deleteType === 'password' ? deletePassword : deleteCategory}
        onCancel={() => setDeleteDialogOpen(false)}
        okLabel={t('app.delete')}
        cancelLabel={t('app.cancel')}
      />

      {/* 密码生成器对话框 */}
      <PasswordGeneratorDialog
        isOpen={generatorDialogOpen}
        generatedPassword={newPassword.password}
        settings={generatorSettings}
        loading={loading}
        onClose={() => setGeneratorDialogOpen(false)}
        onGenerate={generatePassword}
        onUsePassword={() => setGeneratorDialogOpen(false)}
        onSettingsChange={(key, value) => setGeneratorSettings({ ...generatorSettings, [key]: value })}
      />

      {/* 添加分类对话框 */}
      <CategoryDialog
        isOpen={addCategoryDialogOpen}
        isEdit={false}
        category={newCategory}
        loading={loading}
        error={error}
        onClose={() => {
          setAddCategoryDialogOpen(false);
          setError('');
        }}
        onSave={addCategory}
        onCategoryChange={(field, value) => setNewCategory({ ...newCategory, [field]: value })}
      />

      {/* 编辑分类对话框 */}
      <CategoryDialog
        isOpen={editCategoryDialogOpen}
        isEdit={true}
        category={newCategory}
        loading={loading}
        error={error}
        onClose={() => {
          setEditCategoryDialogOpen(false);
          setCurrentCategory(null);
          setError('');
        }}
        onSave={editCategory}
        onCategoryChange={(field, value) => setNewCategory({ ...newCategory, [field]: value })}
      />

      {/* Toast提示 */}
      <Toast
        isOpen={customAlert.isOpen}
        message={customAlert.message}
        onClose={() => setCustomAlert({ isOpen: false, message: '' })}
      />
    </div>
  );
};

export default App;