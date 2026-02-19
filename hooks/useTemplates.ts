import { useState } from "react";

export const useShowTemplates = () => {
  const [showTemplates, setShowTemplates] = useState(false);

  const handleShowTemplates = () => {
    setShowTemplates(true);
  };

  const handleCloseTemplates = () => {
    setShowTemplates(false);
  };

  return {
    showTemplates,
    handleShowTemplates,
    handleCloseTemplates,
  };
};
