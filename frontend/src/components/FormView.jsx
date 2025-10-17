import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const FormView = ({ form = {}, onSubmit }) => {
  const { formId } = useParams();
  const [formData, setFormData] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    if (errors[fieldId]) {
      const newErrors = { ...errors };
      delete newErrors[fieldId];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    (form.fields || []).forEach(field => {
      const value = formData[field.id];
      if (field?.required && !value) {
        newErrors[field.id] = 'This field is required';
      } else if (field.type === 'telephone') {
        if (value && value.length !== 10) {
          newErrors[field.id] = 'Telephone number must be exactly 10 digits';
        } else if (value && !/^[6-9][0-9]{9}$/.test(value)) {
          newErrors[field.id] = 'Telephone number must start with 6, 7, 8, or 9 and be 10 digits';
        }
      } else if (field.label && field.label.toLowerCase().includes('email')) {
        // Email validation: must end with @gmail.com
        if (value && (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(value))) {
          newErrors[field.id] = 'Not a valid email address';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formId, formData);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    // If redirect is enabled and URL is set, auto-redirect
    if (form.settings?.redirectEnabled && form.settings?.redirectUrl) {
      setTimeout(() => {
        window.location.href = form.settings.redirectUrl;
      }, 2000); // 2 second delay for UX
      return (
        <div className="confirmation-message">
          <h2>Redirecting...</h2>
          <p>You will be redirected shortly.</p>
        </div>
      );
    }
    // Otherwise, show thank you message
    return (
      <div className="confirmation-message">
        <h2>Thank You!</h2>
        <p>{form.settings?.confirmationMessage || 'Your response has been recorded.'}</p>
        <button className="back-to-form" onClick={() => window.location.reload()}>
          Submit Another Response
        </button>
      </div>
    );
  }

  return (
    <form className="form-view-container" onSubmit={handleSubmit}>
      <div className="form-view-header">
        <h1 className="form-view-title">{form.title}</h1>
        {form.description && <p className="form-view-desc">{form.description}</p>}
      </div>

      {(form.fields || []).map((field, index) => {
        if (!field || typeof field !== 'object' || !field.id || !field.label) {
          console.warn(`Skipping invalid field at index ${index}`, field);
          return null;
        }

        // If the field label is 'Number Field', change it to 'Contact Number' for display
        const displayLabel = field.label && field.label.trim().toLowerCase() === 'number field' ? 'Contact Number' : field.label;
        return (
          <div key={field.id} className="form-view-field">
            <label>
              {displayLabel}
              {field.required && <span className="required">*</span>}
            </label>
            {renderFieldInput(field, handleChange, formData[field.id] || '')}
            {errors[field.id] && <div className="error-message">{errors[field.id]}</div>}
          </div>
        );
      })}

      <button type="submit" className="form-view-submit submit-btn">
        Submit
      </button>
    </form>
  );
};

const renderFieldInput = (field, handleChange, value) => {
  const onChange = (e) => {
    if (field.type === 'checkbox') {
      const checked = e.target.checked;
      const val = e.target.value;
      const current = Array.isArray(value) ? value : [];
      const updated = checked ? [...current, val] : current.filter(v => v !== val);
      handleChange(field.id, updated);
    } else if (field.type === 'telephone') {
      // Only allow digits, max 10
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 10) val = val.slice(0, 10);
      handleChange(field.id, val);
    } else {
      handleChange(field.id, e.target.value);
    }
  };

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          placeholder={field.placeholder}
          required={field.required}
          value={value}
          onChange={onChange}
        />
      );
    case 'dropdown':
      return (
        <select required={field.required} value={value} onChange={onChange}>
          <option value="">Select an option</option>
          {(field.options || []).map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
      );
    case 'radio':
      return (
        <div className="radio-group">
          {(field.options || []).map((opt, i) => (
            <label key={i}>
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                required={field.required}
                onChange={onChange}
              />
              {opt}
            </label>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <div className="checkbox-group">
          {(field.options || []).map((opt, i) => (
            <label key={i}>
              <input
                type="checkbox"
                value={opt}
                checked={Array.isArray(value) && value.includes(opt)}
                onChange={onChange}
              />
              {opt}
            </label>
          ))}
        </div>
      );
    case 'telephone':
      return (
        <input
          type="text"
          inputMode="numeric"
          maxLength={10}
          placeholder={field.placeholder || 'Enter 10-digit telephone number'}
          required={field.required}
          value={value}
          onChange={onChange}
        />
      );
    default:
      return (
        <input
          type={field.type || 'text'}
          placeholder={field.placeholder}
          required={field.required}
          value={value}
          onChange={onChange}
        />
      );
  }
};

export default FormView;
