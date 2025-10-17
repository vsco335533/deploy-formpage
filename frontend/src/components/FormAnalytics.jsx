import React from 'react';
import { FiBarChart2, FiPieChart } from 'react-icons/fi';

const FormAnalytics = ({ responses, fields }) => {
  const getResponseStats = (fieldId) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return null;

    const fieldResponses = responses.map(r => r.data[fieldId]).filter(Boolean);

    if (['radio', 'dropdown'].includes(field.type)) {
      const optionCounts = {};
      field.options.forEach(option => {
        optionCounts[option] = fieldResponses.filter(r => r === option).length;
      });
      return optionCounts;
    }

    if (field.type === 'checkbox') {
      const optionCounts = {};
      field.options.forEach(option => {
        optionCounts[option] = fieldResponses.filter(r => Array.isArray(r) && r.includes(option)).length;
      });
      return optionCounts;
    }

    return {
      totalResponses: fieldResponses.length,
      uniqueResponses: new Set(fieldResponses).size
    };
  };

  return (
    <div className="analytics-container">
      <h2>Form Analytics</h2>
      <div className="analytics-grid">
        {fields.map(field => {
          const stats = getResponseStats(field.id);
          return (
            <div key={field.id} className="analytics-card">
              <h3>{field.label}</h3>
              <div className="analytics-content">
                {['radio', 'dropdown', 'checkbox'].includes(field.type) ? (
                  <div className="chart-container">
                    <FiPieChart size={24} />
                    <ul>
                      {stats && Object.entries(stats).map(([option, count]) => (
                        <li key={option}>
                          {option}: {count} ({Math.round((count / responses.length) * 100)}%)
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="stats-container">
                    <FiBarChart2 size={24} />
                    <p>Total responses: {stats?.totalResponses || 0}</p>
                    {field.type !== 'file' && (
                      <p>Unique responses: {stats?.uniqueResponses || 0}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FormAnalytics;
