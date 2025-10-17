import React from 'react';
import { FiFileText, FiTrash2, FiCopy, FiPlus, FiShare2 } from 'react-icons/fi';

const FormTemplates = ({
  templates,
  forms,
  onUseTemplate,
  onCreateNew,
  onDelete,
  onShare,
  onSelectForm
}) => {
  // Defensive: always use arrays
  const safeTemplates = Array.isArray(templates) ? templates : [];
  const safeForms = Array.isArray(forms) ? forms : [];
  return (
    <div className="templates-container">
      <div className="templates-header">
        <h1 className="templates-title">Form Templates</h1>
      </div>

      <div className="templates-grid">
        {safeTemplates.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', margin: '2rem 0' }}>
            No templates available.
          </div>
        ) : (
          safeTemplates.map((template) => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => onUseTemplate(template)}
            >
              <div className="template-image">
                <FiFileText size={48} />
              </div>
              <div className="template-info">
                <div className="template-name">{template.name}</div>
                <div className="template-desc">{template.description}</div>
                <button className="use-template-btn">Use Template</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="my-forms-section">
        <h2 className="my-forms-title">My Forms</h2>
        <div className="create-form-wrapper">
          <button className="create-form-btn" onClick={onCreateNew}>
            <FiPlus /> Create New Form
          </button>
        </div>
      </div>

      <div className="forms-list">
        {safeForms.map((form) => (
          <div key={form.id} className="form-card fade-in">
            <div className="form-card-header">
              <div>
                <div className="form-card-title">{form.title}</div>
                <div className="form-card-desc">
                  {form.description || 'No description'}
                </div>
              </div>
              <div className="form-responses-count">
                {Array.isArray(form.responses) ? form.responses.length : 0} responses
              </div>
            </div>
            <div className="form-card-actions">
              <button
                className="form-action-btn edit"
                onClick={() => onSelectForm(form)}
              >
                <FiFileText /> Edit
              </button>
              <button
                className="form-action-btn share"
                onClick={() => onShare(form)}
              >
                <FiShare2 /> Share
              </button>
              <button
                className="form-action-btn delete"
                onClick={() => onDelete(form.id)}
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormTemplates;
