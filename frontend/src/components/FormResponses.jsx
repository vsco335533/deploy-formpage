import React from 'react';

const FormResponses = ({ responses, formFields }) => {
  return (
    <div className="responses-container">
      <div className="responses-header">
        <h2 className="responses-title">Responses</h2>
      </div>

      {responses.length === 0 ? (
        <p>No responses yet.</p>
      ) : (
        <table className="responses-table">
          <thead>
            <tr>
              {formFields.map(field => (
                <th key={field.id}>{field.label}</th>
              ))}
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {responses.map(response => (
              <tr key={response.id}>
                {formFields.map(field => {
                  const value = response.data[field.id];
                  return (
                    <td key={field.id}>
                      {field.type === 'checkbox' && Array.isArray(value)
                        ? value.join(', ')
                        : value || '-'}
                    </td>
                  );
                })}
                <td>{new Date(response.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FormResponses;
