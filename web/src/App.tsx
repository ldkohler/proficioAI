import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import * as model from "../../model";
import Router from "./Router";

export const UserContext = React.createContext<model.UserSession | null>(null);

export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_APP_API_URL}`,
});

function App() {
  const [userData, setUserData] = useState<model.UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const token = localStorage.getItem("session");
      if (token) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const { data: user } = await apiClient.get<model.UserSession>(
          "/session"
        );
        if (user) {
          setUserData(user);
        }
      }
      setLoading(false);
    };

    getSession();
  }, []);

  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("session", token);
      window.location.replace(window.location.origin);
    }
  }, []);

  const signOut = async () => {
    localStorage.removeItem("session");
    setUserData(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="m-auto">
          <span className="loading loading-dots p-5"></span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto">
        <div className="navbar bg-base-100">
          <div className="flex-1">
            <Link to="/">
              <span className="text-xl font-bold">Interview Simulator</span>
            </Link>
          </div>
          {userData ? (
            <div className="flex-none gap-2">
              <div className="form-control">
                <button className="btn" onClick={() => navigate("/start")}>
                  <Link to="/start">Start Interview</Link>
                </button>
              </div>
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full">
                    <img src={userData.picture} />
                  </div>
                </label>
                <ul
                  tabIndex={0}
                  className="mt-3 z-[1] p-2 shadow menu dropdown-content bg-base-200 rounded-box w-52"
                >
                  <li>
                    <Link to="/history">History</Link>
                  </li>
                  <li>
                    <Link to="/profile">Profile</Link>
                  </li>
                  <li>
                    <a onClick={() => signOut()}>Sign out</a>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <a
              href={`${import.meta.env.VITE_APP_API_URL}/auth/google/authorize`}
              rel="noreferrer"
            >
              <button className="btn">Sign In</button>
            </a>
          )}
        </div>
      </div>

      <Router user={userData} />
    </>
  );
}

export default App;
