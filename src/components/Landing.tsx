import { PropsWithChildren } from "react";
import { name } from "../data/links.js";
import "./styles/Landing.css";

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              {name.split(" ")[0].toUpperCase()}
              <br />
              <span>{name.split(" ").slice(1).join(" ").toUpperCase()}</span>
            </h1>
          </div>
          <div className="landing-info">
            <div className="landing-role">Software</div>
            <div className="landing-role-stack">
              <span>Developer</span>
              <span>Engineer</span>
            </div>
            <div className="landing-role-extra">
              <span>MERN Stack</span>
              <span>Developer</span>
            </div>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
