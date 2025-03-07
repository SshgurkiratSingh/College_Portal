"use client";
interface HeadingProps {
  title: string;
  subtitle: string;
  center?: boolean;
}
const Heading: React.FC<HeadingProps> = ({ title, subtitle, center }) => {
  return (
    <div className={center ? "text-center" : "text-start"}>
      <div className="text-4xl  font-bold">{title}</div>
      <div className="text-xl">{subtitle}</div>
    </div>
  );
};

export default Heading;
