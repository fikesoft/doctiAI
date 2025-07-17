import React from "react";
import { MdOutlineGirl } from "react-icons/md";
import { GrRestroomMen } from "react-icons/gr";
import { AVAILABLE_THEMES } from "@/app/(data)/themes";
import { useTheme } from "next-themes";

const ToggleTheme = () => {
  const { theme, setTheme } = useTheme();

  //Handling the change of the themes
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };
  const isCaramellatte = theme === "caramellatte";

  //Get theme
  const getTheme = (themeName: string) => {
    return AVAILABLE_THEMES.indexOf(themeName);
  };
  return (
    <label className="swap swap-flip text-2xl">
      <input
        type="checkbox"
        checked={isCaramellatte}
        onChange={() => {
          handleThemeChange(
            isCaramellatte
              ? AVAILABLE_THEMES[getTheme("valentine")]
              : AVAILABLE_THEMES[getTheme("caramellatte")]
          );
        }}
      />
      <div className="swap-on">
        <GrRestroomMen />
      </div>
      <div className="swap-off">
        <MdOutlineGirl />
      </div>
    </label>
  );
};

export default ToggleTheme;
