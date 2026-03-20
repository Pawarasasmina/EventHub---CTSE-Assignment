const getStoredAuth = () => {
  try {
    return JSON.parse(localStorage.getItem('eventhub-auth') || 'null');
  } catch {
    return null;
  }
};

const setStoredAuth = (value) => {
  localStorage.setItem('eventhub-auth', JSON.stringify(value));
};

const clearStoredAuth = () => {
  localStorage.removeItem('eventhub-auth');
};

export { getStoredAuth, setStoredAuth, clearStoredAuth };
