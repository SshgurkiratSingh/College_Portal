interface DescriptionLiProps {
  description?: string;
}
const DescriptionLi: React.FC<DescriptionLiProps> = ({ description }) => {
  return <div className="flex flex-col m-7">{description}</div>;
};

export default DescriptionLi;
