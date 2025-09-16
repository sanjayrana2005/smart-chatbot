import { useEffect, useRef, useState } from "react";
import { FaArrowUp } from "react-icons/fa6";
import { FaSquare } from "react-icons/fa";
import axios from "axios"
import url from "./constant.js"
import { Loader, Trash, Menu } from "lucide-react"
import Answer from "./Component/Answer.jsx";
import MobileSidebar from "./Component/MobileSidebar.jsx";


function App() {
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false)
  const [recentHistory, setRecentHistory] = useState()
  const [selectedHistory, setSelectedHistory] = useState()
  const scrollToAnswer = useRef()
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

  const abortControllerRef = useRef(null);

  const handleAskQuestion = async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion && !selectedHistory) return;

    if (trimmedQuestion) {
      if (localStorage.getItem("history")) {
        let history = JSON.parse(localStorage.getItem("history"))
        history = [question, ...history]
        localStorage.setItem("history", JSON.stringify(history))
        setRecentHistory(history)
      } else {
        localStorage.setItem("history", JSON.stringify([question]))
        setRecentHistory([question])
      }
    }


    // clean any previous result
    setMessages(prev => [
      ...prev,
      { type: "q", text: question ? question : selectedHistory },
      { type: "a", text: "", loading: true } // placeholder answer
    ]);

    // create a new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);

    try {
      const payloadData = question ? question : selectedHistory
      const response = await axios.post(
        url + GEMINI_API_KEY,
        {
          contents: [
            {
              parts: [{ text: payloadData }],
            },
          ],
        },
        {
          signal: controller.signal, // this only works on axios >=1.2.0
        }
      );
      setQuestion("");
      setTimeout(() => {
        scrollToAnswer.current.scrollTop = scrollToAnswer.current.scrollHeight
      }, 400);

      let dataString = response.data.candidates[0].content.parts[0].text
      dataString = dataString.split("* ")
      dataString = dataString.map((item) => item.trim())
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          type: "a",
          text: dataString,
          loading: false
        };
        return updated;
      });
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled");
      } else if (error.name === "CanceledError") {
        console.log("Aborted with AbortController");
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;

    }
  };

  const handleStopAskQuestion = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  }

  const handleDeleteHistory = (indexToDelete) => {
    const updatedHistory = recentHistory.filter((_, index) => index !== indexToDelete)
    setRecentHistory(updatedHistory)
    localStorage.setItem("history", JSON.stringify(updatedHistory));
  }

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("history")) || []
    setRecentHistory(saved)
  }, [])

  useEffect(() => {
    handleAskQuestion()
  }, [selectedHistory])

  return (

    <div className="grid md:grid-cols-5 text-center gap-1">

      <div className="absolute text-gray-300 font-extrabold inline p-2">Smart-Bot</div>

      <select className="md:hidden text-white fixed bottom-20">
        <option value="">Dark</option>
        <option value="">Light</option>
      </select>

      {/* // mobile menu */}
      <Menu onClick={() => setSidebarOpen(true)} className="text-white cursor-pointer md:hidden relative top-3 ml-auto right-3" />

      <MobileSidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} history={recentHistory} setSelectedHistory={setSelectedHistory} handleDeleteHistory={handleDeleteHistory} />

      {/* // Left Sidebar for medium screen and above*/}
      <div className="md:col-span-1 bg-zinc-800 pt-15 hidden md:block">
        <h1 className="text-xl text-white font-semibold">Recent Search</h1>
        <ul className="text-left overflow-auto px-1">
          {
            recentHistory && recentHistory.map((item, index) => (
              <div key={index} className="flex items-center gap-1 justify-between hover:bg-zinc-600 px-1 rounded-sm">
                <li onClick={() => setSelectedHistory(item)} className="text-zinc-400 text-ellipsis line-clamp-1 w-full hover:cursor-pointer hover:text-zinc-300">{item}</li>
                <Trash onClick={() => handleDeleteHistory(index)} size={15} className="text-zinc-400 hover:cursor-pointer hover:text-zinc-300" />
              </div>
            ))
          }
        </ul>
      </div>

      {/* right part */}
      <div className="grid-cols-5 md:col-span-4 flex flex-col p-8 h-screen ">
        <h1 className="text-xl sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-pink-700 to-violet-700 font-semibold mb-1">Hello user, Ask me Anything </h1>
        <div ref={scrollToAnswer} className="container text-white flex-1 overflow-y-auto hide-scrollbar py-3 rounded-md">
          <ul>
            {messages.map((item, index) => (
              <div key={index} className={item.type === "q" ? "flex justify-end" : ""}>
                {item.type === "q" ? (
                  <li className="text-right my-3 bg-zinc-800 w-fit p-2 rounded-tl-4xl rounded-bl-4xl rounded-br-4xl">
                    <Answer answer={item.text} index={index} type={item.type} />
                  </li>
                ) : item.loading ? (
                  <li className="text-left p-1">
                    <Loader className="animate-spin" />
                  </li>
                ) : (

                  <div className="bg-zinc-800 w-fit  rounded-bl-xl rounded-tr-xl rounded-br-xl px-2 py-1">
                    {Array.isArray(item.text) &&
                      item.text.map((ansItem, ansIndex) => (
                        <li
                          key={ansIndex}
                          className="text-left mt-1 "
                        >
                          <Answer answer={ansItem} totalResult={1} index={ansIndex} type={item.type} />
                        </li>
                      ))}</div>
                )}
              </div>
            ))}
          </ul>

        </div>
        <div className="bg-zinc-800 text-white w-full lg:w-1/2 m-auto rounded-full border border-zinc-600 h-14 sticky bottom-5">
          <form className="flex items-center h-full pr-2" onSubmit={(event) => {
            event.preventDefault()
            handleAskQuestion()
          }}>
            <input
              type="text"
              value={question}
              placeholder="Ask me anything"
              className="w-full h-full p-3 outline-none"
              onChange={(event) => setQuestion(event.target.value)}
            />
            {
              loading ? (<button type="button" className="hover:cursor-pointer bg-zinc-200 hover:bg-neutral-600 hover:text-white text-black rounded-full w-9 h-8 flex items-center justify-center " onClick={handleStopAskQuestion}><FaSquare /></button>) : (
                <button
                  type="submit"
                  disabled={!question}
                  className="hover:cursor-pointer bg-zinc-200 hover:bg-neutral-600 hover:text-white text-black rounded-full w-9 h-8 flex items-center justify-center " onClick={handleAskQuestion}><FaArrowUp /></button>)

            }
          </form>
        </div>
      </div>
    </div>
  )
}

export default App
