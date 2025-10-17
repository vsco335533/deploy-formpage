import React, { useCallback, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { FiSave, FiShare2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import FormField from './FormField';

const FormBuilder = ({ form = {}, setLocalForm, updateForm, addField, onShare, navigate }) => {
  const { title = '', description = '', fields = [], google_sheet_name = '' } = form;

  // Clean fields array on initial load and when form changes
  useEffect(() => {
    const cleanFields = (fields || []).filter(field => field && field.id);
    if (cleanFields.length !== (fields || []).length) {
      setLocalForm(prev => ({
        ...prev,
        fields: cleanFields
      }));
    }
  }, [fields, form, setLocalForm]);

  const moveField = useCallback((dragIndex, hoverIndex) => {
    const dragItem = fields[dragIndex];
    const newFields = [...fields];
    newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, dragItem);
    setLocalForm(prev => ({
      ...prev,
      fields: newFields
    }));
  }, [fields, setLocalForm]);

  const deleteField = useCallback((id) => {
    const newFields = fields.filter(field => field?.id !== id);
    const updatedForm = {
      ...form,
      fields: newFields
    };
    
    // Update local state immediately
    setLocalForm(updatedForm);
    
    // Then update the server
    updateForm(updatedForm);
  }, [fields, form, setLocalForm, updateForm]);

  const updateField = useCallback((id, updates) => {
    const newFields = fields.map(field => 
      field?.id === id ? { ...field, ...updates } : field
    );
    setLocalForm(prev => ({
      ...prev,
      fields: newFields
    }));
  }, [fields, setLocalForm]);

  const [{ isOver }, drop] = useDrop({
    accept: 'field',
    drop: (item, monitor) => {
      if (!monitor.didDrop()) {
        addField(item.type);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const handleSave = () => {
    // Filter out any null or invalid fields before saving
    const cleanFields = (fields || []).filter(field => field && field.id);
    const formToSave = {
      ...form,
      fields: cleanFields
    };
    updateForm(formToSave);
    toast.success('Form saved successfully!');
    if (navigate) navigate('/');
  };

  return (
    <div 
      className="form-builder" 
      ref={drop}
      style={{ backgroundColor: isOver ? 'rgba(46, 134, 222, 0.1)' : 'white' }}
    >
      <div className="form-builder-header">
        <button className="save-btn" onClick={handleSave}>
          <FiSave /> Save
        </button>
        <button className="share-btn" onClick={onShare}>
          <FiShare2 /> Share
        </button>
      </div>
      <input
        type="text"
        value={form.title}
        onChange={(e) => setLocalForm(prev => ({ ...prev, title: e.target.value }))}
        placeholder="Form Title"
        className="form-title-input"
      />
      <textarea
        value={form.description}
        onChange={(e) => setLocalForm(prev => ({ ...prev, description: e.target.value }))}
        placeholder="Form Description"
        className="form-description-input"
      />
      {(fields || [])
        .filter(field => field && field.id)
        .map((field, index) => (
          <FormField 
            key={field.id}
            index={index}
            field={field}
            moveField={moveField}
            onDelete={deleteField}
            onUpdate={updateField}
            addField={addField}
          />
      ))}
      {/* Thank You & Redirect Section */}
      <div className="thankyou-redirect-section" style={{marginTop: 32, padding: 24, border: '1px solid #eee', borderRadius: 8}}>
        <h3>Thank You Page & Redirection</h3>
        <p>Customize what happens after a user submits the form.</p>
        <ul style={{marginBottom: 12}}>
          <li>Edit the <b>Thank You message</b> shown after submission.</li>
          <li>Or set a <b>Redirect URL</b> to send users to another page after submitting.</li>
        </ul>
        <button
          type="button"
          className="edit-thankyou-btn"
          style={{padding: '8px 16px', background: '#2e86de', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer'}}
          onClick={() => {
            // Scroll to settings or navigate to settings tab/route if available
            if (navigate) navigate(`/form/${form.id}/settings`);
          }}
        >
          Edit Thank You & Redirect Settings
        </button>
        <div style={{marginTop: 8, fontSize: 13, color: '#888'}}>
          (You can always change these later in Form Settings)
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;