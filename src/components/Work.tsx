import { useRef } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import "./styles/Work.css";
import WorkImage from "./WorkImage";
import { projects } from "../data/projects";

const Work = () => {
  const workFlexRef = useRef<HTMLDivElement>(null);

  const scrollProjects = (direction: -1 | 1) => {
    const workFlex = workFlexRef.current;
    if (!workFlex) return;

    workFlex.scrollBy({
      left: direction * workFlex.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <div className="work-heading">
          <h2>
            My <span>Work</span>
          </h2>
          <div className="work-controls" aria-label="Project navigation">
            <button
              type="button"
              aria-label="Scroll to previous projects"
              onClick={() => scrollProjects(-1)}
            >
              <MdChevronLeft />
            </button>
            <button
              type="button"
              aria-label="Scroll to next projects"
              onClick={() => scrollProjects(1)}
            >
              <MdChevronRight />
            </button>
          </div>
        </div>
        <div className="work-flex" ref={workFlexRef}>
          {projects.map(({ number, title, category, tools, image, link }) => (
            <div className="work-box" key={title}>
              <div className="work-info">
                <div className="work-title">
                  <h3>{number}</h3>
                  <div>
                    <h4>{title}</h4>
                    <p>{category}</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>{tools}</p>
              </div>
              <WorkImage image={image} alt={title} link={link} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
