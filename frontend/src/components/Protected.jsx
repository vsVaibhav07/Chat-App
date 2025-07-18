import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';


const Protected = ({ children }) => {

    
  const authUser = useSelector((state) => state.user.authUser);
  if (!authUser) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default Protected