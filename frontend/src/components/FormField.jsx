import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import { 
  FiEdit2, FiTrash2, FiSave, FiX, 
  FiArrowUp, FiArrowDown, FiPlus,
  FiStar, FiAlignLeft
} from 'react-icons/fi';

const FormField = ({ 
  field, 
  index, 
  moveField, 
  onDelete, 
  onUpdate,
  addField,
  mode = 'builder'
}) => {
  // Always call hooks at the top level
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    label: field.label,
    required: field.required,
    placeholder: field.placeholder || '',
    options: [...(field.options || [])],
    description: field.description || '',
    hidden: field.hidden || false
  });

  // Telephone field state and validation (per field instance)
  const [telephoneValue, setTelephoneValue] = useState(field.value || '');
  const [telephoneError, setTelephoneError] = useState('');

  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: 'field',
    hover(item, monitor) {
      if (!ref.current || mode === 'preview') return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveField(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'field',
    item: { type: 'field', id: field.id, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: () => mode === 'builder'
  });

  drag(drop(ref));

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditValues({
      ...editValues,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Telephone field input handler
  const handleTelephoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); // Only digits
    if (val.length > 10) val = val.slice(0, 10);
    setTelephoneValue(val);
    // Validation: must be 10 digits, start with 6,7,8,9
    if (val.length === 0) {
      setTelephoneError('');
    } else if (val.length < 10) {
      setTelephoneError('Telephone number must be 10 digits');
    } else if (!/^[6-9][0-9]{9}$/.test(val)) {
      setTelephoneError('Telephone number must start with 6, 7, 8, or 9 and be 10 digits');
    } else {
      setTelephoneError('');
    }
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...editValues.options];
    newOptions[idx] = value;
    setEditValues({ ...editValues, options: newOptions });
  };

  const addOption = () => {
    setEditValues({
      ...editValues,
      options: [...editValues.options, `Option ${editValues.options.length + 1}`]
    });
  };

  const removeOption = (idx) => {
    const newOptions = [...editValues.options];
    newOptions.splice(idx, 1);
    setEditValues({ ...editValues, options: newOptions });
  };

  const handleSave = () => {
    if (typeof onUpdate === 'function') {
      onUpdate(field.id, editValues);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValues({
      label: field.label,
      required: field.required,
      placeholder: field.placeholder || '',
      options: [...(field.options || [])],
      description: field.description || '',
      hidden: field.hidden || false
    });
    setIsEditing(false);
  };

  const moveUp = () => {
    if (index > 0 && typeof moveField === 'function') {
      moveField(index, index - 1);
    }
  };

  const moveDown = () => {
    if (typeof moveField === 'function') {
      moveField(index, index + 1);
    }
  };

  const addFieldBelow = (type) => {
    if (typeof addField === 'function') {
      addField(type, index + 1);
    }
  };

  const safeDelete = () => {
    if (typeof onDelete === 'function') {
      onDelete(field.id);
    }
  };

  if (isEditing && mode === 'builder') {
    // Custom edit UI for telephone field: only required and validation
    if (field.type === 'telephone') {
      return (
        <div className="field editing" ref={ref} style={{ opacity: isDragging ? 0 : 1 }}>
          <div className="field-edit-form">
            <label>
              Field Label:
              <input
                type="text"
                name="label"
                value={editValues.label}
                onChange={handleInputChange}
                disabled
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="required"
                checked={editValues.required}
                onChange={handleInputChange}
              />
              Required
            </label>
            {/* Validation info only, not editable */}
            <div style={{marginTop:8, fontSize:'0.95em', color:'#555'}}>
              Validation: Only 10 digits, must start with 6, 7, 8, or 9
            </div>
            <div className="edit-actions">
              <button type="button" onClick={handleSave}>
                <FiSave /> Save
              </button>
              <button type="button" onClick={handleCancel}>
                <FiX /> Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }
    // ...existing code for other field types...
    return (
      <div className="field editing" ref={ref} style={{ opacity: isDragging ? 0 : 1 }}>
        <div className="field-edit-form">
          {/* ...existing code... */}
          <label>
            Field Label:
            <input
              type="text"
              name="label"
              value={editValues.label}
              onChange={handleInputChange}
            />
          </label>

          {field.type !== 'section' && (
            <>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="required"
                  checked={editValues.required}
                  onChange={handleInputChange}
                />
                Required
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="hidden"
                  checked={editValues.hidden}
                  onChange={handleInputChange}
                />
                Hidden (controlled by logic)
              </label>
            </>
          )}

          {field.type !== 'section' && field.type !== 'rating' && (
            <label>
              Placeholder:
              <input
                type="text"
                name="placeholder"
                value={editValues.placeholder}
                onChange={handleInputChange}
              />
            </label>
          )}

          {field.type === 'section' && (
            <label>
              Description:
              <textarea
                name="description"
                value={editValues.description}
                onChange={handleInputChange}
                placeholder="Optional section description"
              />
            </label>
          )}

          {(field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox' || field.type === 'rating') && (
            <div className="options-section">
              <label>Options:</label>
              {editValues.options.map((option, idx) => (
                <div key={idx} className="option-input">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                  />
                  <button type="button" onClick={() => removeOption(idx)} className="remove-option">×</button>
                </div>
              ))}
              <button type="button" onClick={addOption} className="add-option">
                <FiPlus /> Add Option
              </button>
            </div>
          )}

          <div className="edit-actions">
            <button type="button" onClick={handleSave}>
              <FiSave /> Save
            </button>
            <button type="button" onClick={handleCancel}>
              <FiX /> Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (field.type === 'section') {
    return (
      <div className="field section" ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <h3>{field.label}</h3>
        {field.description && <p>{field.description}</p>}
        {mode === 'builder' && (
          <div className="field-actions">
            <button onClick={() => setIsEditing(true)}><FiEdit2 /> Edit</button>
            <button onClick={safeDelete}><FiTrash2 /> Delete</button>
            <button onClick={moveUp} disabled={index === 0}><FiArrowUp /> Up</button>
            <button onClick={moveDown}><FiArrowDown /> Down</button>
          </div>
        )}
      </div>
    );
  }

  // Use 'Telephone Number' as the label for telephone fields
  const displayLabel = field.type === 'telephone' ? 'Telephone Number' : (field.type === 'number' && field.label === 'Number Field' ? 'Contact Number' : field.label);

  return (
    <div className="field" ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div className="field-header">
        <label>
          {displayLabel}
          {field.required && <span className="required">*</span>}
          {field.hidden && <span className="hidden-indicator"> (Hidden)</span>}
        </label>
        {mode === 'builder' && (
          <div className="field-actions">
            <button onClick={() => setIsEditing(true)}><FiEdit2 /> Edit</button>
            <button onClick={safeDelete}><FiTrash2 /> Delete</button>
            <button onClick={moveUp} disabled={index === 0}><FiArrowUp /> Up</button>
            <button onClick={moveDown}><FiArrowDown /> Down</button>
          </div>
        )}
      </div>

      {/* Telephone Number Field with Validation */}
      {field.type === 'telephone' && (
        <div className="contact-field-wrapper">
          <input
            type="text"
            inputMode="numeric"
            maxLength={10}
            value={telephoneValue}
            onChange={handleTelephoneChange}
            placeholder="Enter 10-digit telephone number"
            autoComplete="off"
          />
          {telephoneError && <div className="contact-error" style={{ color: 'red', fontSize: '0.9em' }}>{telephoneError}</div>}
        </div>
      )}

      {/* Render other field types as before */}
      {field.type !== 'telephone' && renderFieldInput(field)}

      {mode === 'builder' && (
        <div className="add-field-below">
          <button className="add-field-btn" onClick={() => addFieldBelow('text')}>
            <FiPlus /> Add Text Field
          </button>
          <button className="add-field-btn" onClick={() => addFieldBelow('section')}>
            <FiAlignLeft /> Add Section
          </button>
        </div>
      )}
    </div>
  );
};

const renderFieldInput = (field) => {
  switch (field.type) {
    case 'textarea':
      return <textarea placeholder={field.placeholder} />;
    case 'dropdown':
      return (
        <select disabled>
          <option value="">Select an option</option>
          {field.options?.map((option, idx) => (
            <option key={idx} value={option}>{option}</option>
          ))}
        </select>
      );
    case 'radio':
      return field.options?.map((option, idx) => (
        <div key={idx} className="radio-option">
          <input type="radio" id={`${field.id}-${idx}`} name={field.id} value={option} />
          <label htmlFor={`${field.id}-${idx}`}>{option}</label>
        </div>
      ));
    case 'checkbox':
      return field.options?.map((option, idx) => (
        <div key={idx} className="checkbox-option">
          <input type="checkbox" id={`${field.id}-${idx}`} name={field.id} value={option} />
          <label htmlFor={`${field.id}-${idx}`}>{option}</label>
        </div>
      ));
    case 'rating':
      return (
        <div className="rating-options">
          {field.options?.map((option, idx) => (
            <span key={idx} className="rating-star"><FiStar /> {option}</span>
          ))}
        </div>
      );
    case 'file':
      return (
        <label className="custom-file-label">
          Choose File
          <input type="file" className="custom-file-input" />
        </label>
      );
    // 'telephone' type is handled in the main render
    default:
      return <input type={field.type} placeholder={field.placeholder} />;
  }
};

FormField.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    required: PropTypes.bool,
    placeholder: PropTypes.string,
    options: PropTypes.array,
    description: PropTypes.string,
    hidden: PropTypes.bool
  }).isRequired,
  index: PropTypes.number.isRequired,
  moveField: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  addField: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['builder', 'preview'])
};

FormField.defaultProps = {
  onDelete: () => console.warn('onDelete function not provided'),
  onUpdate: () => console.warn('onUpdate function not provided'),
  addField: () => console.warn('addField function not provided'),
  moveField: () => console.warn('moveField function not provided'),
  mode: 'builder'
};

export default FormField;