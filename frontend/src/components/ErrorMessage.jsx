const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="notice notice--error" role="alert">
      <strong>Something needs attention.</strong>
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
