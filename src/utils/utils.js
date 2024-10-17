
export const createWrappedJs = (js) => {
  return `
    try {
      ${js}
      
      let selectedElement = null;
      const borderMap = new WeakMap();
  
      function getAllNestedElements(element) {
        const nestedElements = [];
        function traverse(node) {
          nestedElements.push({
            tagName: node.tagName,
            id: node.id,
            className: node.className,
            html: node.outerHTML,
            css: window.getComputedStyle(node).cssText
          });
          for (let child of node.children) {
            traverse(child);
          }
        }
        traverse(element);
        return nestedElements;
      }
  
      function storeBorderStyles(element) {
        if (!borderMap.has(element)) {
          borderMap.set(element, {
            border: element.style.border,
            borderWidth: element.style.borderWidth,
            borderStyle: element.style.borderStyle,
            borderColor: element.style.borderColor
          });
        }
      }
  
      function restoreBorderStyles(element) {
        if (borderMap.has(element)) {
          const originalStyles = borderMap.get(element);
          element.style.border = originalStyles.border;
          element.style.borderWidth = originalStyles.borderWidth;
          element.style.borderStyle = originalStyles.borderStyle;
          element.style.borderColor = originalStyles.borderColor;
        } else {
          element.style.border = '';
        }
      }
   
      document.body.addEventListener('mouseover', (event) => {
        const target = event.target;
        if (target !== selectedElement) {
          storeBorderStyles(target);
          target.style.border = '2px solid red';
        }
      });
  
      document.body.addEventListener('mouseout', (event) => {
        const target = event.target;
        if (target !== selectedElement) {
          restoreBorderStyles(target);
        }
      });
  
      document.body.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        
        if (selectedElement) {
          restoreBorderStyles(selectedElement);
        }
        
        selectedElement = event.target;
        
        storeBorderStyles(selectedElement);
        
        // Temporarily remove any non-default border for extraction
        restoreBorderStyles(selectedElement);
        
        const elementInfo = {
          current: {
            tagName: selectedElement.tagName,
            id: selectedElement.id,
            className: selectedElement.className,
            html: selectedElement.outerHTML,
            css: window.getComputedStyle(selectedElement).cssText
          },
          nested: getAllNestedElements(selectedElement)
        };
        
        // Send message to parent window
        window.parent.postMessage({ type: 'selectedElement', info: elementInfo }, '*');
        
        // Apply green border for visual feedback, preserving the default border if it exists
        const originalBorder = borderMap.get(selectedElement);
        if (originalBorder && originalBorder.border) {
          selectedElement.style.border = originalBorder.border;
          selectedElement.style.borderColor = 'green';
        } else {
          selectedElement.style.border = '2px solid green';
        }
      });
  
    } catch (error) {
      window.parent.postMessage({ type: 'jsError', message: error.message }, '*');
    } 
  `;
};

// Function to remove all formatting from HTML and normalize quotation marks
// export const unformatHTML = (html) => {
//   return html
//     .replace(/>\s+</g, '><')  // Remove whitespace between tags
//     .replace(/\s+/g, ' ')     // Replace multiple spaces with a single space
//     .replace(/'\s+/g, "'")    // Remove space after single quotes
//     .replace(/"\s+/g, '"')    // Remove space after double quotes
//     .replace(/\s+'/g, "'")    // Remove space before single quotes
//     .replace(/\s+"/g, '"')    // Remove space before double quotes
//     .replace(/'/g, '"')       // Replace all single quotes with double quotes
//     .trim();                  // Remove leading and trailing whitespace
// };

// export const replaceHtml = (mainHtml, scrapedHtml, updatedHtml) => {
//   // Unformat all HTML strings
//   const unformattedMainHtml = unformatHTML(mainHtml);
//   const unformattedScrapedHtml = unformatHTML(scrapedHtml);
//   const unformattedUpdatedHtml = unformatHTML(updatedHtml);

//   console.log("the MAIN html in REPLACE-------->", unformattedMainHtml);
//   console.log("the scrapped html in REPLACE-------->", unformattedScrapedHtml);
//   console.log("the updated html in REPLACE-------->", unformattedUpdatedHtml);

//   // Perform the replacement on unformatted strings
//   const unformattedFinalHtml = unformattedMainHtml.replace(unformattedScrapedHtml, unformattedUpdatedHtml);

//   console.log("the final html in replace (unformatted)-------->", unformattedFinalHtml);

  
//   return unformattedFinalHtml;
// };


function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Function to calculate similarity percentage
function calculateSimilarity(str1, str2) {
  const maxLength = Math.max(str1.length, str2.length);
  const distance = levenshteinDistance(str1, str2);
  return ((maxLength - distance) / maxLength) * 100;
}

// Improved replaceHtml function with fuzzy matching
export const replaceHtml = (mainHtml, scrapedHtml, updatedHtml, similarityThreshold = 50) => {
  console.log("Main HTML:", mainHtml);
  console.log("Scraped HTML:", scrapedHtml);
  console.log("Updated HTML:", updatedHtml);

  const mainTokens = mainHtml.split(/(<[^>]+>)/);
  const scrapedTokens = scrapedHtml.split(/(<[^>]+>)/);

  let bestMatchStartIndex = -1;
  let bestMatchEndIndex = -1;
  let bestMatchSimilarity = 0;

  for (let i = 0; i < mainTokens.length - scrapedTokens.length + 1; i++) {
    const mainSection = mainTokens.slice(i, i + scrapedTokens.length).join('');
    const similarity = calculateSimilarity(mainSection, scrapedHtml);

    if (similarity > bestMatchSimilarity) {
      bestMatchSimilarity = similarity;
      bestMatchStartIndex = i;
      bestMatchEndIndex = i + scrapedTokens.length;
    }
  }

  console.log(`Best match similarity: ${bestMatchSimilarity.toFixed(2)}%`);

  if (bestMatchSimilarity >= similarityThreshold) {
    const finalHtml = [
      ...mainTokens.slice(0, bestMatchStartIndex),
      updatedHtml,
      ...mainTokens.slice(bestMatchEndIndex)
    ].join('');

    console.log("Final HTML:", finalHtml);
    return finalHtml;
  } else {
    console.error(`No match found above ${similarityThreshold}% similarity threshold`);
    return mainHtml;  // Return original if no good match found
  }
};

export const updateCSS = (oldCSS, newCSS) => {
  // console.log("old css------->", oldCSS);
  // console.log("new css------->", newCSS);
  
  
  // Parse the old and new CSS
  const oldRules = parseCSS(oldCSS);
  const newRules = parseCSS(newCSS);

  // Replace old rules with new rules
  Object.assign(oldRules, newRules);

  // Convert the updated rules back to a CSS string
  return convertToCSS(oldRules);
}

function parseCSS(css) {
  const rules = {};
  const ruleRegex = /([^\{]+)\{([^\}]+)\}/g;
  let match;

  while ((match = ruleRegex.exec(css)) !== null) {
      const selector = match[1].trim();
      const properties = match[2].trim();
      rules[selector] = properties;
  }

  return rules;
}

function convertToCSS(rules) {
  let css = '';
  for (const selector in rules) {
      css += `${selector} {\n${rules[selector]}\n}\n`;
  }
  return css;
}






// ===========================================================================================



export const extractCodeFromScraped =(scrapedHtml, completeHtml, completeCss)=> {
  // console.log("css------>", css);

  // Function to normalize whitespace and quotes
  const normalizeHtml = (str) =>
    str.replace(/\s+/g, " ").replace(/['"`]/g, '"').trim();

  // Normalize both scraped and complete HTML
  const normalizedScrapedHtml = normalizeHtml(scrapedHtml);
  const normalizedCompleteHtml = normalizeHtml(completeHtml);

  // Extract the original HTML using fuzzy matching
  let extractedHtml = findClosestMatch(
    normalizedScrapedHtml,
    normalizedCompleteHtml
  );

  if (!extractedHtml) {
    console.error("Couldn't find a close match in the complete HTML.");
    return null;
  }

  // Extract the CSS
  const extractedCss = extractRelevantCss(extractedHtml, completeCss);

  return {
    html: extractedHtml,
    css: extractedCss,
  };
}

function findClosestMatch(scrapedHtml, completeHtml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(completeHtml, "text/html");
  const allElements = doc.getElementsByTagName("*");

  let bestMatch = null;
  let bestMatchScore = 0;

  for (let element of allElements) {
    const elementHtml = normalizeHtml(element.outerHTML);
    const score = similarity(scrapedHtml, elementHtml);
    if (score > bestMatchScore) {
      bestMatchScore = score;
      bestMatch = element;
    }
  }

  return bestMatch ? bestMatch.outerHTML : null;
}

function similarity(s1, s2) {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  const longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
  return (
    (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength)
  );
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  const costs = new Array();
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function extractRelevantCss(html, completeCss) {
  const relevantSelectors = new Set();

  // Extract all ids, classes, and tag names from the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const elements = doc.getElementsByTagName("*");

  for (let element of elements) {
    if (element.id) {
      relevantSelectors.add("#" + element.id);
    }
    if (element.className) {
      element.className.split(/\s+/).forEach((cls) => {
        if (cls) relevantSelectors.add("." + cls);
      });
    }
    relevantSelectors.add(element.tagName.toLowerCase());
  }

  // Add parent selectors and universal selector
  relevantSelectors.add("body");
  relevantSelectors.add("html");
  relevantSelectors.add("*");

  // Filter CSS rules
  const relevantRules = [];
  const cssRules = completeCss.match(/[^{}]+\{[^{}]+\}/g) || [];

  cssRules.forEach((rule) => {
    const [selectors, styles] = rule.split("{");
    const selectorList = selectors.split(",").map((s) => s.trim());
    if (
      selectorList.some(
        (selector) =>
          relevantSelectors.has(selector) ||
          [...relevantSelectors].some((s) => selector.includes(s))
      )
    ) {
      relevantRules.push(rule.trim());
    }
  });

  return relevantRules.join("\n");
}

function normalizeHtml(str) {
  return str.replace(/\s+/g, " ").replace(/['"`]/g, '"').trim();
}



// ===============================================================================================

/**
 * Format HTML code with proper indentation and line breaks.
 *
 * @param {string} html - The HTML code to format.
 * @returns {string} - The formatted HTML code.
 */
export const formatHTML = (html) => {
  console.log("INSIDE FORMAT HTML");

  let formatted = "";
  let pad = 0;

  // Use newline character suitable for different platforms
  const newline = "\n";

  // Add line breaks between tags
  html = html.replace(/>\s*</g, `>${newline}<`);

  // Split by new lines
  html.split(newline).forEach((line) => {
    line = line.trim(); // Trim any excess whitespace

    if (line.match(/^<\/\w/)) {
      // Decrease indent level before closing tag
      pad -= 1;
    }

    const indent = "  ".repeat(pad); // Indentation based on current pad level
    if (line) {
      formatted += indent + line + newline; // Add line with proper indentation
    }

    if (line.match(/^<\w[^>]*[^\/]>$/)) {
      // Increase indent level after opening tag
      pad += 1;
    }
  });

  return formatted.trim(); // Trim the final result to remove any trailing newlines
};

/**
 * Format CSS code with proper indentation.
 *
 * @param {string} css - The CSS code to format.
 * @returns {string} - The formatted CSS code.
 */
export const formatCSS = (css) => {
  console.log("INSIDE FORMAT CSS");

  let formatted = "";
  let pad = 0;
  const indent = "  "; // Two spaces for each indentation level

  // Remove extra spaces around braces and semicolons
  css = css
    .replace(/\s*({|})\s*/g, "$1") // Remove spaces around braces
    .replace(/\s*;\s*/g, ";") // Remove spaces around semicolons
    .replace(/\s+/g, " "); // Replace multiple spaces with a single space

  // Split the CSS by braces, semicolons, and selectors
  css.split(/({|}|;|\s*(?=[\.#\[]))/).forEach((token) => {
    token = token.trim(); // Trim unnecessary whitespace

    if (!token) return; // Skip empty tokens

    if (token === "}") {
      // Decrease padding before closing brace
      pad -= 1;
      formatted += "\n" + indent.repeat(pad) + token + "\n";
    } else if (token === "{") {
      // Increase padding after opening brace
      formatted += " " + token + "\n";
      pad += 1;
    } else if (token.endsWith(";")) {
      // Regular CSS property
      formatted += indent.repeat(pad) + token + "\n";
    } else if (/^[\.#\[]/.test(token)) {
      // CSS selector or media query
      formatted += indent.repeat(pad) + token;
    } else {
      // Regular CSS declaration or property
      formatted += token;
    }
  });

  return formatted.trim(); // Trim the final result to remove any trailing newlines
};

/**
 * Format JavaScript code with proper indentation.
 *
 * @param {string} jsCode - The JavaScript code to format.
 * @returns {string} - The formatted JavaScript code.
 */
export const formatJavaScript = (jsCode) => {
  let formatted = "";
  let pad = 0;
  const indent = "  "; // Two spaces for each indentation level

  // Remove any existing line breaks and extra spaces
  jsCode = jsCode.replace(/\s*({|}|\(|\)|;)\s*/g, "$1").replace(/\s+/g, " ");

  // Split the code by braces, parentheses, and semicolons
  jsCode.split(/({|}|\(|\)|;)/).forEach((token) => {
    token = token.trim(); // Remove unnecessary spaces

    if (!token) return; // Skip empty tokens

    if (token === "}") {
      // Decrease padding before closing brace
      pad -= 1;
      formatted += "\n" + indent.repeat(pad) + token + "\n";
    } else if (token === "{") {
      // Increase padding after opening brace
      formatted += " " + token + "\n";
      pad += 1;
    } else if (token === ";") {
      // Add semicolon at the end of the line
      formatted += token + "\n" + indent.repeat(pad);
    } else if (token === "(" || token === ")") {
      // Keep parentheses in the same line
      formatted += token;
    } else {
      // Regular JavaScript expression or statement
      formatted += indent.repeat(pad) + token;
    }
  });

  return formatted.trim();
};

export const getRandomLoadingMessage = () => {
  const messages = [
    "AI is processing your request... 🤖",
    "Letting the AI compute your code... 🧠",
    "AI is working its magic... ✨",
    "AI is crafting your code... 🛠️",
    "AI is analyzing your prompt... 📊",
    "Decoding with AI... 🔍",
    "AI is designing your solution... 🧩",
    "AI is generating your code snippet... 📥",
    "AI is brainstorming your solution... 💭",
    "AI is constructing your code... 🏗️",
    "AI is on the job... 🚀",
    "AI is assembling your code... 🔄",
    "AI is optimizing your prompt... ⚙️",
    "AI is fine-tuning your request... 🎛️",
    "AI is synthesizing your code... 🧬",
    "AI is decoding your needs... 📜",
    "AI is preparing your code... 🎨",
    "AI is composing your solution... 📝",
    "AI is orchestrating your code... 🎻",
    "AI is crafting the perfect response... 🤖✨",
  ];

  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

export const getDefaultCode = (language) => {
  switch (language) {
    case "html":
      return `<!DOCTYPE html>
<html lang='en' >
  <head>
    <meta charset='UTF-8'>
      <title>CodePen - Untitled</title>
    </head>
    <body>
      <header style='display: flex; justify-content: start;'>
        <div id='logo'>
          <img src='https://raw.githubusercontent.com/sajithamma/jsser/dev/public/favicon.ico?token=GHSAT0AAAAAACS444FXYFUD75SGMKRTWROUZXFPCYA' alt='Jsser Logo' style='width: 100px;'/>
        </div>
      </header>
      <section id='hero' style='text-align: center;'>
        <h1>Transform Your Prompts into Code with Jsser – Your AI Coding Assistant</h1>
        <p>Jsser leverages AI to generate HTML, CSS, and JavaScript code based on your prompts. Simplify your coding process and focus on creativity.</p>
        <button>Try Jsser Now</button>
      </section>
    </body>
  </html>`;
    case "css":
      return `body {
font-family: Arial, sans-serif  ;
background:  #43C6AC  ;
background: -webkit-linear-gradient(to right,  #F8FFAE,  #43C6AC)  ;
background: linear-gradient(to right,  #F8FFAE,  #43C6AC)  ;

}
#logo {
font-size: 2em  ;

}
#hero {
padding: 50px  ;
color:  #006400  ;

}
#hero h1 {
font-size: 2  .5em  ;

}
#hero p {
color:  #000000  ;
font-size: 1  .5em  ;

}
#hero button {
background-color:  #20bf55  ;
color: white  ;
padding: 10px 20px  ;
border: none  ;
border-radius: 5px  ;

}`;
    default:
      return "console.log('Hello, World!');";
  }
};
