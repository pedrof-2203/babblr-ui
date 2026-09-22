import { createBrowserRouter } from "react-router-dom";
import Login from "./auth/Login";
import Signup from "./auth/Signup";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/sign-up",
    element: <Signup />,
  },
]);

export default router;
