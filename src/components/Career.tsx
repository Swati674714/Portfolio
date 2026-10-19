import "./styles/Career.css";
import { careerEntries } from "../data/career";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          {careerEntries.map(({ title, subtitle, year, description }) => (
            <div className="career-info-box" key={`${title}-${year}`}>
              <div className="career-info-in">
                <div className="career-role">
                  <h4>{title}</h4>
                  <h5>{subtitle}</h5>
                </div>
                <h3 className={year.includes("-") ? "career-year-range" : ""}>
                  {year}
                </h3>
              </div>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;
