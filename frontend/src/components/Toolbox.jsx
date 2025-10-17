import React from 'react';
import { useDrag } from 'react-dnd';
import { 
  FiType, FiAlignLeft, FiMail, FiCalendar, 
  FiCheckSquare, FiRadio, FiList, FiStar, FiImage 
} from 'react-icons/fi';

const FieldType = ({ type, icon, label, onAddField }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'field',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div 
      ref={drag}
      className="field-type"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={() => onAddField(type)}
    >
      {icon} {label}
    </div>
  );
};

const Toolbox = ({ addField }) => {
  const fieldTypes = [
    { type: 'text', icon: <FiType />, label: 'Text Field' },
    { type: 'textarea', icon: <FiAlignLeft />, label: 'Text Area' },
    { type: 'telephone', icon: <FiType />, label: 'Telephone Number' },
    { type: 'email', icon: <FiMail />, label: 'Email' },
    { type: 'date', icon: <FiCalendar />, label: 'Date' },
    { type: 'dropdown', icon: <FiList />, label: 'Dropdown' },
    { type: 'radio', icon: <FiRadio />, label: 'Multiple Choice' },
    { type: 'checkbox', icon: <FiCheckSquare />, label: 'Checkboxes' },
    { type: 'rating', icon: <FiStar />, label: 'Rating Scale' },
    { type: 'file', icon: <FiImage />, label: 'File Upload' },
    { type: 'section', icon: <FiAlignLeft />, label: 'Section' }
  ];

  return (
    <div className="toolbox">
      <h3>Form Elements</h3>
      {fieldTypes.map(({ type, icon, label }) => (
        <FieldType 
          key={type} 
          type={type} 
          icon={icon} 
          label={label}
          onAddField={addField}
        />
      ))}
    </div>
  );
};

export default Toolbox;
