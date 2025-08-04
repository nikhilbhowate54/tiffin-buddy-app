import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to main app - this is just a fallback
  return <Navigate to="/" replace />;
};

export default Index;
