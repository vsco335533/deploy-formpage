import Profile from './components/Profile';
import React, { useState, useCallback, useEffect, useReducer } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Routes, Route, useNavigate, Navigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
// import { jwtDecode } from 'jwt-decode';
import AdminLogin from './components/AdminLogin/AdminLogin';
import Header from './components/Header';
import Toolbox from './components/Toolbox';
import FormBuilder from './components/FormBuilder';
import FormPreview from './components/FormPreview';
import ShareModal from './components/ShareModal';
import FormSettings from './components/FormSettings';
import FormResponses from './components/FormResponses';
import FormView from './components/FormView';
import FormTemplates from './components/FormTemplates';
import FormAnalytics from './components/FormAnalytics';
import './styles.css';
import { v4 as uuidv4 } from 'uuid';

// Add these imports
import { authApi, formsApi, responsesApi } from './api';

// History reducer for undo/redo
function historyReducer(state, action) {
  switch (action.type) {
    case 'UNDO':
      return {
        past: state.past.slice(0, -1),
        present: state.past[state.past.length - 1],
        future: [state.present, ...state.future]
      };
    case 'REDO':
      return {
        past: [...state.past, state.present],
        present: state.future[0],
        future: state.future.slice(1)
      };
    case 'UPDATE':
      return {
        past: [...state.past, state.present],
        present: action.payload,
        future: []
      };
    default:
      return state;
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });
  const [forms, setForms] = useState([]);
  const [activeForm, setActiveForm] = useState(null);
  const [localForm, setLocalForm] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [formLink, setFormLink] = useState('');
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [history, dispatchHistory] = useReducer(historyReducer, {
    past: [],
    present: null,
    future: []
  });
  const navigate = useNavigate();

  // Sample templates (now only used locally)
  const sampleTemplates = [
    {
      id: 'template1',
      name: 'Contact Form',
      description: 'Collect contact information',
      fields: [
        { type: 'text', label: 'Name', required: true },
        { type: 'email', label: 'Email', required: true },
        { type: 'textarea', label: 'Message', required: false }
      ]
    },
    {
      id: 'template2',
      name: 'Feedback Form',
      description: 'Collect customer feedback',
      fields: [
        { type: 'text', label: 'Your Name', required: false },
        { type: 'radio', label: 'Rating', options: ['Excellent', 'Good', 'Average', 'Poor'], required: true },
        { type: 'textarea', label: 'Comments', required: false }
      ]
    },
    {
      id: 'template3',
      name: 'Event Registration',
      description: 'Register for an upcoming event',
      fields: [
        { type: 'text', label: 'Full Name', required: true },
        { type: 'email', label: 'Email', required: true },
        { type: 'date', label: 'Event Date', required: true },
        { type: 'dropdown', label: 'Ticket Type', options: ['General', 'VIP', 'Student'], required: true }
      ]
    }
  ];

  // Update your useEffect to load forms from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [formsResponseRaw] = await Promise.all([
          formsApi.getForms(),
        ]);
        const formsResponse = formsResponseRaw && typeof formsResponseRaw === 'object' ? formsResponseRaw : {};
        setForms(Array.isArray(formsResponse.forms)
          ? formsResponse.forms.map(f => ({ ...f, responses: Array.isArray(f.responses) ? f.responses : [] }))
          : []);
        setTemplates(Array.isArray(formsResponse.templates) ? formsResponse.templates : []);
        setIsLoading(false);
      } catch (error) {
        setForms([]);
        setTemplates([]);
        toast.error('Failed to load forms');
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const updateForm = useCallback(async (updatedForm) => {
    try {
      await formsApi.updateForm(updatedForm.id, updatedForm);
      const normalizedForm = {
        ...updatedForm,
        responses: Array.isArray(updatedForm.responses) ? updatedForm.responses : [],
      };
      setForms(prev => prev.map(form => 
        form.id === updatedForm.id ? normalizedForm : { ...form, responses: Array.isArray(form.responses) ? form.responses : [] }
      ));
      setActiveForm(normalizedForm);
      dispatchHistory({ type: 'UPDATE', payload: normalizedForm });
    } catch (error) {
      toast.error('Failed to save form');
    }
  }, []);

  const undo = useCallback(() => {
    if (history.past.length > 0) {
      dispatchHistory({ type: 'UNDO' });
      setActiveForm(history.past[history.past.length - 1]);
    }
  }, [history]);

  const redo = useCallback(() => {
    if (history.future.length > 0) {
      dispatchHistory({ type: 'REDO' });
      setActiveForm(history.future[0]);
    }
  }, [history]);

  const addField = useCallback((type, index) => {
    // Use localForm if available, else fallback to activeForm
    const baseForm = localForm || activeForm;
    if (!baseForm) return;

    const newField = {
      id: `field-${Date.now()}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      placeholder: type === 'section' ? '' : `Enter ${type}`,
      options: (type === 'dropdown' || type === 'radio' || type === 'checkbox' || type === 'rating')
        ? ['Option 1', 'Option 2']
        : [],
      hidden: false
    };

    const newFields = [...(baseForm.fields || [])];
    const insertIndex = index !== undefined ? index : newFields.length;
    newFields.splice(insertIndex, 0, newField);

    const updatedForm = { ...baseForm, fields: newFields };
    updateForm(updatedForm);
  }, [localForm, activeForm, updateForm]);

  const createNewForm = useCallback(async () => {
    // Find the next available sheet name (Sheet1, Sheet2, ...)
    const usedSheetNames = forms.map(f => f.google_sheet_name).filter(Boolean);
    let sheetNumber = 1;
    let nextSheetName = `Sheet${sheetNumber}`;
    while (usedSheetNames.includes(nextSheetName)) {
      sheetNumber += 1;
      nextSheetName = `Sheet${sheetNumber}`;
    }

    const newForm = {
      title: 'Untitled Form',
      description: '',
      fields: [
        {
          id: `field-email-${Date.now()}`,
          type: 'email',
          label: 'Email',
          required: false,
          placeholder: 'Enter your email',
          options: [],
          hidden: false
        }
      ],
      google_sheet_name: nextSheetName,
      settings: {
        themeColor: '#2e86de',
        confirmationMessage: 'Thank you for your submission!',
        redirectUrl: '',
        openDate: '',
        closeDate: ''
      }
    };

    try {
      // Only send fields that are likely required by backend
      const payload = {
        title: newForm.title,
        description: newForm.description,
        fields: newForm.fields,
        settings: newForm.settings,
        google_sheet_name: newForm.google_sheet_name
      };
      const response = await formsApi.createForm(payload);
      const formId = response && response.form_id ? response.form_id : (response && response.id ? response.id : null);
      if (!formId) {
        toast.error('Failed to create form: No form ID returned');
        return;
      }
      const createdForm = {
        ...newForm,
        id: formId,
        responses: [],
        logic: []
      };
      setForms(prev => [...prev, { ...createdForm, responses: Array.isArray(createdForm.responses) ? createdForm.responses : [] }]);
      setActiveForm({ ...createdForm, responses: Array.isArray(createdForm.responses) ? createdForm.responses : [] });
      navigate(`/form/${formId}/build`);
      toast.success('New form created');
    } catch (error) {
      toast.error('Failed to create form');
    }
  }, [navigate, forms]);

  const deleteForm = useCallback(async (id) => {
    if (!id || id === 'undefined') {
      toast.error('Cannot delete: Form ID is missing or invalid.');
      return;
    }
    try {
      await formsApi.deleteForm(id);
      setForms(prev => prev.filter(form => form.id !== id));
      if (activeForm && activeForm.id === id) {
        setActiveForm(null);
        navigate('/');
      }
      toast.success('Form deleted');
    } catch (error) {
      toast.error('Failed to delete form');
    }
  }, [activeForm, navigate]);

  const duplicateForm = useCallback(async (form) => {
    try {
      const response = await formsApi.duplicateForm(form.id);
      const duplicatedForm = {
        ...form,
        id: response.data.form_id,
        title: `${form.title} (Copy)`,
        responses: []
      };
      setForms(prev => [...prev, { ...duplicatedForm, responses: Array.isArray(duplicatedForm.responses) ? duplicatedForm.responses : [] }]);
      toast.success('Form duplicated');
    } catch (error) {
      toast.error('Failed to duplicate form');
    }
  }, []);

  const useTemplate = useCallback(async (template) => {
    const payload = {
      title: template.name,
      description: template.description,
      fields: template.fields.map(field => ({
        ...field,
        id: uuidv4(),
        options: field.options ? [...field.options] : [],
        hidden: false
      })),
      settings: {
        themeColor: template.settings?.themeColor || '#2e86de',
        confirmationMessage: template.settings?.confirmationMessage || 'Thank you for your submission!',
        redirectUrl: '',
        openDate: '',
        closeDate: ''
      }
    };

    try {
      const response = await formsApi.createForm(payload);
      const formId = response && response.form_id ? response.form_id : (response && response.id ? response.id : null);
      if (!formId) {
        toast.error('Failed to create form from template: No form ID returned');
        return;
      }
      const createdForm = {
        ...payload,
        id: formId,
        responses: [],
        logic: []
      };
      setForms(prev => [...prev, { ...createdForm, responses: Array.isArray(createdForm.responses) ? createdForm.responses : [] }]);
      setActiveForm({ ...createdForm, responses: Array.isArray(createdForm.responses) ? createdForm.responses : [] });
      navigate(`/form/${formId}/build`);
      toast.success('Template applied and form created');
    } catch (error) {
      toast.error('Failed to create form from template');
    }
  }, [navigate]);

  const generateShareLink = useCallback((formId) => {
    if (!formId || formId === 'undefined') {
      toast.error('Cannot share: Form ID is missing. Please save the form first.');
      return;
    }
    const link = `${window.location.origin}/form/${formId}/view`;
    setFormLink(link);
    setShowShareModal(true);
  }, []);

  const submitResponse = useCallback(async (formId, response) => {
    try {
      // Find the form definition to map field IDs to labels
      const form = forms.find(f => f.id === formId || f._id === formId);
      let responseWithLabels = response;
      if (form && Array.isArray(form.fields)) {
        responseWithLabels = {};
        form.fields.forEach(field => {
          if (field && field.id && field.label) {
            responseWithLabels[field.label] = response[field.id];
          }
        });
      }
      await responsesApi.submitResponse(formId, responseWithLabels);
      setForms(prev => prev.map(form => {
        if (form.id === formId) {
          return {
            ...form,
            responses: [...form.responses, {
              id: uuidv4(),
              date: new Date().toISOString(),
              data: responseWithLabels
            }]
          };
        }
        return form;
      }));
      toast.success('Response submitted successfully');
    } catch (error) {
      toast.error('Failed to submit response');
    }
  }, [forms]);

  // Update your handleLogin function:
  const handleLogin = async (username, password, isGoogle = false) => {
    try {
      let response;
      if (isGoogle) {
        response = await authApi.googleLogin(username, username); // username is email in this case
      } else {
        response = await authApi.login(username, password);
      }
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setIsAuthenticated(true);
      navigate('/');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // Sync localForm with activeForm when activeForm changes
  React.useEffect(() => {
    if (activeForm) {
      setLocalForm({
        ...activeForm,
        responses: Array.isArray(activeForm.responses) ? activeForm.responses : [],
      });
    } else {
      setLocalForm(null);
    }
  }, [activeForm]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        {isAuthenticated && (
          <Header 
            onLogout={handleLogout}
          />
        )}

        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" /> : 
            <AdminLogin onLogin={handleLogin} />
          } />

          <Route path="/profile" element={
            !isAuthenticated ? <Navigate to="/login" /> :
            <Profile />
          } />
          
          <Route path="/" element={
            !isAuthenticated ? <Navigate to="/login" /> :
            <FormTemplates 
              templates={Array.isArray(templates) ? templates : []}
              forms={Array.isArray(forms) ? forms : []}
              onUseTemplate={useTemplate}
              onCreateNew={createNewForm}
              onDelete={deleteForm}
              onShare={(form) => generateShareLink(form.id)}
              onSelectForm={(form) => {
                setActiveForm({ ...form, responses: Array.isArray(form.responses) ? form.responses : [] });
                navigate(`/form/${form.id}/build`);
              }}
            />
          } />

          <Route path="/form/:formId/build" element={
            !isAuthenticated ? <Navigate to="/login" /> :
            activeForm && (
              <div className="container">
                <Toolbox addField={addField} />
                <FormBuilder 
                  form={localForm || activeForm}
                  setLocalForm={setLocalForm}
                  updateForm={updateForm}
                  addField={addField}
                  onShare={() => generateShareLink(activeForm.id)}
                  navigate={navigate}
                />
                <FormPreview 
                  form={localForm || activeForm}
                  mode="builder"
                />
              </div>
            )
          } />

          <Route path="/form/:formId/settings" element={
            !isAuthenticated ? <Navigate to="/login" /> :
            activeForm && <FormSettings 
              form={activeForm}
              updateForm={updateForm}
            />
          } />


          <Route path="/form/:formId/responses" element={
            !isAuthenticated ? <Navigate to="/login" /> :
            activeForm && <FormResponsesLoader form={activeForm} />
          } />
// ...existing code...


          <Route path="/form/:formId/view" element={<FormViewLoader onSubmit={submitResponse} />} />
        </Routes>

        {showShareModal && (
          <ShareModal 
            link={formLink}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </div>
    </DndProvider>
  );
}





export default App;

// Loader component to fetch responses from backend
function FormResponsesLoader({ form }) {
  const { formId } = useParams();
  const [responses, setResponses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    async function fetchResponses() {
      setLoading(true);
      try {
        const res = await responsesApi.getResponses(formId);
        setResponses(Array.isArray(res) ? res : []);
      } catch {
        setResponses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchResponses();
  }, [formId]);
  if (loading) return <div className="loading">Loading responses...</div>;
  return (
    <>
      <FormResponses responses={responses} formFields={form.fields} />
      <FormAnalytics responses={responses} fields={form.fields} />
    </>
  );
}

// Loader component to fetch form by ID for public view
function FormViewLoader({ onSubmit }) {
  const { formId } = useParams();
  const [form, setForm] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchForm = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await formsApi.getForm(formId);
        console.log('Form API response:', response); // Debug log
        // Normalize id field for consistency
        if (response && response._id && !response.id) {
          response.id = response._id;
        }
        if (!response || (!response.id && !response._id)) {
          setError('Form not found or unavailable');
          setForm(null);
        } else {
          // Ensure responses is always an array
          setForm({
            ...response,
            responses: Array.isArray(response.responses) ? response.responses : [],
          });
        }
      } catch (err) {
        setError('Form not found or unavailable');
        setForm(null);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [formId]);

  if (loading) return <div className="loading">Loading form...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!form) return <div className="error-message">Form not found.</div>;
  return <FormView form={form} onSubmit={onSubmit} />;
}