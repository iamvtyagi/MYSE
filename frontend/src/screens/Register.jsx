import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axios";
import { UserContext } from "../context/user.context";
export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useContext(UserContext);
  const [logInStatus, setLoginStatus] = useState("");

  const nav = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();

    try {
      axiosInstance
        .post("users/register", {
          email,
          password,
        })
        .then((res) => {
          setLoginStatus({ msg: "Success", key: Math.random() });
          console.log(res.data);
          localStorage.setItem("token", res.data.token);
          setUser(res.data.user);
          nav("/");
        });
    } catch (error) {
      console.error("Error during registration:", error);
      setLoginStatus({
        msg:
          error.response?.data?.message ||
          "An error occurred. Please try again.",
        key: Math.random(),
      });
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-r from-gray-900 to-indigo-900 flex justify-center items-center">
      <div className="grid gap-8 font-orbitron">
        <section
          id="back-div"
          className="bg-gradient-to-r from-indigo-800 via-indigo-900 to-black rounded-3xl p-8"
        >
          <div className="border-8 border-transparent rounded-xl bg-white bg-opacity-10 shadow-xl p-4 m-1 backdrop-blur-xl">
            <h1 className="text-5xl font-bold text-center cursor-default text-white">
              Register
            </h1>
            <form
              action="#"
              method="post"
              className="space-y-6"
              onSubmit={submitHandler}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-lg text-white"
                >
                  Email
                </label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  className="border p-3 shadow-md dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition transform hover:scale-105 duration-300"
                  type="email"
                  name="email"
                  placeholder="Email"
                  required=""
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-lg text-white"
                >
                  Password
                </label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  className="border p-3 shadow-md dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition transform hover:scale-105 duration-300"
                  type="password"
                  name="password"
                  placeholder="Password"
                  required=""
                />
              </div>

              <button
                className="w-full p-3 mt-4 text-white bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg hover:scale-105 transition transform duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="submit"
              >
                Register
              </button>
            </form>
            <div className="flex flex-col mt-4 text-sm text-center text-white">
              <p>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-400 transition hover:underline"
                >
                  Log In
                </Link>
              </p>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>
                By signing up, you agree to our{" "}
                <a
                  href="#"
                  className="text-blue-400 transition hover:underline"
                >
                  Terms
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-blue-400 transition hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
