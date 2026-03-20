const Loader = ({ text = 'Loading...' }) => (
  <div className="loader-panel">
    <div className="loader-spinner" />
    <p className="state-message">{text}</p>
  </div>
);

export default Loader;
