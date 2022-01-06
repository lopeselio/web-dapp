import React, { useState, useContext } from "react";

import ThemeContainer, { ThemeContext } from "src/contexts/ThemeContext";
import { useWindowDimensionsHook } from "src/utils/window";

import Button from "src/components/design_system/button";
import P3 from "src/components/design_system/typography/p3";

import About from "./About";
import Highlights from "./Highlights";
import Goal from "./Goal";
import Token from "./Token";
import Perks from "./Perks";
import Settings from "./Settings";

const Profile = (props) => {
  const theme = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("About");
  const [progress, setProgress] = useState(0);
  const { height, width } = useWindowDimensionsHook();
  const mobile = width < 992;

  return (
    <div className="d-flex flex-column align-items-center">
      <div className="d-flex flex-row w-100 justify-content-between text-primary edit-profile-talent-progress py-2 px-3">
        <P3 text="" />
        <P3
          mode={theme.mode()}
          text="Complete your profile to appeal to more supporters and earn rewards."
          bold
          className="text-primary"
        />
        <P3 mode={theme.mode()} className="text-primary">
          <strong>{progress}</strong>/100%
        </P3>
      </div>
      <div className="talent-table-tabs w-100 mt-3 d-flex flex-row align-items-center">
        <div
          onClick={() => setActiveTab("About")}
          className={`py-2 px-2 ml-3 talent-table-tab${
            activeTab == "About" ? " active-talent-table-tab" : ""
          }`}
        >
          About
        </div>
        <div
          onClick={() => setActiveTab("Highlights")}
          className={`py-2 px-2 ml-3 talent-table-tab${
            activeTab == "Highlights" ? " active-talent-table-tab" : ""
          }`}
        >
          Highlights
        </div>
        <div
          onClick={() => setActiveTab("Goal")}
          className={`py-2 px-2 ml-3 talent-table-tab${
            activeTab == "Goal" ? " active-talent-table-tab" : ""
          }`}
        >
          Goal
        </div>
        <div
          onClick={() => setActiveTab("Token")}
          className={`py-2 px-2 ml-3 talent-table-tab${
            activeTab == "Token" ? " active-talent-table-tab" : ""
          }`}
        >
          Token
        </div>
        <div
          onClick={() => setActiveTab("Perks")}
          className={`py-2 px-2 ml-3 talent-table-tab${
            activeTab == "Perks" ? " active-talent-table-tab" : ""
          }`}
        >
          Perks
        </div>
        <div
          onClick={() => setActiveTab("Settings")}
          className={`py-2 px-2 ml-3 talent-table-tab${
            activeTab == "Settings" ? " active-talent-table-tab" : ""
          }`}
        >
          Settings
        </div>
        <Button
          onClick={() => console.log("saving")}
          type="white-subtle"
          mode={theme.mode()}
          className="ml-auto mr-3"
        >
          Save profile
        </Button>
        <Button
          onClick={() => console.log("public")}
          type="white-subtle"
          mode={theme.mode()}
          className="ml-1 mr-3"
        >
          Public profile
        </Button>
      </div>
      <div className="d-flex flex-column align-items-center p-3 edit-profile-content w-100">
        {activeTab == "About" && (
          <About {...props} mode={theme.mode()} mobile={mobile} />
        )}
        {activeTab == "Highlights" && (
          <Highlights {...props} mode={theme.mode()} mobile={mobile} />
        )}
        {activeTab == "Goal" && (
          <Goal {...props} mode={theme.mode()} mobile={mobile} />
        )}
        {activeTab == "Token" && (
          <Token {...props} mode={theme.mode()} mobile={mobile} />
        )}
        {activeTab == "Perks" && (
          <Perks {...props} mode={theme.mode()} mobile={mobile} />
        )}
        {activeTab == "Settings" && (
          <Settings {...props} mode={theme.mode()} mobile={mobile} />
        )}
      </div>
    </div>
  );
};

export default (props, railsContext) => {
  return () => (
    <ThemeContainer>
      <Profile {...props} railsContext={railsContext} />
    </ThemeContainer>
  );
};