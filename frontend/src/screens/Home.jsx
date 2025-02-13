import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/user.context";
import axiosInstance from "../config/axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
export const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [navigate, token]);

  const createProject = (e) => {
    e.preventDefault();
    console.log({ projectName });
    axiosInstance
      .post("/projects/create", {
        name: projectName,
      })
      .then((res) => {
        console.log(res);
        setIsModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    axiosInstance
      .get("/projects/all")
      .then((res) => {
        console.log("Projects of the loggedIn user", res.data);
        setProject(res.data.projects);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-black to-indigo-900 flex flex-col items-center justify-center text-white">
      {/* Animated Heading */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-4xl md:text-5xl font-bold text-indigo-400 mb-10 font-orbitron tracking-wide"
      >
        Start with Your Project
      </motion.h1>

      {/* Project Section */}
      <div className="flex items-center justify-center gap-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="p-5 rounded-full border-2 border-indigo-400 bg-black bg-opacity-30 hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-500/50"
        >
          <h2 className="font-orbitron">Start Now</h2>
          <i className="ri-add-circle-line text-4xl text-indigo-400"></i>
        </motion.button>

        {project?.map((project) => (
          <motion.div
            key={project._id}
            onClick={() => {
              navigate(`/project`, {
                state: { project },
              });
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 15px rgba(139, 92, 246, 0.7)",
            }}
            className="p-2 w-56 h-32 flex items-center justify-center flex-col rounded-xl border border-indigo-400 bg-black bg-opacity-30 shadow-lg shadow-indigo-500/50 hover:scale-105 transition-transform duration-300 text-center cursor-pointer"
          >
            <h2 className="text-indigo-300 font-semibold text-lg tracking-wide">
              {project.name}
            </h2>
            <div className="flex gap-4">
              <p>
                <small>
                  <i className="ri-user-2-fill"></i>
                  Collaborators
                </small>
                :
              </p>
              {project.users.length}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-gradient-to-br from-indigo-800 via-gray-900 to-black p-6 rounded-2xl shadow-2xl border border-indigo-400 w-1/3 relative"
          >
            <h2 className="text-2xl mb-4 text-indigo-300 text-center">
              Create New Project
            </h2>
            <form onSubmit={createProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-indigo-300">
                  Project Name
                </label>
                <input
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  type="text"
                  className="mt-2 w-full p-3 border border-indigo-400 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition shadow-md shadow-indigo-500/50"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </main>
  );
};
