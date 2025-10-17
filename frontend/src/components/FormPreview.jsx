
import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from './FormField';

const FormPreview = ({ form = {} }) => {
  const navigate = useNavigate();
  const {
    id = '',
    title = '',
    description = '',
    fields = [],
    settings = {}
  } = form;

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/form/${id}/view`);
  };

  const isFormOpen = () => {
    const now = new Date();
    const openDate = settings.openDate ? new Date(settings.openDate) : null;
    const closeDate = settings.closeDate ? new Date(settings.closeDate) : null;

    if (openDate && openDate > now) return false;
    if (closeDate && closeDate < now) return false;
    return true;
  };

  if (!isFormOpen()) {
    return (
      <div className="form-preview">
        <h2>{title}</h2>
        <p>This form is currently not accepting responses.</p>
        {settings.openDate && new Date(settings.openDate) > new Date() && (
          <p>Will open on {new Date(settings.openDate).toLocaleString()}</p>
        )}
        {settings.closeDate && new Date(settings.closeDate) < new Date() && (
          <p>Closed on {new Date(settings.closeDate).toLocaleString()}</p>
        )}
      </div>
    );
  }

  return (
    <form className="form-preview" onSubmit={handleSubmit}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {(fields || [])
        .filter(field => field && field.id)
        .map((field, index) => (
          <FormField 
            key={field.id} 
            field={field} 
            index={index}
            mode="preview"
            moveField={() => {}}
            onDelete={() => {}}
            onUpdate={() => {}}
            addField={() => {}}
          />
        ))}
      <button type="submit" className="submit-btn">
        Preview Form
      </button>
    </form>
  );
};

export default FormPreview;
