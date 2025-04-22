import { createRoot } from "https://esm.sh/react-dom@19.1.0/client";
import { useState } from "https://esm.sh/react@19.1.0";
import * as cheerio from "https://esm.sh/cheerio";
import TurndownService from "https://esm.sh/turndown";
import { gfm } from "https://esm.sh/joplin-turndown-plugin-gfm";

function Message({ from, content }) {
  if (from === "system") {
    return <></>;
  }

  return (
    <div
      className={
        "_BookBar__Message __BookBar__font-sans __BookBar__backdrop-blur-sm __BookBar__rounded-lg __BookBar__flex __BookBar__mx-5 __BookBar__items-center __BookBar__gap-1 __BookBar__text-white" +
        " " +
        (from === "user"
          ? "__Bookbar_message_user"
          : "__Bookbar_glowing-box_only_background")
      }
    >
      {content}
    </div>
  );
}

function App() {
  const [chat, setChat] = useState([
    {
      role: "system",
      content:
        "You are an helpful assistant that responds to questions about a given webpage content in markdown format. You will be given the content of a webpage, and you will respond with a markdown formatted text that is easy to read. You will not include any HTML tags in your response. You will not include any links in your response. You will not include any markdown formatting in your response. Try responding in not many characters and be concise. Here is the content of the webpage: " +
        getReadablePage(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  function getReadablePage() {
    const content = document.body.innerHTML;
    const content_no_bookbar =
      content.split("__BOOKBAR__")[0] + content.split("__BOOKBAR__")[2];

    const $ = cheerio.load(content_no_bookbar);
    $("script").remove();
    $("style").remove();
    $("meta").remove();
    $("link").remove();
    $("noscript").remove();
    const cleanedHtml = $.html();

    const turndownService = new TurndownService();
    turndownService.addRule("inlineLink", {
      filter: function (node, options) {
        return (
          options.linkStyle === "inlined" &&
          node.nodeName === "A" &&
          node.getAttribute("href")
        );
      },
      replacement: function (content, node) {
        var href = node.getAttribute("href").trim();
        var title = node.title ? ' "' + node.title + '"' : "";
        return "[" + content.trim() + "](" + href + title + ")\n";
      },
    });

    turndownService.use(gfm);
    let markdownContent = turndownService.turndown(cleanedHtml);

    let insideLinkContent = false;
    let newMarkdownContent = "";
    let linkOpenCount = 0;
    for (let i = 0; i < markdownContent.length; i++) {
      const char = markdownContent[i];
      if (char == "[") {
        linkOpenCount++;
      } else if (char == "]") {
        linkOpenCount = Math.max(0, linkOpenCount - 1);
      }
      insideLinkContent = linkOpenCount > 0;
      if (insideLinkContent && char == "\n") {
        newMarkdownContent += "\\" + "\n";
      } else {
        newMarkdownContent += char;
      }
    }
    markdownContent = newMarkdownContent;

    markdownContent = markdownContent.replace(
      /\[Skip to Content\]\(#[^\)]*\)/gi,
      ""
    );

    return markdownContent;
  }

  async function askAI() {
    const query = document.getElementById("__BookBar_query").value;

    const newChat = [
      ...chat,
      {
        role: "user",
        content: query,
      },
    ];

    setChat(newChat);

    document.getElementById("__BookBar_query").value = "";

    setIsLoading(true);
    const response = await fetch("https://ai.hackclub.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: newChat,
      }),
    });
    const data = await response.json();

    const newerChat = [
      ...newChat,
      { role: "assistant", content: data["choices"][0]["message"]["content"] },
    ];

    setChat(newerChat);
    setIsLoading(false);
  }

  return (
    <>
      <div className="_BookBar__Bar __BookBar__backdrop-blur-sm __BookBar__rounded-lg __BookBar__flex __BookBar__m-5 __BookBar__p-1 __BookBar__items-center __BookBar__gap-1 __Bookbar_glowing-box __BookBar__text-white">
        <span className="_BookBar__hidden">__BOOKBAR__</span>
        <input
          type="text"
          name="Query"
          id="__BookBar_query"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              askAI();
            }
          }}
          className="__BookBar__placeholder __BookBar__text-white _BookBar__Input __BookBar__bg-transparent __BookBar__font-sans __BookBar__pl-1 __BookBar__focus:ring-none __BookBar__focus:outline-none __BookBar__focus:border-none __BookBar__text-sm __BookBar__w-xs"
          placeholder="Ask anything..."
        />
        <svg
          onClick={askAI}
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="__BookBar__p-0.5 __BookBar__cursor-pointer __BookBar__hover:bg-black/30 __BookBar__rounded-md"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" />
          <path d="M6 12h16" />
        </svg>
      </div>

      <div className="__BookBar_messagebox __BookBar__font-sans">
        {chat.map((message, index) => (
          <Message key={index} from={message.role} content={message.content} />
        ))}
      </div>

      {isLoading && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
          className="__BookBar_loading"
        >
          <circle cx="4" cy="12" r="3" fill="currentColor">
            <animate
              id="svgSpinners3DotsFade0"
              fill="freeze"
              attributeName="opacity"
              begin="0;svgSpinners3DotsFade1.end-0.25s"
              dur="0.75s"
              values="1;.2"
            ></animate>
          </circle>
          <circle cx="12" cy="12" r="3" fill="currentColor" opacity=".4">
            <animate
              fill="freeze"
              attributeName="opacity"
              begin="svgSpinners3DotsFade0.begin+0.15s"
              dur="0.75s"
              values="1;.2"
            ></animate>
          </circle>
          <circle cx="20" cy="12" r="3" fill="currentColor" opacity=".3">
            <animate
              id="svgSpinners3DotsFade1"
              fill="freeze"
              attributeName="opacity"
              begin="svgSpinners3DotsFade0.begin+0.3s"
              dur="0.75s"
              values="1;.2"
            ></animate>
          </circle>
        </svg>
      )}

      <span className="_BookBar__hidden">__BOOKBAR__</span>
    </>
  );
}

createRoot(document.getElementById("_BookBar")).render(<App />);
console.log("[BookBar] Loaded!");
