import React, { useState, createContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  let [user, setUser] = useState(null);
  const [usernameError, setUsernameError] = useState(''); // State for username error messages
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const checkUserExpiration = () => {
    const storedUserData = JSON.parse(localStorage.getItem('user'));
    if (storedUserData) {
      const { user, timestamp } = storedUserData;
      const currentTime = new Date().getTime();
      // Check if 24 hours have passed
      if (currentTime - timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('user'); // Remove expired user data
        setUser(null);
      } else {
        setUser(user); // Set user if data is still valid
      }
    }
  };

  useEffect(() => {
    // Check user expiration on component mount
    checkUserExpiration();
  }, []);

  const login = async (data) => {
    try {
      const response = await axios.post("http://localhost:3002/user/login", data);
      if (response.data.user) {
        const userData = {
          user: response.data.user,
          timestamp: new Date().getTime(), // Add a timestamp for expiration
        };
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(userData));
        setUsernameError('');
        setPasswordError('');
        return { ok: true, user: response.data.user };
      } else {
        // Check specific messages and set appropriate error states
        if (response.data.message === 'Username does not match') {
          setUsernameError(response.data.message);
        } else if (response.data.message === 'Password not matched') {
          setPasswordError(response.data.message);
        }
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("login failed", error);
      const message = error.response ? error.response.data.message : "Network error";
      setPasswordError(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      const response = await axios.get('http://localhost:3002/user/logout', {
        withCredentials: true
      });
      if (response.status === 200) {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/');
        console.log("log out successfully");
      }
    } catch (error) {
      console.error("error logging out", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, usernameError, passwordError }}>
      {children}
    </UserContext.Provider>
  );
};
