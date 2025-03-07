interface CollapseProps {
  title: string;
  content: string;
}
const Collapse: React.FC<CollapseProps> = ({ title, content }) => {
  return (
    <div
      tabIndex={0}
      className="collapse collapse-arrow border border-base-300 bg-base-200"
    >
      <div className="collapse-title text-xl font-medium">{title}</div>
      <div className="collapse-content">
        <p>{content}</p>
      </div>
    </div>
  );
};

export default Collapse;
