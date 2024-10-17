// import React, { useState, useEffect } from "react";
// import { GoogleLogin } from '@react-oauth/google';
// import {jwtDecode} from "jwt-decode"; // Use named import
// import axios from "axios";
// import { encryptData, getUserDetails, isLoggedIn, logout } from "../../utils/localStorage";
// const apiUrl = process.env.REACT_APP_API_URL;

// const GoogleAuth = () => {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     if (isLoggedIn()) {
//       const userDetails = getUserDetails();
//       if (userDetails) {
//         console.log("Decrypted user details:", userDetails);
//         setUser(userDetails);
//       } else {
//         logout(); // Logout if decryption fails
//       }
//     }
//   }, []);

//   const handleLoginSuccess = async(credentialResponse) => {
//     console.log("Credential Response:", credentialResponse);

//     try {
//       const decodedToken = jwtDecode(credentialResponse.credential);
//       console.log("Decoded token:", decodedToken);

//       const userData = {
//         email: decodedToken.email,
//         firstName: decodedToken.given_name,
//         lastName: decodedToken.family_name,
//         picture: decodedToken.picture,
//       };
//       // const response = await axios.post(`${apiUrl}/users`, userData);
//       // console.log('User created:', response.data);

//       setUser(userData);
//       localStorage.setItem('user', encryptData(userData)); // Encrypt user data before storing
//       window.location.reload();
//     } catch (error) {
//       console.error('Error decoding token:', error);
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     setUser(null);
//   };

//   return (
//     <GoogleLogin
//     onSuccess={handleLoginSuccess}
//     onError={() => {
//       console.log('Login Failed');
//     }}
//   />
//   );
// };

// export default GoogleAuth;
