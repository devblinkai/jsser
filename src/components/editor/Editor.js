import React from "react";
import "react-codemirror/node_modules/codemirror/lib/codemirror.css";
import "react-codemirror/node_modules/codemirror/theme/material-darker.css";
import "react-codemirror/node_modules/codemirror/mode/xml/xml";
import "react-codemirror/node_modules/codemirror/mode/javascript/javascript";
import "react-codemirror/node_modules/codemirror/mode/css/css";
import CodeMirror from "react-codemirror";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import "./Editor.css";

export default function Editor(props) {
  const { displayName, value, onChange, language } = props;
  const [editor, setEditor] = React.useState(null);

  function handleChange(editorInstance, data, value) {
    onChange(editorInstance); // Pass the updated value to parent
  }

  function handleCopy() {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        alert("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  }

  return (
    <div className="editor-container">
      <div className="editor-title">
        {displayName}
        <button onClick={handleCopy} className="copy-to-clipboard-btn">
          <FontAwesomeIcon icon={faCopy} />
        </button>
      </div>
      <CodeMirror
        value={value}
        onChange={handleChange}
        className="codemirror-wrapper"
        options={{
          lineWrapping: true,
          mode: language,
          lineNumbers: true,
          theme: "material-darker",
        }}
        ref={(editorInstance) => setEditor(editorInstance)}
      />
    </div>
  );
}
