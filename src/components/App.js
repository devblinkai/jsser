import "./App.css";
import Editor from "./editor/Editor";
import React, { useState, useEffect, useRef } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import Modal from "./modal/Modal";
import {
  createWrappedJs,
  extractCodeFromScraped,
  formatCSS,
  formatHTML,
  formatJavaScript,
  getDefaultCode,
  replaceHtml,
  updateCSS,
} from "../utils/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faCompress } from "@fortawesome/free-solid-svg-icons";
import myImage from "../assets/jsserlogo.png";
import { sendPrompt } from "../api/apiService";
import ZipExtractor from "./zipFile/ZipExtractor";
import ZipDownloader from "./zipFile/ZipDownloader";
import UpdateApiKey from "./updateAPIkey/UpdateApiKey";
import UpdateApiKeyModal from "./updateAPIkey/UpdateApiKeyModal";
// import { getUserDetails, setLimitReached } from "../utils/localStorage";
import { processPrompt } from "../services/openai.services";

function App() {
  const [html, setHtml] = useLocalStorage("html", "");
  const [css, setCss] = useLocalStorage("css", "");
  const [js, setJS] = useLocalStorage("javascript", "");
  const extractedCode = useRef("");
  const selectedHtml = useRef("");
  const selectedCss = useRef("");

  const [srcDoc, setSrcDOC] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isUpdateKeyOpen, setIsupdateKeyOpen] = useState(false);
  const [error, setError] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([]);

 

  useEffect(() => {
    if (!html && !css && !js) {
      setHtml(getDefaultCode("html"));
      setCss(getDefaultCode("css"));
      setJS(getDefaultCode("js"));
      setEditorKey((prevKey) => prevKey + 1);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const wrappedJs = createWrappedJs(js);

      setSrcDOC(`
        <!DOCTYPE html>
        <html>
          <body>${html}</body>
          <style>${css}</style>
          <script>${wrappedJs}</script>
        </html>
      `);
    }, 250);

    return () => clearTimeout(timeout);
  }, [html, css, js]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === "jsError") {
        setError(event.data.message);
      } else if (event.data.type === "selectedElement") {
        extractedCode.current = event.data.info.current.html;
        console.log(event.data.info.current.html);

        const finalCode = extractCodeFromScraped(
          event.data.info.current.html,
          html,
          css
        );
        console.log("the final code-------->", finalCode);
        selectedHtml.current = finalCode.html;
        selectedCss.current = finalCode.css;
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, [html, css]);

  const handleFullscreenToggle = () => {
    setFullscreen((prev) => !prev);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  // ==============================================================================================
  const handleSend = async (setInputValue, prompt, setShowUpdateApiKey) => {
    try {
      setLoading(true);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", content: prompt },
      ]);
  
      const responseData = await processPrompt({
        html: !selectedHtml.current ? html : null,
        css: !selectedHtml.current ? css : null,
        js: js || "<js code here>",
        selectedHtml: selectedHtml.current,
        selectedCss: selectedCss.current,
        error: error || "",
        messages: messages,
        prompt: prompt,
      });
  
      if (!responseData) {
        throw new Error("No response data received");
      }
  
      console.log("Response data:", responseData);
  
      const newHtml = formatHTML(
        selectedHtml.current
          ? replaceHtml(html, selectedHtml.current, responseData.html)
          : responseData.html
      );
      console.log("Processed HTML:", newHtml);
      
      const newCss = formatCSS(
        selectedHtml.current
          ? updateCSS(css, responseData.css)
          : responseData.css
      );
      const newJs = formatJavaScript(responseData.js);
  
      const gptResponse = responseData.response;
  
      setHtml(newHtml);
      setCss(newCss);
      setJS(newJs);
  
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: `{html: "<html code>", css: "<css code>", js: "<js code>", response: ${gptResponse}}`,
        },
      ]);
  
      setEditorKey((prevKey) => prevKey + 1);
    } catch (error) {
      console.error("Error in handleSend:", error);
      
      if (error.message === "API_KEY_MISSING") {
        setShowUpdateApiKey(true);
        // setLimitReached();
      } else {
        console.error(
          "Error communicating with OpenAI API:",
          error.message
        );
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "error",
            content: "Some unexpected error occurred. Please try again.",
          },
        ]);
        setInputValue(prompt);
      }
    } finally {
      setLoading(false);
      selectedHtml.current = "";
      selectedCss.current = "";
    }
  };
  // =======================================================================================================
  const handleZipExtracted = (_html, _css, _js) => {
    setHtml(_html);
    setCss(_css);
    setJS(_js);
    setEditorKey((prevKey) => prevKey + 1);
  };

  const openUpdateModal = () => {
    setIsModalOpen(false);
    setIsupdateKeyOpen(true);
  };

  const closeUpdateModal = () => {
    setIsupdateKeyOpen(false);
  };

  return (
    <>
      <div
        key={editorKey}
        className={`pane top-pane ${fullscreen ? "hidden" : ""}`}
      >
        <Editor
          displayName="HTML"
          language="xml"
          value={html}
          onChange={setHtml}
        />
        <Editor
          displayName="CSS"
          language="css"
          value={css}
          onChange={setCss}
        />
        <Editor
          displayName="JS"
          language="javascript"
          value={js}
          onChange={setJS}
        />
        <img width="100px" src={myImage} alt="My PNG" />
      </div>
      <div
        className={`pane iframe-container ${fullscreen ? "fullscreen" : ""}`}
      >
        <iframe
          srcDoc={srcDoc}
          title="output"
            sandbox="allow-forms allow-same-origin allow-scripts allow-popups allow-modals allow-pointer-lock allow-top-navigation allow-downloads allow-presentation"
          width="100%"
          height="100%"
        />
        <div className="button-container">
          <button
            className="fullscreen-toggle-btn"
            onClick={handleFullscreenToggle}
          >
            <FontAwesomeIcon icon={fullscreen ? faCompress : faExpand} />
          </button>
          <div className="zip-extractor-btn">
            <ZipExtractor onZipExtracted={handleZipExtracted} />
          </div>
          <div className="zip-extractor-btn">
            <ZipDownloader html={html} css={css} js={js} />
          </div>
          <div className="zip-extractor-btn">
            <UpdateApiKey onClick={openUpdateModal} />
          </div>
        </div>

        {!isModalOpen && (
          <button className="open-modal-btn" onClick={handleOpenModal}>
            Prompt
          </button>
        )}
      </div>
      {isModalOpen && (
        <Modal
          title="Prompt Modal"
          onClose={handleCloseModal}
          onSend={handleSend}
          isLoading={loading}
          messages={messages}
        />
      )}
      {isUpdateKeyOpen && <UpdateApiKeyModal onClose={closeUpdateModal} />}
    </>
  );
}

export default App;
