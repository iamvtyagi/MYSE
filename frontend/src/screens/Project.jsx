import React, { createRef, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";
import axiosInstance from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import Markdown from "markdown-to-jsx";
export const Project = () => {
  const location = useLocation();
  console.log(location.state);
  const { user, loading } = useContext(UserContext);
  console.log(user);
  if (loading) {
    return <div>Loading...</div>;
  }

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const messageBox = createRef();

  const token = localStorage.getItem("token");

  const nav = useNavigate();

  useEffect(() => {
    if (!token) {
      nav("/login");
    }
  }, [nav, token]);

  useEffect(() => {
    let socket = initializeSocket(project._id);

    const handleMessage = (data) => {
      let message = data.message;

      if (data.sender._id === "ai") {
        console.log(data.sender._id);
        try {
          message = JSON.parse(message.trim());
        } catch (error) {
          console.error("Error parsing AI message:", error);
          message = { text: data.message };
        }
      }

      if (message.fileTree) {
        setFileTree(message.fileTree);
      }
      console.log("Received message:", data);
      setMessages((prevMessages) => [...prevMessages, data]);
      scrollToBottom();
    };

    receiveMessage("project-message", handleMessage);

    return () => {
      socket.off("project-message", handleMessage);
    };
  }, [project._id]);

  useEffect(() => {
    axiosInstance
      .get(`/projects/get-project/${location.state.project?._id}`)
      .then((res) => {
        setProject(res.data.project);
      })
      .catch((err) => console.error(err));

    axiosInstance
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.allUsers);
      })
      .catch((err) => console.error(err));
  }, [project._id]);

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }
      return newSelectedUserId;
    });
  };

  const addCollaborators = () => {
    axiosInstance
      .put("/projects/add-user", {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        console.log("Collaborators added:", res.data);
        setIsModalOpen(false);
      })
      .catch((err) => console.error(err));
  };

  const send = () => {
    if (!message.trim()) return;

    const newMessage = { message, sender: user };
    sendMessage("project-message", newMessage);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage("");
    scrollToBottom();
  };

  const writeAIMessage = (msg, index) => {
    const isPromptly = msg.sender._id === "ai";
    let messageObject = null;

    if (isPromptly) {
      // Only attempt to parse if the sender is AI
      try {
        const cleanedMessage = msg.message.trim();
        messageObject = JSON.parse(cleanedMessage);
      } catch (error) {
        console.error("Error parsing AI message:", error);
        messageObject = { text: msg.message }; // fallback if parsing fails
      }
    }

    return (
      <div
        key={msg._id || index}
        className={`message max-w-64 flex flex-col p-2 w-fit rounded-lg shadow-md ${
          msg.sender._id === user._id
            ? "ml-auto bg-indigo-500 text-white shadow-indigo-700"
            : "bg-gray-800 text-white shadow-indigo-500"
        }`}
      >
        <small className="opacity-80 text-xs text-indigo-300">
          {msg.sender.email || "Unknown User"}
        </small>

        {isPromptly ? (
          <div className="overflow-auto relative p-3 rounded-lg hologram-container bg-opacity-30 backdrop-blur-md border border-cyan-400/40 shadow-lg max-w-74">
            {messageObject.functions &&
            Array.isArray(messageObject.functions) &&
            messageObject.functions.length > 0 ? (
              // Handle Functions
              messageObject.functions.map((func, idx) => (
                <div key={idx} className="my-4">
                  <h4 className="text-lg text-cyan-300 font-semibold">
                    {func.name}
                  </h4>
                  <p className="text-sm font-light text-gray-200">
                    {func.description}
                  </p>

                  <pre className="bg-gray-900 text-green-300 p-2 rounded-md overflow-auto mt-2">
                    <code>{func.code}</code>
                  </pre>

                  <div className="mt-4">
                    <h5 className="text-sm font-semibold text-indigo-300">
                      Example Usages:
                    </h5>
                    {func.exampleUsages &&
                      Array.isArray(func.exampleUsages) &&
                      func.exampleUsages.map((usage, idx) => (
                        <div key={idx} className="mt-2">
                          <p className="text-sm text-gray-200">
                            <strong>Input:</strong> {usage.input}
                          </p>
                          <p className="text-sm text-gray-200">
                            <strong>Callback:</strong> {usage.callback}
                          </p>
                          <p className="text-sm text-gray-200">
                            <strong>Output:</strong> {usage.output}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              ))
            ) : messageObject.code ? (
              // Handle Code Block
              <div className="my-4">
                <h4 className="text-lg text-cyan-300 font-semibold">
                  Code Output
                </h4>
                <pre className="bg-gray-900 text-green-300 p-2 rounded-md overflow-auto mt-2">
                  <code>{messageObject.code}</code>
                </pre>
              </div>
            ) : messageObject.text ? (
              // Handle Text or Markdown
              <Markdown className="text-sm font-light tracking-wide hologram-text text-cyan-300">
                {messageObject.text || ""}
              </Markdown>
            ) : (
              // Handle Any Other Unknown Format (fallback)
              <p className="text-sm font-light">{msg?.message}</p>
            )}
          </div>
        ) : (
          // For Non-AI Messages
          <p className="text-sm font-light">{msg?.message}</p>
        )}
      </div>
    );
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messageBox.current) {
        messageBox.current.scrollTop = messageBox.current.scrollHeight;
      }
    }, 100);
  };

  return (
    <main className="w-full h-screen flex bg-gradient-to-br from-gray-900 via-black to-indigo-900 text-white">
      {/* Sidebar */}
      <section className="left relative flex flex-col h-full w-92 bg-gray-900 border-r border-indigo-500 shadow-xl">
        {/* Header */}
        <header className="flex justify-between p-2 px-4 w-full bg-gray-800 border-b border-indigo-500">
          <button
            className="add-users flex flex-col justify-center items-center p-2 mr-1 rounded-full hover:bg-gray-700 transition"
            onClick={() => setIsModalOpen(!isModalOpen)}
          >
            <i className="ri-user-add-fill text-b text-indigo-400"></i>
            <small className="opacity-75 text-xs text-indigo-300 tracking-wide">
              Add Collabs
            </small>
          </button>
          <button
            className="flex flex-col justify-center items-center p-2 rounded-full hover:bg-gray-700 transition"
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
          >
            <i className="ri-group-fill text-base text-indigo-400"></i>
            <small className="opacity-60 text-xs text-indigo-300">
              Collabs
            </small>
          </button>
        </header>

        {/* Chat Area */}
        <div className="conversation-area flex-grow flex flex-col p-4">
          {/* Message Box */}
          <div
            ref={messageBox}
            className="message-box flex-grow flex flex-col gap-4 overflow-y-auto max-h-[80vh] scrollbar-hide"
          >
            {messages.map((msg, index) => writeAIMessage(msg, index))}
          </div>
          {/* Input Message Field */}
          <div className="inputField w-full flex border-indigo-500">
            <input
              className="flex-grow p-3 rounded-l-xl bg-gray-800 text-white border-none outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-400"
              type="text"
              placeholder="Enter message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  send();
                }
              }}
            />
            <button
              className="p-2 bg-indigo-500 hover:bg-indigo-600 transition rounded-r-xl"
              onClick={send}
            >
              <i className="ri-send-plane-fill text-lg"></i>
            </button>
          </div>
        </div>

        {/* Users Panel */}
        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-gray-900 absolute transition-all ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0`}
        >
          {/* Panel content */}
          <header className="flex justify-between items-center p-2 px-4 w-full bg-gray-800 border-b border-indigo-500">
            <h1 className="font-bold text-indigo-400">Collaborators</h1>
            <button
              className="p-2 rounded-full hover:bg-gray-700 transition"
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            >
              <i className="ri-close-line text-xl text-indigo-400"></i>
            </button>
          </header>

          {project.users &&
            project.users.map((user) => (
              <div className="users flex flex-col gap-2" key={user._id}>
                <div className="user cursor-pointer flex items-center gap-2 p-2 hover:bg-gray-800 transition-all">
                  <div className="rounded-full w-fit h-fit flex items-center justify-center p-2 bg-gray-700">
                    <i className="ri-user-smile-line"></i>
                  </div>
                  <h1 className="font-semibold text-lg text-indigo-400">
                    {user.email}
                  </h1>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* File Tree */}
      <section className="right flex-grow h-full flex bg-gray-950 text-indigo-300">
        <div className="explorer h-full max-w-64 min-w-52 bg-gray-900 border-r border-indigo-400/40 shadow-lg">
          <div className="file-tree overflow-y-auto h-full p-2">
            {Object.keys(fileTree).map((file, index) => (
              <button
                onClick={() => {
                  setCurrentFile(file);
                  setOpenFiles([...new Set([...openFiles, file])]); // Fixed the set logic // Fixed the set logic
                }}
                key={index}
                className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-gray-800 border border-indigo-500/40 rounded-md shadow-md 
            transition-all duration-200 hover:bg-indigo-700/30 hover:border-indigo-400 hover:shadow-indigo-400"
              >
                <p className="font-orbitron text-sm tracking-wide">{file}</p>
              </button>
            ))}
          </div>
        </div>
        {currentFile && (
          <div className="code-editor flex-grow bg-gray-950 border-l border-indigo-500/40 p-4 rounded-lg shadow-lg flex flex-col">
            <div className="top mb-4 flex justify-between items-center bg-gray-900 p-3 rounded-lg shadow-lg border border-indigo-600/40">
              {/* Open File Tabs */}
              <div className="files flex gap-2">
                {openFiles.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFile(file)}
                    className={`open-file flex items-center cursor-pointer p-2 px-4 gap-2 rounded-md text-cyan-300 bg-gray-800 border border-cyan-500/30 shadow-md transition-all duration-200 hover:bg-cyan-700/40 hover:text-cyan-100 ${
                      currentFile === file
                        ? "bg-cyan-700/50 text-white border-cyan-400 shadow-lg"
                        : "hover:border-cyan-300"
                    }`}
                  >
                    <p className="font-orbitron text-sm">{file}</p>
                  </button>
                ))}

                <button
                  onClick={() => setCurrentFile(null)}
                  className="text-cyan-300 hover:text-cyan-400 text-xs p-2 rounded-md transition-all"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Code Editor */}
            <div className="bottom h-full overflow-hidden flex-grow relative">
              {fileTree[currentFile] && (
                <textarea
                  className="w-full h-full border-none outline-none resize-none p-4 bg-gray-800 rounded-md text-white shadow-md focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 overflow-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-800"
                  value={fileTree[currentFile].file?.contents}
                  onChange={(e) =>
                    setFileTree({
                      ...fileTree,
                      [currentFile]: {
                        ...fileTree[currentFile],
                        contents: e.target.value,
                      },
                    })
                  }
                />
              )}
            </div>
          </div>
        )}
      </section>

      {/* Modal for Adding Collaborators */}
      {isModalOpen && (
        <div className="modal w-full h-screen fixed top-0 left-0 bg-black bg-opacity-50 backdrop-blur-lg flex justify-center items-center">
          {/* Modal Container */}
          <div className="bg-gray-900 bg-opacity-30 backdrop-blur-xl border border-indigo-500/70 p-6 rounded-xl w-96 max-w-full relative shadow-lg shadow-indigo-500/50">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-indigo-400 hover:text-red-500 text-2xl transition-transform hover:rotate-90"
            >
              <i className="ri-close-fill"></i>
            </button>
            <header className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-indigo-400 tracking-wide">
                Select Collaborator
              </h2>
            </header>
            <div className="users-list flex flex-col gap-4 mb-8 max-h-80 overflow-auto px-2">
              {users.map((user) => (
                <div
                  key={user._id}
                  className={`user cursor-pointer bg-gray-800 bg-opacity-60 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/80 p-3 rounded-lg flex items-center gap-4 transition-all transform hover:scale-105 ${
                    Array.from(selectedUserId).includes(user._id)
                      ? "bg-violet-900"
                      : ""
                  }`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className="relative rounded-full w-12 h-12 flex items-center justify-center bg-indigo-500 text-white shadow-lg shadow-indigo-500/40">
                    <i className="ri-user-fill text-2xl"></i>
                  </div>
                  <h1 className="font-semibold text-lg text-gray-300">
                    {user.email}
                  </h1>
                </div>
              ))}
            </div>

            <button
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-5 py-2 bg-indigo-500 hover:bg-indigo-600 transition rounded-lg text-white shadow-md shadow-indigo-500/70 hover:shadow-indigo-500/80"
              onClick={addCollaborators}
            >
              Add Collaborator
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
